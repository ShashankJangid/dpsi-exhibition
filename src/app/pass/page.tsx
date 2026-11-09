'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  OFFICIAL_STUDENTS_ROSTER,
  PROPRIETARY_ACCESS_CODES,
  StudentEntry,
} from '@/data/exhibitionRegistry';
import {
  ShieldCheck,
  Printer,
  Download,
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  Camera,
  Users,
  Award,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  FileSpreadsheet,
  RefreshCw,
  KeyRound,
  UserCheck,
  Check,
  Clock,
} from 'lucide-react';

type RoleType = 'EXHIBITOR' | 'INCHARGE' | 'STAFF' | 'JUDGE' | 'VIP' | 'VISITOR';

interface AttendanceRecord {
  studentName: string;
  classSection: string;
  projectNumber: number;
  projectTitle: string;
  mentor: string;
  passCode: string;
  accessCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

const ROLE_CONFIG: Record<
  RoleType,
  {
    label: string;
    pillClass: string;
    borderClass: string;
    glowClass: string;
    accentColor: string;
    accessLevel: string;
    zoneAccess: string;
    badgeTitle: string;
  }
> = {
  EXHIBITOR: {
    label: 'STUDENT EXHIBITOR',
    pillClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    borderClass: 'border-cyan-500/50',
    glowClass: 'shadow-cyan-500/20',
    accentColor: '#06b6d4',
    accessLevel: 'TIER-1 INNOVATOR ACCESS',
    zoneAccess: 'ZONE 1 & 2 • ALL LABS',
    badgeTitle: 'OFFICIAL EXHIBITOR PASS',
  },
  INCHARGE: {
    label: 'FACULTY INCHARGE / MENTOR',
    pillClass: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    borderClass: 'border-rose-500/50',
    glowClass: 'shadow-rose-500/20',
    accentColor: '#f43f5e',
    accessLevel: 'SUPERVISORY COMMAND ACCESS',
    zoneAccess: 'ALL ZONES • MASTER COMMAND',
    badgeTitle: 'FACULTY INCHARGE PASS',
  },
  STAFF: {
    label: 'SUMMIT STAFF & OPS',
    pillClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    borderClass: 'border-emerald-500/50',
    glowClass: 'shadow-emerald-500/20',
    accentColor: '#10b981',
    accessLevel: 'OPERATIONS & COORDINATION',
    zoneAccess: 'ALL ZONES • STAFF CORRIDOR',
    badgeTitle: 'STAFF & OPERATIONS PASS',
  },
  JUDGE: {
    label: 'GRAND JURY EVALUATOR',
    pillClass: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    borderClass: 'border-purple-500/50',
    glowClass: 'shadow-purple-500/20',
    accentColor: '#a855f7',
    accessLevel: 'EXECUTIVE JURY CRITIQUE',
    zoneAccess: 'ALL BOOTHS • JURY PODIUM',
    badgeTitle: 'GRAND JURY EVALUATION PASS',
  },
  VIP: {
    label: 'DISTINGUISHED VIP DELEGATE',
    pillClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    borderClass: 'border-amber-500/50',
    glowClass: 'shadow-amber-500/20',
    accentColor: '#f59e0b',
    accessLevel: 'PRESIDENTIAL GUEST PROTOCOL',
    zoneAccess: 'ALL ZONES • VIP LOUNGE ACCESS',
    badgeTitle: 'VIP DISTINGUISHED PASS',
  },
  VISITOR: {
    label: 'PUBLIC VISITOR / ATTENDEE',
    pillClass: 'bg-slate-500/20 text-slate-300 border-slate-400/40',
    borderClass: 'border-slate-500/50',
    glowClass: 'shadow-slate-500/20',
    accentColor: '#94a3b8',
    accessLevel: 'GENERAL EXHIBITION VISITOR',
    zoneAccess: 'PUBLIC CORRIDORS & GALLERIES',
    badgeTitle: 'EXHIBITION ATTENDEE PASS',
  },
};

const ATTENDANCE_STORAGE_KEY = 'dpsi_exhibition_attendance_v1';

export default function PassAndAttendancePortal() {
  const [activeTab, setActiveTab] = useState<'generator' | 'attendance' | 'scanner'>('generator');

  // Generator State
  const [selectedRole, setSelectedRole] = useState<RoleType>('EXHIBITOR');
  const [accessCode, setAccessCode] = useState('');
  const [isCodeUnlocked, setIsCodeUnlocked] = useState(false);
  const [unlockedRoleName, setUnlockedRoleName] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentEntry | null>(() => {
    return OFFICIAL_STUDENTS_ROSTER.length > 0 ? OFFICIAL_STUDENTS_ROSTER[0] : null;
  });

  // Custom Fields (for VIP / Staff / Judge / Incharge)
  const [customName, setCustomName] = useState('');
  const [customOrg, setCustomOrg] = useState('');
  const [customDesignation, setCustomDesignation] = useState('');

  // Attendance State with safe lazy initialization
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return OFFICIAL_STUDENTS_ROSTER.map((s, idx) => ({
      studentName: s.student_name,
      classSection: s.class_section,
      projectNumber: s.project_number,
      projectTitle: s.project_title,
      mentor: s.mentor,
      passCode: `DPSI-EXH-${String(idx + 1).padStart(3, '0')}`,
      accessCode: s.pass_code,
      checkedIn: false,
    }));
  });

  const [attendanceClassFilter, setAttendanceClassFilter] = useState<string>('ALL');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
  const [isBatchPrintMode, setIsBatchPrintMode] = useState(false);

  // Scanner state
  const [scannerInputCode, setScannerInputCode] = useState('');
  const [scannedResult, setScannedResult] = useState<{
    found: boolean;
    student?: StudentEntry;
    record?: AttendanceRecord;
    message?: string;
  } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Hidden Offscreen Canvas for high-res PNG download
  const downloadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera stream cleanup helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const switchTab = (tab: 'generator' | 'attendance' | 'scanner') => {
    if (tab !== 'scanner') {
      stopCamera();
    }
    setActiveTab(tab);
  };

  // Cleanup camera streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Sync attendance state changes to localStorage
  const saveAttendance = (records: AttendanceRecord[]) => {
    setAttendanceList(records);
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // storage unavailable
    }
  };

  // Handle proprietary code verification
  const handleVerifyAccessCode = (input: string) => {
    const trimmed = input.trim().toUpperCase();
    setAccessCode(trimmed);

    if (trimmed === PROPRIETARY_ACCESS_CODES.STUDENT_DEFAULT) {
      setSelectedRole('EXHIBITOR');
      setIsCodeUnlocked(true);
      setUnlockedRoleName('Official Exhibitor Code Verified (987654)');
    } else if (trimmed === PROPRIETARY_ACCESS_CODES.TEACHER_INCHARGE) {
      setSelectedRole('INCHARGE');
      setIsCodeUnlocked(true);
      setUnlockedRoleName('Faculty Incharge / Mentor Privilege Granted');
    } else if (trimmed === PROPRIETARY_ACCESS_CODES.STAFF_OPS) {
      setSelectedRole('STAFF');
      setIsCodeUnlocked(true);
      setUnlockedRoleName('Staff & Summit Operations Privilege Granted');
    } else if (trimmed === PROPRIETARY_ACCESS_CODES.JUDGE_PANEL) {
      setSelectedRole('JUDGE');
      setIsCodeUnlocked(true);
      setUnlockedRoleName('Grand Jury Evaluation Privilege Granted');
    } else if (trimmed === PROPRIETARY_ACCESS_CODES.VIP_DELEGATE) {
      setSelectedRole('VIP');
      setIsCodeUnlocked(true);
      setUnlockedRoleName('Distinguished VIP Delegate Privilege Granted');
    } else {
      setIsCodeUnlocked(false);
      setUnlockedRoleName('');
    }
  };

  // Filtered student list for autocomplete
  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return OFFICIAL_STUDENTS_ROSTER.slice(0, 15);
    const q = studentSearchQuery.toLowerCase();
    return OFFICIAL_STUDENTS_ROSTER.filter(
      (s) =>
        s.student_name.toLowerCase().includes(q) ||
        s.class_section.toLowerCase().includes(q) ||
        s.project_title.toLowerCase().includes(q) ||
        s.pass_code.toLowerCase().includes(q) ||
        s.project_number.toString() === q
    ).slice(0, 20);
  }, [studentSearchQuery]);

  // Unique classes for filter
  const uniqueClasses = useMemo(() => {
    const set = new Set(OFFICIAL_STUDENTS_ROSTER.map((s) => s.class_section));
    return Array.from(set).sort();
  }, []);

  // Filtered attendance list
  const filteredAttendance = useMemo(() => {
    return attendanceList.filter((item) => {
      if (attendanceClassFilter !== 'ALL' && item.classSection !== attendanceClassFilter) {
        return false;
      }
      if (attendanceStatusFilter === 'PRESENT' && !item.checkedIn) {
        return false;
      }
      if (attendanceStatusFilter === 'ABSENT' && item.checkedIn) {
        return false;
      }
      if (attendanceSearchQuery.trim()) {
        const q = attendanceSearchQuery.toLowerCase();
        return (
          item.studentName.toLowerCase().includes(q) ||
          item.classSection.toLowerCase().includes(q) ||
          item.projectTitle.toLowerCase().includes(q) ||
          item.passCode.toLowerCase().includes(q) ||
          item.projectNumber.toString() === q
        );
      }
      return true;
    });
  }, [attendanceList, attendanceClassFilter, attendanceStatusFilter, attendanceSearchQuery]);

  // Attendance stats
  const totalStudentsCount = attendanceList.length;
  const presentStudentsCount = attendanceList.filter((s) => s.checkedIn).length;
  const absentStudentsCount = totalStudentsCount - presentStudentsCount;
  const attendanceRate = totalStudentsCount > 0 ? Math.round((presentStudentsCount / totalStudentsCount) * 100) : 0;

  // Toggle student check-in with composite key (studentName + projectNumber)
  const toggleCheckIn = (studentName: string, projectNumber: number) => {
    const updated = attendanceList.map((item) => {
      if (
        item.studentName.toLowerCase() === studentName.toLowerCase() &&
        item.projectNumber === projectNumber
      ) {
        const nextState = !item.checkedIn;
        return {
          ...item,
          checkedIn: nextState,
          checkedInAt: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        };
      }
      return item;
    });
    saveAttendance(updated);
  };

  // Mark all currently filtered students as present
  const markAllFilteredPresent = () => {
    const filteredCompositeKeys = new Set(
      filteredAttendance.map((f) => `${f.studentName.toLowerCase()}::${f.projectNumber}`)
    );
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = attendanceList.map((item) => {
      const key = `${item.studentName.toLowerCase()}::${item.projectNumber}`;
      if (filteredCompositeKeys.has(key)) {
        return {
          ...item,
          checkedIn: true,
          checkedInAt: item.checkedInAt || timeStr,
        };
      }
      return item;
    });
    saveAttendance(updated);
  };

  // Reset all attendance
  const resetAttendance = () => {
    if (confirm('Are you sure you want to reset all attendance records to Absent?')) {
      const reset = attendanceList.map((item) => ({
        ...item,
        checkedIn: false,
        checkedInAt: undefined,
      }));
      saveAttendance(reset);
    }
  };

  // Export attendance CSV with URL revoke
  const exportAttendanceCSV = () => {
    const headers = ['Pass ID', 'Student Name', 'Class & Section', 'Project #', 'Project Title', 'Mentor', 'Status', 'Check-In Time'];
    const rows = attendanceList.map((item) => [
      item.passCode,
      `"${item.studentName}"`,
      `"${item.classSection}"`,
      item.projectNumber,
      `"${item.projectTitle.replace(/"/g, '""')}"`,
      `"${item.mentor}"`,
      item.checkedIn ? 'PRESENT' : 'ABSENT',
      item.checkedInAt || 'N/A',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DPSI_Exhibition_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Verify and search card code in scanner
  const handleScanCode = (code: string) => {
    const cleaned = code.trim().toLowerCase();
    if (!cleaned) return;

    // Check project match: DPSI-EXH-001 or PROJ-36 or #36
    const exhMatch = cleaned.match(/^dpsi-exh-(\d+)$/i);
    const projMatch = cleaned.match(/^(?:proj-?|#)?(\d+)$/i);

    let matchedRecord = attendanceList.find((a) => a.passCode.toLowerCase() === cleaned);

    if (!matchedRecord && exhMatch) {
      const idx = parseInt(exhMatch[1], 10) - 1;
      if (idx >= 0 && idx < attendanceList.length) {
        matchedRecord = attendanceList[idx];
      }
    }

    if (!matchedRecord && projMatch) {
      const pNum = parseInt(projMatch[1], 10);
      matchedRecord = attendanceList.find((a) => a.projectNumber === pNum);
    }

    if (!matchedRecord) {
      matchedRecord = attendanceList.find(
        (a) =>
          a.studentName.toLowerCase().includes(cleaned) ||
          a.accessCode.toLowerCase() === cleaned
      );
    }

    if (matchedRecord) {
      const studentObj = OFFICIAL_STUDENTS_ROSTER.find(
        (s) =>
          s.student_name.toLowerCase() === matchedRecord?.studentName.toLowerCase() &&
          s.project_number === matchedRecord?.projectNumber
      );

      setScannedResult({
        found: true,
        student: studentObj,
        record: matchedRecord,
        message: 'Valid DPSI Exhibition Credential Found',
      });
    } else {
      // Role codes check
      const upper = code.trim().toUpperCase();
      if (
        upper === PROPRIETARY_ACCESS_CODES.TEACHER_INCHARGE ||
        upper === PROPRIETARY_ACCESS_CODES.JUDGE_PANEL ||
        upper === PROPRIETARY_ACCESS_CODES.STAFF_OPS ||
        upper === PROPRIETARY_ACCESS_CODES.VIP_DELEGATE
      ) {
        setScannedResult({
          found: true,
          message: `Official Summit Role Code Verified: ${upper}`,
        });
      } else {
        setScannedResult({
          found: false,
          message: `No active credential matched for "${code}". Please verify ID or student name.`,
        });
      }
    }
  };

  // Camera stream handler
  const toggleCameraScanner = async () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          streamRef.current = stream;
          setIsCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }
      } catch {
        alert('Camera access unavailable or blocked. You can still scan or check in students via their code or name lookup.');
        stopCamera();
      }
    }
  };

  // High-Resolution 2048x1280 CR-100 Canvas Download
  const handleDownloadVirtualPass = () => {
    const canvas = downloadCanvasRef.current;
    if (!canvas) return;

    const w = 2048;
    const h = 1280;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const roleConfig = ROLE_CONFIG[selectedRole];
    const isExhibitor = selectedRole === 'EXHIBITOR';

    const cardName = isExhibitor && selectedStudent ? selectedStudent.student_name : customName || 'OFFICIAL DELEGATE';
    const cardClass = isExhibitor && selectedStudent ? selectedStudent.class_section : customDesignation || roleConfig.label;
    const cardPassId = isExhibitor && selectedStudent ? `DPSI-EXH-${selectedStudent.project_number}` : `DPSI-2026-${selectedRole.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cardProject = isExhibitor && selectedStudent ? `#${selectedStudent.project_number} • ${selectedStudent.project_title}` : customOrg || 'DPSI TECH & INNOVATION SUMMIT';

    // 1. Dark Cyber Gradient Background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#090d16');
    bg.addColorStop(0.5, '#0d1527');
    bg.addColorStop(1, '#070a12');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle Radial Glow
    const glow = ctx.createRadialGradient(w * 0.2, h * 0.2, 50, w * 0.2, h * 0.2, 800);
    glow.addColorStop(0, `${roleConfig.accentColor}25`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // 2. High-Tech Grid & Holographic Security Lines
    ctx.strokeStyle = '#ffffff08';
    ctx.lineWidth = 2;
    for (let x = 60; x < w; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 60; y < h; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Outer Border Frame with Role Accent
    ctx.strokeStyle = roleConfig.accentColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Inner Delicate Double Border
    ctx.strokeStyle = '#ffffff25';
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, w - 110, h - 110);

    // 3. Top Header: DPS Indirapuram Lockup
    ctx.fillStyle = roleConfig.accentColor;
    ctx.font = 'bold 34px monospace';
    ctx.fillText('DELHI PUBLIC SCHOOL INDIRAPURAM', 100, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px sans-serif';
    ctx.fillText('TECH & INNOVATION SUMMIT 2026', 100, 220);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`OFFICIAL CREDENTIAL // ${roleConfig.badgeTitle}`, 100, 270);

    // Divider Line
    const divGrad = ctx.createLinearGradient(100, 310, w - 100, 310);
    divGrad.addColorStop(0, roleConfig.accentColor);
    divGrad.addColorStop(0.7, '#f59e0b');
    divGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = divGrad;
    ctx.fillRect(100, 305, w - 200, 4);

    // 4. Attendee Details
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('OFFICIAL CREDENTIAL HOLDER', 100, 410);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 76px sans-serif';
    ctx.fillText(cardName.toUpperCase(), 100, 490);

    // Role Tag Pill
    ctx.fillStyle = roleConfig.accentColor;
    ctx.fillRect(100, 525, 420, 60);
    ctx.fillStyle = '#090d16';
    ctx.font = '900 28px monospace';
    ctx.fillText(`ROLE: ${selectedRole}`, 125, 567);

    // Class / Designation
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('SECTION / AFFILIATION', 100, 660);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 42px monospace';
    ctx.fillText(cardClass, 100, 715);

    // Project / Allocation
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('ASSIGNED PROJECT / DIVISION', 100, 795);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px sans-serif';
    const cleanProj = cardProject.length > 55 ? cardProject.slice(0, 52) + '...' : cardProject;
    ctx.fillText(cleanProj, 100, 845);

    // Zone Access Chip
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(100, 890, 460, 50);
    ctx.strokeStyle = roleConfig.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 890, 460, 50);
    ctx.fillStyle = roleConfig.accentColor;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`ZONE CLEARANCE: ${roleConfig.zoneAccess}`, 120, 923);

    // 5. Right Side: Micro-QR and Security Hologram
    ctx.save();
    ctx.translate(w - 580, 400);

    // QR Canvas Frame
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 440, 440);
    ctx.strokeStyle = roleConfig.accentColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(-4, -4, 448, 448);

    // Draw Deterministic QR Pattern
    ctx.fillStyle = '#090d16';
    const drawFinder = (fx: number, fy: number) => {
      ctx.fillRect(fx, fy, 110, 110);
      ctx.clearRect(fx + 20, fy + 20, 70, 70);
      ctx.fillRect(fx + 35, fy + 35, 40, 40);
    };
    drawFinder(25, 25);
    drawFinder(305, 25);
    drawFinder(25, 305);

    // Hash dots based on student name / pass code
    const seed = cardPassId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    for (let r = 0; r < 14; r++) {
      for (let c = 0; c < 14; c++) {
        if ((r * 7 + c * 13 + seed) % 3 === 0) {
          ctx.fillRect(145 + c * 11, 145 + r * 11, 8, 8);
        }
      }
    }
    // Center security chip in QR
    ctx.fillStyle = roleConfig.accentColor;
    ctx.fillRect(195, 195, 50, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px monospace';
    ctx.fillText('DPSI', 202, 227);
    ctx.restore();

    // Pass ID under QR
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(cardPassId, w - 360, 900);
    ctx.textAlign = 'left';

    // 6. Footer Lockups & Credits
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('POWERED BY ☁ EXPO • DPS INDIRAPURAM', 100, 1180);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('DESIGNED & ENGINEERED BY OJAS SINGH (IX-A)', w - 100, 1180);
    ctx.textAlign = 'left';

    // Export image
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `DPSI_${selectedRole}_${cardName.replace(/\s+/g, '_')}_Pass.png`;
    link.href = dataUrl;
    link.click();
  };

  // Print Action
  const handlePrintCard = () => {
    setIsBatchPrintMode(false);
    window.print();
  };

  // Batch Print Action
  const handleBatchPrint = () => {
    setIsBatchPrintMode(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Hidden Download Canvas */}
      <canvas ref={downloadCanvasRef} className="hidden" />

      {/* Top Header & Navigation Bar (Hidden when printing) */}
      <header className="no-print border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono font-medium text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exhibition Home</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm sm:text-base font-bold font-mono tracking-tight text-slate-100">
              DPSI CREDENTIALS & ATTENDANCE PORTAL
            </h1>
          </div>
        </div>

        {/* Tab Controls */}
        <div role="tablist" aria-label="Portal Navigation" className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            role="tab"
            aria-selected={activeTab === 'generator'}
            onClick={() => switchTab('generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'generator'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Pass Generator</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'attendance'}
            onClick={() => switchTab('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'attendance'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Attendance Hub</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300 text-[10px]">
              {presentStudentsCount}/{totalStudentsCount}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'scanner'}
            onClick={() => switchTab('scanner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'scanner'
                ? 'bg-purple-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scanner</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        {/* ========================================================= */}
        {/* TAB 1: PASS GENERATOR & LIVE VIRTUAL CARD */}
        {/* ========================================================= */}
        {activeTab === 'generator' && (
          <div className="flex flex-col gap-8">
            {/* Top Config Row */}
            <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-800/80 shadow-xl backdrop-blur-sm">
              {/* Left Column: Role & Security Code */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-bold font-mono text-slate-200 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>CREDENTIAL AUTHENTICATION</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your proprietary summit authorization code or select your role to generate your official badge.
                  </p>
                </div>

                {/* Access Code Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="summit-access-code" className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Summit Access Code
                  </label>
                  <div className="relative">
                    <input
                      id="summit-access-code"
                      type="text"
                      placeholder="e.g. 987654 or TEACHER2026"
                      value={accessCode}
                      onChange={(e) => handleVerifyAccessCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors uppercase"
                    />
                    {isCodeUnlocked && (
                      <span className="absolute right-3 top-2.5 flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        <Check className="w-3.5 h-3.5" /> UNLOCKED
                      </span>
                    )}
                  </div>
                  {unlockedRoleName && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" /> {unlockedRoleName}
                    </span>
                  )}
                </div>

                {/* Role Selector Pills */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Select Summit Role
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(ROLE_CONFIG) as RoleType[]).map((r) => {
                      const cfg = ROLE_CONFIG[r];
                      const isSelected = selectedRole === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSelectedRole(r)}
                          className={`px-2.5 py-2 rounded-xl text-left text-xs font-mono font-bold transition-all border ${
                            isSelected
                              ? `${cfg.pillClass} ring-2 ring-amber-500/40 shadow-sm`
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                          }`}
                        >
                          <div className="truncate">{r}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Student Lookup or Role Details */}
              <div className="lg:col-span-7 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                {selectedRole === 'EXHIBITOR' ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                        <GraduationCap className="w-4 h-4" />
                        Select Student Innovator (121 Registered)
                      </h3>
                      {selectedStudent && (
                        <span className="text-[11px] font-mono text-slate-400">
                          Booth #{selectedStudent.project_number}
                        </span>
                      )}
                    </div>

                    {/* Student Search & Select Bar */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        aria-label="Search student by name, section, or project"
                        placeholder="Search student by name, section (e.g. IX-A, XI-G), or project..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    {/* Quick Student Grid with composite key */}
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-1.5 space-y-1">
                      {filteredStudents.map((st) => {
                        const isChosen =
                          selectedStudent?.student_name === st.student_name &&
                          selectedStudent?.project_number === st.project_number;
                        return (
                          <button
                            key={`${st.student_name}-${st.project_number}`}
                            type="button"
                            onClick={() => setSelectedStudent(st)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between gap-2 ${
                              isChosen
                                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                                : 'hover:bg-slate-900 text-slate-300'
                            }`}
                          >
                            <span className="truncate">
                              {st.student_name}{' '}
                              <span className={isChosen ? 'text-slate-900' : 'text-slate-400'}>
                                ({st.class_section})
                              </span>
                            </span>
                            <span className="text-[10px] shrink-0 font-mono opacity-80">
                              Proj #{st.project_number}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                      <Award className="w-4 h-4" />
                      {ROLE_CONFIG[selectedRole].label} Customization
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-slate-400">Full Name</label>
                        <input
                          type="text"
                          aria-label="Full Name"
                          placeholder="e.g. Dr. A. Sharma"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-slate-400">Designation / Role Title</label>
                        <input
                          type="text"
                          aria-label="Designation / Role Title"
                          placeholder="e.g. Head of Computer Science"
                          value={customDesignation}
                          onChange={(e) => setCustomDesignation(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400">Department / Organization</label>
                      <input
                        type="text"
                        aria-label="Department / Organization"
                        placeholder="e.g. DPS Indirapuram / Innovation Cell"
                        value={customOrg}
                        onChange={(e) => setCustomOrg(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LIVE PASS DISPLAY (CR-100 STANDARD RATIO 1024x640) */}
            <div className="flex flex-col items-center gap-6">
              <div className="no-print flex items-center justify-between w-full max-w-4xl px-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                    Live CR-100 Credential Preview
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Standard Format: 1024×640 px • ISO/IEC 7810 ID-1
                </div>
              </div>

              {/* CARD CONTAINER (Target of print and view) */}
              <div
                id="printable-card"
                className={`w-full max-w-4xl aspect-[1.6/1] bg-gradient-to-br from-[#090d16] via-[#0d1527] to-[#070a12] rounded-3xl p-6 sm:p-10 border-2 ${
                  ROLE_CONFIG[selectedRole].borderClass
                } shadow-2xl ${
                  ROLE_CONFIG[selectedRole].glowClass
                } relative overflow-hidden flex flex-col justify-between print-page-badge`}
                style={{
                  boxShadow: `0 25px 60px -15px ${ROLE_CONFIG[selectedRole].accentColor}25`,
                }}
              >
                {/* Background Tech Grid & Watermark */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

                {/* Top Section */}
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] sm:text-xs font-mono font-bold text-amber-400 tracking-wider">
                      DELHI PUBLIC SCHOOL INDIRAPURAM
                    </div>
                    <div className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mt-1">
                      TECH & INNOVATION SUMMIT 2026
                    </div>
                    <div className="text-[10px] sm:text-xs font-mono text-slate-400 mt-1 uppercase">
                      OFFICIAL CREDENTIAL // {ROLE_CONFIG[selectedRole].badgeTitle}
                    </div>
                  </div>

                  {/* Role Badge Pill */}
                  <div
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-mono font-black border uppercase tracking-wider shadow-lg ${
                      ROLE_CONFIG[selectedRole].pillClass
                    }`}
                  >
                    {selectedRole}
                  </div>
                </div>

                {/* Divider Line */}
                <div className="relative z-10 w-full h-0.5 bg-gradient-to-r from-amber-500 via-cyan-500 to-transparent my-3 sm:my-4" />

                {/* Middle Content Section */}
                <div className="relative z-10 grid grid-cols-12 gap-4 items-center">
                  {/* Left Column: Delegate Details */}
                  <div className="col-span-8 sm:col-span-8 flex flex-col gap-2 sm:gap-3">
                    <div>
                      <div className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider">
                        CREDENTIAL HOLDER
                      </div>
                      <div className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase truncate">
                        {selectedRole === 'EXHIBITOR' && selectedStudent
                          ? selectedStudent.student_name
                          : customName || 'OFFICIAL DELEGATE'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <div className="text-[9px] sm:text-[11px] font-mono text-slate-400 uppercase">
                          AFFILIATION / SECTION
                        </div>
                        <div className="text-xs sm:text-base font-mono font-bold text-cyan-300">
                          {selectedRole === 'EXHIBITOR' && selectedStudent
                            ? selectedStudent.class_section
                            : customDesignation || ROLE_CONFIG[selectedRole].label}
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] sm:text-[11px] font-mono text-slate-400 uppercase">
                          ZONE CLEARANCE
                        </div>
                        <div className="text-xs sm:text-base font-mono font-bold text-amber-400 truncate">
                          {ROLE_CONFIG[selectedRole].zoneAccess}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] sm:text-[11px] font-mono text-slate-400 uppercase">
                        ASSIGNED PROJECT / DIVISION
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                        {selectedRole === 'EXHIBITOR' && selectedStudent
                          ? `#${selectedStudent.project_number} • ${selectedStudent.project_title}`
                          : customOrg || 'DPSI TECH & INNOVATION SUMMIT'}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Hologram Badge & MicroQR */}
                  <div className="col-span-4 sm:col-span-4 flex flex-col items-end justify-center gap-2">
                    {/* Simulated High-Res MicroQR Matrix */}
                    <div className="p-2 sm:p-3 bg-white rounded-2xl shadow-xl border-2 border-slate-300 flex flex-col items-center">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-950 rounded-lg p-1.5 relative flex flex-col justify-between">
                        {/* 3 Corner Finder Patterns */}
                        <div className="flex justify-between w-full">
                          <div className="w-4 h-4 bg-white p-0.5"><div className="w-full h-full bg-slate-950" /></div>
                          <div className="w-4 h-4 bg-white p-0.5"><div className="w-full h-full bg-slate-950" /></div>
                        </div>
                        {/* Middle Matrix Dots */}
                        <div className="flex items-center justify-center">
                          <div className="w-3 h-3 rounded-sm bg-amber-400 animate-pulse" />
                        </div>
                        <div className="flex justify-between w-full">
                          <div className="w-4 h-4 bg-white p-0.5"><div className="w-full h-full bg-slate-950" /></div>
                          <div className="text-[7px] font-mono font-bold text-white text-right">DPSI</div>
                        </div>
                      </div>
                      <span className="text-[8px] sm:text-[10px] font-mono font-bold text-slate-900 mt-1">
                        {selectedRole === 'EXHIBITOR' && selectedStudent
                          ? `DPSI-EXH-${selectedStudent.project_number}`
                          : `DPSI-${selectedRole.slice(0, 3)}-9876`}
                      </span>
                    </div>

                    {/* Hologram Security Pill */}
                    <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-purple-500/20 border border-white/20 text-[9px] font-mono text-slate-300 flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>SECURE HOLOGRAM</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Section */}
                <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[9px] sm:text-xs font-mono">
                  <div className="text-slate-400 font-semibold">
                    POWERED BY ☁ EXPO • DPS INDIRAPURAM
                  </div>
                  <div className="text-amber-400 font-bold">
                    DESIGNED & ENGINEERED BY OJAS SINGH (IX-A)
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="no-print flex flex-wrap items-center justify-center gap-3 w-full max-w-4xl">
                <button
                  onClick={handlePrintCard}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Card</span>
                </button>

                <button
                  onClick={handleDownloadVirtualPass}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 border border-slate-700 shadow-md transition-transform active:scale-95"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Virtual Pass (.PNG)</span>
                </button>

                <button
                  onClick={handleBatchPrint}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs sm:text-sm font-mono font-semibold flex items-center gap-2 border border-slate-800 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Batch Print Current Class Sheet</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ATTENDANCE HUB & TEACHER / INCHARGE ROSTER */}
        {/* ========================================================= */}
        {activeTab === 'attendance' && (
          <div className="flex flex-col gap-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Total Innovators</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">{totalStudentsCount}</div>
                  <div className="text-[11px] font-mono text-slate-500">Across 36 official projects</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Present / Checked-In</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {presentStudentsCount}{' '}
                    <span className="text-sm text-emerald-500/80 font-normal">({attendanceRate}%)</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-500/60">Verified via portal/pass</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Pending Check-in</div>
                  <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{absentStudentsCount}</div>
                  <div className="text-[11px] font-mono text-rose-500/60">Awaiting booth arrival</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Exhibition Schedule</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">08:30 – 15:30</div>
                  <div className="text-[11px] font-mono text-slate-500">Active Live Attendance</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="no-print bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    aria-label="Filter roster"
                    placeholder="Search student, section, or project..."
                    value={attendanceSearchQuery}
                    onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Class Filter */}
                <select
                  aria-label="Filter by Class Section"
                  value={attendanceClassFilter}
                  onChange={(e) => setAttendanceClassFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Sections (121)</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  aria-label="Filter by Attendance Status"
                  value={attendanceStatusFilter}
                  onChange={(e) => setAttendanceStatusFilter(e.target.value as 'ALL' | 'PRESENT' | 'ABSENT')}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PRESENT">Present Only</option>
                  <option value="ABSENT">Absent Only</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllFilteredPresent}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Mark Filtered Present</span>
                </button>

                <button
                  onClick={exportAttendanceCSV}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={resetAttendance}
                  aria-label="Reset All Attendance"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-mono transition-colors"
                  title="Reset Attendance"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Attendance Roster Table */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Pass ID</th>
                      <th className="py-3 px-4">Student Innovator</th>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4">Project Assigned</th>
                      <th className="py-3 px-4">Faculty Mentor</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredAttendance.map((rec) => (
                      <tr key={`${rec.studentName}-${rec.projectNumber}`} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-4 text-amber-400 font-bold">{rec.passCode}</td>
                        <td className="py-3 px-4 font-bold text-white">{rec.studentName}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 text-[11px]">
                            {rec.classSection}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate" title={rec.projectTitle}>
                          <span className="text-slate-400 font-bold mr-1">#{rec.projectNumber}</span>
                          {rec.projectTitle}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{rec.mentor}</td>
                        <td className="py-3 px-4 text-center">
                          {rec.checkedIn ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              PRESENT {rec.checkedInAt && `(${rec.checkedInAt})`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                              <XCircle className="w-3 h-3 text-slate-500" />
                              ABSENT
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => toggleCheckIn(rec.studentName, rec.projectNumber)}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                              rec.checkedIn
                                ? 'bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                            }`}
                          >
                            {rec.checkedIn ? 'Mark Absent' : 'Check In'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CARD SCANNER & CODE VERIFICATION HUB */}
        {/* ========================================================= */}
        {activeTab === 'scanner' && (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-purple-400" />
                    <span>CREDENTIAL SCANNER & CODE CHECK</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Scan student card barcodes/QRs or type a pass code / student name to verify attendance and project authorization.
                  </p>
                </div>

                <button
                  onClick={toggleCameraScanner}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                    isCameraActive
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCameraActive ? 'Close Camera' : 'Open Camera Scanner'}</span>
                </button>
              </div>

              {/* Video Camera Container */}
              {isCameraActive && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/50 bg-black aspect-video flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  <div className="absolute inset-0 border-2 border-dashed border-purple-400/60 pointer-events-none m-8 rounded-xl flex items-center justify-center">
                    <span className="text-xs font-mono bg-purple-950/80 text-purple-200 px-3 py-1 rounded-full border border-purple-500/40">
                      Align QR or Barcode within Frame
                    </span>
                  </div>
                </div>
              )}

              {/* Manual Code Input Bar */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label htmlFor="scanner-input-box" className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Manual Code / Student Name Lookup
                </label>
                <div className="flex gap-2">
                  <input
                    id="scanner-input-box"
                    type="text"
                    placeholder="Enter pass code (e.g. DPSI-EXH-001) or student name..."
                    value={scannerInputCode}
                    onChange={(e) => setScannerInputCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleScanCode(scannerInputCode);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-purple-300 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleScanCode(scannerInputCode)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
                  >
                    Verify Pass
                  </button>
                </div>
              </div>

              {/* Quick Preset Test Codes */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span>Quick Test Codes:</span>
                {['DPSI-EXH-001', 'DPSI-EXH-036', 'PROJ-36', 'TEACHER2026', 'JUDGE2026'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setScannerInputCode(t);
                      handleScanCode(t);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Verification Result Card */}
            {scannedResult && (
              <div
                className={`p-6 rounded-2xl border-2 transition-all shadow-2xl ${
                  scannedResult.found
                    ? 'bg-slate-900/90 border-emerald-500/60 shadow-emerald-500/10'
                    : 'bg-slate-900/90 border-rose-500/60 shadow-rose-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {scannedResult.found ? (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                        <XCircle className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold font-mono text-white">
                        {scannedResult.found ? 'CREDENTIAL VERIFIED • ACCESS GRANTED' : 'INVALID OR UNKNOWN CREDENTIAL'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{scannedResult.message}</p>
                    </div>
                  </div>

                  {scannedResult.found && scannedResult.student && (
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                      BOOTH #{scannedResult.student.project_number}
                    </span>
                  )}
                </div>

                {scannedResult.found && scannedResult.student && (
                  <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <div className="text-slate-400 uppercase text-[10px]">Student Name</div>
                      <div className="text-base font-bold text-white mt-0.5">{scannedResult.student.student_name}</div>
                    </div>

                    <div>
                      <div className="text-slate-400 uppercase text-[10px]">Class & Section</div>
                      <div className="text-base font-bold text-cyan-300 mt-0.5">{scannedResult.student.class_section}</div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-slate-400 uppercase text-[10px]">Project Title</div>
                      <div className="text-sm font-semibold text-slate-200 mt-0.5">
                        {scannedResult.student.project_title}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 uppercase text-[10px]">Faculty Mentor</div>
                      <div className="text-sm text-slate-300 mt-0.5">{scannedResult.student.mentor}</div>
                    </div>

                    <div>
                      <div className="text-slate-400 uppercase text-[10px]">Attendance Status</div>
                      <div className="mt-1">
                        {scannedResult.record?.checkedIn ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> PRESENT{' '}
                            {scannedResult.record.checkedInAt && `(${scannedResult.record.checkedInAt})`}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> ABSENT / NOT CHECKED IN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="sm:col-span-2 pt-2">
                      <button
                        onClick={() => {
                          if (scannedResult.student) {
                            toggleCheckIn(scannedResult.student.student_name, scannedResult.student.project_number);
                            setScannedResult((prev) => {
                              if (!prev || !prev.student) return prev;
                              const updatedRecord = {
                                ...prev.record!,
                                checkedIn: !prev.record?.checkedIn,
                                checkedInAt: !prev.record?.checkedIn
                                  ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : undefined,
                              };
                              return { ...prev, record: updatedRecord };
                            });
                          }
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                          scannedResult.record?.checkedIn
                            ? 'bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>
                          {scannedResult.record?.checkedIn
                            ? 'Mark Student Absent (Undo Check-In)'
                            : 'Confirm & Check In Student'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* BATCH PRINT CONTAINER (Only visible in Print Mode) */}
        {/* ========================================================= */}
        {isBatchPrintMode && (
          <div className="print-only hidden">
            {filteredAttendance.map((rec) => (
              <div
                key={`${rec.studentName}-${rec.projectNumber}`}
                className="w-[1024px] h-[640px] p-10 bg-slate-950 text-white rounded-3xl border-2 border-cyan-500 flex flex-col justify-between mb-8 print-page-badge"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-mono font-bold text-amber-400">DELHI PUBLIC SCHOOL INDIRAPURAM</div>
                    <div className="text-3xl font-black mt-1">TECH & INNOVATION SUMMIT 2026</div>
                    <div className="text-xs font-mono text-slate-400 mt-1">OFFICIAL EXHIBITOR PASS</div>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono font-bold">
                    EXHIBITOR
                  </div>
                </div>

                <div className="h-0.5 bg-gradient-to-r from-amber-500 via-cyan-500 to-transparent my-4" />

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-8 flex flex-col gap-2">
                    <div className="text-xs font-mono text-slate-400">CREDENTIAL HOLDER</div>
                    <div className="text-4xl font-black text-white">{rec.studentName}</div>
                    <div className="text-base font-mono text-cyan-300">SECTION: {rec.classSection}</div>
                    <div className="text-sm text-slate-200">
                      PROJECT #{rec.projectNumber} • {rec.projectTitle}
                    </div>
                  </div>

                  <div className="col-span-4 flex flex-col items-end">
                    <div className="p-3 bg-white text-slate-950 rounded-xl text-center">
                      <div className="text-xs font-mono font-bold">{rec.passCode}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-400">
                  <div>POWERED BY ☁ EXPO • DPS INDIRAPURAM</div>
                  <div className="text-amber-400 font-bold">DESIGNED & ENGINEERED BY OJAS SINGH (IX-A)</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Global Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-page-badge {
            page-break-after: always !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 0 auto !important;
          }
          header,
          nav,
          footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
