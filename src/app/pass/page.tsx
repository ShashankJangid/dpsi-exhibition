'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Printer,
  Download,
  Share2,
  Search,
  Check,
  X,
  Camera,
  RefreshCw,
  Award,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  KeyRound,
  FileSpreadsheet,
  Lock,
  Layers,
  GraduationCap,
  Users,
  Grid,
  Filter,
  CheckSquare,
  Square,
  LogOut,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import {
  OFFICIAL_STUDENTS_ROSTER,
  PROPRIETARY_ACCESS_CODES,
  StudentEntry,
} from '@/data/exhibitionRegistry';
import { generateAppleCardSvg } from '@/lib/badgeGenerator';

export type RoleType = 'EXHIBITOR' | 'JUDGE' | 'VIP' | 'STAFF' | 'INCHARGE' | 'VISITOR';
export type A4LayoutMode = '8_PER_PAGE' | '4_PER_PAGE' | '1_PER_PAGE';

interface RoleConfig {
  label: string;
  codePrefix: string;
  pillClass: string;
  borderClass: string;
  glowClass: string;
  accentColor: string;
  accessLevel: string;
  zoneAccess: string;
  badgeTitle: string;
  classDefault: string;
  domainDefault: string;
  venueDefault: string;
}

const ROLE_CONFIG: Record<RoleType, RoleConfig> = {
  EXHIBITOR: {
    label: 'Student Innovator / Exhibitor',
    codePrefix: 'EXH',
    pillClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    borderClass: 'border-emerald-500/50',
    glowClass: 'shadow-emerald-500/20',
    accentColor: '#059669',
    accessLevel: 'ZONE 1 & 2 • ALL PROJECT LABS',
    zoneAccess: 'ALL EXHIBITION ZONES + MAKER LAB',
    badgeTitle: 'OFFICIAL EXHIBITOR PASS',
    classDefault: 'IX-A',
    domainDefault: 'STEM & Autonomous Robotics',
    venueDefault: 'Maker Lab • Booth 01 (Hall A)',
  },
  INCHARGE: {
    label: 'Faculty Incharge / Mentor',
    codePrefix: 'INC',
    pillClass: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    borderClass: 'border-purple-500/50',
    glowClass: 'shadow-purple-500/20',
    accentColor: '#7C3AED',
    accessLevel: 'MASTER ALL-ACCESS • COMMAND & CONTROL',
    zoneAccess: 'ALL EXHIBITION ZONES + CONTROL ROOM',
    badgeTitle: 'SUPERVISORY COMMAND PASS',
    classDefault: 'FACULTY MENTOR',
    domainDefault: 'Department of Science & Innovation',
    venueDefault: 'Faculty Command Desk • Central Atrium',
  },
  JUDGE: {
    label: 'Grand Jury Evaluator',
    codePrefix: 'JDG',
    pillClass: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    borderClass: 'border-blue-500/50',
    glowClass: 'shadow-blue-500/20',
    accentColor: '#2563EB',
    accessLevel: 'JURY EVALUATION • ALL LABS',
    zoneAccess: 'ALL EXHIBITION ZONES + JURY SUITE',
    badgeTitle: 'GRAND JURY CREDENTIAL',
    classDefault: 'EVALUATOR',
    domainDefault: 'Academic & Industry Evaluation Council',
    venueDefault: 'Jury Evaluation Chamber • Room 204',
  },
  VIP: {
    label: 'Distinguished VIP Guest',
    codePrefix: 'VIP',
    pillClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    borderClass: 'border-amber-500/50',
    glowClass: 'shadow-amber-500/20',
    accentColor: '#D97706',
    accessLevel: 'VIP PROTOCOL ACCESS',
    zoneAccess: 'VIP LOUNGE + ALL PUBLIC EXHIBITS',
    badgeTitle: 'VIP EXECUTIVE GUEST PASS',
    classDefault: 'EXECUTIVE GUEST',
    domainDefault: 'Leadership & Distinguished Patron',
    venueDefault: 'Executive Gallery • West Concourse',
  },
  STAFF: {
    label: 'Summit Operations Staff',
    codePrefix: 'STF',
    pillClass: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    borderClass: 'border-rose-500/50',
    glowClass: 'shadow-rose-500/20',
    accentColor: '#DC2626',
    accessLevel: 'OPERATIONS & SECURITY PROTOCOL',
    zoneAccess: 'OPERATIONS HUB + LOGISTICS CORRIDORS',
    badgeTitle: 'FACULTY COORDINATOR PASS',
    classDefault: 'OPERATIONS',
    domainDefault: 'Campus Events & Operations Division',
    venueDefault: 'Operations Base • Main Ground Floor',
  },
  VISITOR: {
    label: 'Summit Attendee Pass',
    codePrefix: 'VIS',
    pillClass: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    borderClass: 'border-sky-500/50',
    glowClass: 'shadow-sky-500/20',
    accentColor: '#0369A1',
    accessLevel: 'GENERAL EXHIBITION VISITOR',
    zoneAccess: 'PUBLIC CORRIDORS & GALLERIES',
    badgeTitle: 'EXHIBITION ATTENDEE PASS',
    classDefault: 'DELEGATE',
    domainDefault: 'General Public & Guest Delegate',
    venueDefault: 'Exhibition Concourse • Halls A-C',
  },
};

const ATTENDANCE_STORAGE_KEY = 'dpsi_exhibition_attendance_v1';

export interface AttendanceRecord {
  studentName: string;
  classSection: string;
  projectNumber: number;
  projectTitle: string;
  mentor: string;
  passCode: string;
  accessCode: string;
  checkedIn: boolean;
  checkInTime?: string;
}

function PassAndAttendanceContent() {
  const searchParams = useSearchParams();

  // Authentication & Gatekeeper State initialized from search params if present
  const [accessCode, setAccessCode] = useState(() => {
    return (searchParams.get('code') || '').trim().toUpperCase();
  });
  const [isCodeUnlocked, setIsCodeUnlocked] = useState(() => {
    const code = (searchParams.get('code') || '').trim().toUpperCase();
    return (Object.values(PROPRIETARY_ACCESS_CODES) as string[]).includes(code);
  });
  const [unlockedRole, setUnlockedRole] = useState<RoleType | null>(() => {
    const code = (searchParams.get('code') || '').trim().toUpperCase();
    if (code === PROPRIETARY_ACCESS_CODES.STUDENT_DEFAULT) return 'EXHIBITOR';
    if (code === PROPRIETARY_ACCESS_CODES.TEACHER_INCHARGE) return 'INCHARGE';
    if (code === PROPRIETARY_ACCESS_CODES.STAFF_OPS) return 'STAFF';
    if (code === PROPRIETARY_ACCESS_CODES.JUDGE_PANEL) return 'JUDGE';
    if (code === PROPRIETARY_ACCESS_CODES.VIP_DELEGATE) return 'VIP';
    return null;
  });
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'pass' | 'attendance' | 'batch_print' | 'scanner'>('pass');

  // Student Innovator Pass State
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentEntry>(() => OFFICIAL_STUDENTS_ROSTER[0]);

  // Customizable Fields for Teachers (Faculty Incharges)
  const [facultyCustomName, setFacultyCustomName] = useState('Dr. Priya Verma');
  const [facultyCustomRole, setFacultyCustomRole] = useState('Faculty Incharge');
  const [facultyCustomDept, setFacultyCustomDept] = useState('Department of Science & Innovation');
  const [facultyCustomVenue, setFacultyCustomVenue] = useState('Faculty Command Desk • Central Atrium');
  const [facultyCustomId, setFacultyCustomId] = useState('INC-2026');

  // Customizable Fields for Other Logged-in Roles (Judge, VIP, Staff)
  const [otherCustomName, setOtherCustomName] = useState('');
  const [otherCustomRole, setOtherCustomRole] = useState('');
  const [otherCustomOrg, setOtherCustomOrg] = useState('');
  const [otherCustomVenue, setOtherCustomVenue] = useState('');
  const [otherCustomId, setOtherCustomId] = useState('');

  // Vector Badge Templates
  const [badgeTemplates, setBadgeTemplates] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Master Attendance State
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

  // A4 Batch Print State
  const [a4Layout, setA4Layout] = useState<A4LayoutMode>('8_PER_PAGE');
  const [selectedStudentIdsForPrint, setSelectedStudentIdsForPrint] = useState<Set<string>>(() => {
    return new Set(OFFICIAL_STUDENTS_ROSTER.map((s) => `${s.student_name}__${s.project_number}`));
  });
  const [batchPrintSearch, setBatchPrintSearch] = useState('');
  const [isPrintingBatch, setIsPrintingBatch] = useState(false);

  // Scanner State
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

  // Prefetch official Apple Card CR-100 vector templates
  useEffect(() => {
    const roles = ['exhibitor', 'judge', 'vip', 'staff', 'incharge', 'visitor'];
    Promise.all(
      roles.map(async (r) => {
        try {
          const res = await fetch(`/badges/${r}.svg`);
          if (res.ok) {
            const text = await res.text();
            return { role: r, svg: text };
          }
        } catch (err) {
          console.error('Failed to load badge template:', r, err);
        }
        return null;
      })
    ).then((results) => {
      const map: Record<string, string> = {};
      results.forEach((item) => {
        if (item) map[item.role] = item.svg;
      });
      setBadgeTemplates(map);
    });
  }, []);

  // Camera cleanup
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Code verification handler
  const handleVerifyCode = (codeToVerify: string) => {
    const trimmed = codeToVerify.trim().toUpperCase();
    setAccessCode(trimmed);
    setAuthError('');

    if (trimmed === PROPRIETARY_ACCESS_CODES.STUDENT_DEFAULT) {
      setIsCodeUnlocked(true);
      setUnlockedRole('EXHIBITOR');
      setActiveTab('pass');
    } else if (trimmed === PROPRIETARY_ACCESS_CODES.TEACHER_INCHARGE) {
      setIsCodeUnlocked(true);
      setUnlockedRole('INCHARGE');
      setActiveTab('pass');
    } else if (trimmed === PROPRIETARY_ACCESS_CODES.STAFF_OPS) {
      setIsCodeUnlocked(true);
      setUnlockedRole('STAFF');
      setActiveTab('pass');
    } else if (trimmed === PROPRIETARY_ACCESS_CODES.JUDGE_PANEL) {
      setIsCodeUnlocked(true);
      setUnlockedRole('JUDGE');
      setActiveTab('pass');
    } else if (trimmed === PROPRIETARY_ACCESS_CODES.VIP_DELEGATE) {
      setIsCodeUnlocked(true);
      setUnlockedRole('VIP');
      setActiveTab('pass');
    } else {
      setIsCodeUnlocked(false);
      setUnlockedRole(null);
      setAuthError('Invalid Summit Access Code. Please verify your credentials.');
    }
  };

  const handleLockSession = () => {
    setIsCodeUnlocked(false);
    setUnlockedRole(null);
    setAccessCode('');
    stopCamera();
  };

  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn('Video playback warning:', err);
      });
    }
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Save attendance
  const saveAttendance = (records: AttendanceRecord[]) => {
    setAttendanceList(records);
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // storage unavailable
    }
  };

  // Filter students for innovator lookup
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
    );
  }, [studentSearchQuery]);

  // Unique class sections in roster
  const classSectionsList = useMemo(() => {
    const set = new Set<string>();
    OFFICIAL_STUDENTS_ROSTER.forEach((s) => set.add(s.class_section));
    return Array.from(set).sort();
  }, []);

  // Active role config
  const currentRole: RoleType = unlockedRole || 'EXHIBITOR';
  const roleConfig = ROLE_CONFIG[currentRole];

  // Active Credential ID based on role and customizer
  const activeCredentialId = useMemo(() => {
    if (currentRole === 'EXHIBITOR') {
      return `EXH-${String(selectedStudent.project_number).padStart(4, '0')}`;
    }
    if (currentRole === 'INCHARGE') {
      return (facultyCustomId || 'INC-2026').trim().toUpperCase();
    }
    return (otherCustomId || `${roleConfig.codePrefix}-0001`).trim().toUpperCase();
  }, [currentRole, selectedStudent, facultyCustomId, otherCustomId, roleConfig]);

  // Display name of the active credential holder
  const activeHolderName = useMemo(() => {
    if (currentRole === 'EXHIBITOR') return selectedStudent.student_name;
    if (currentRole === 'INCHARGE') return facultyCustomName || 'FACULTY INCHARGE';
    return otherCustomName || roleConfig.classDefault;
  }, [currentRole, selectedStudent, facultyCustomName, otherCustomName, roleConfig]);

  // Dynamic SVG for the active pass
  const activeBadgeSvg = useMemo(() => {
    const roleKey = currentRole.toLowerCase();
    const template = badgeTemplates[roleKey];
    if (!template) return '';

    if (currentRole === 'EXHIBITOR') {
      return generateAppleCardSvg(template, {
        name: selectedStudent.student_name,
        classSection: selectedStudent.class_section,
        credentialId: activeCredentialId,
        projectDomain: selectedStudent.project_title,
        venueLocation: `Maker Lab • Booth ${selectedStudent.project_number}`,
      });
    }

    if (currentRole === 'INCHARGE') {
      return generateAppleCardSvg(template, {
        name: facultyCustomName.trim() || 'FACULTY INCHARGE',
        classSection: facultyCustomRole.trim() || 'SUPERVISORY COMMAND PASS',
        credentialId: activeCredentialId,
        projectDomain: facultyCustomDept.trim() || 'Department of Science & Innovation',
        venueLocation: facultyCustomVenue.trim() || 'Faculty Command Desk • Central Atrium',
      });
    }

    return generateAppleCardSvg(template, {
      name: otherCustomName.trim() || roleConfig.classDefault,
      classSection: otherCustomRole.trim() || roleConfig.badgeTitle,
      credentialId: activeCredentialId,
      projectDomain: otherCustomOrg.trim() || roleConfig.domainDefault,
      venueLocation: otherCustomVenue.trim() || roleConfig.venueDefault,
    });
  }, [
    badgeTemplates,
    currentRole,
    selectedStudent,
    roleConfig,
    activeCredentialId,
    facultyCustomName,
    facultyCustomRole,
    facultyCustomDept,
    facultyCustomVenue,
    otherCustomName,
    otherCustomRole,
    otherCustomOrg,
    otherCustomVenue,
  ]);

  // Selected students for A4 batch print
  const selectedStudentsForPrintList = useMemo(() => {
    return OFFICIAL_STUDENTS_ROSTER.filter((s) =>
      selectedStudentIdsForPrint.has(`${s.student_name}__${s.project_number}`)
    );
  }, [selectedStudentIdsForPrint]);

  // Chunk selected students into A4 sheets
  const a4Sheets = useMemo(() => {
    const perPage = a4Layout === '8_PER_PAGE' ? 8 : a4Layout === '4_PER_PAGE' ? 4 : 1;
    const sheets: StudentEntry[][] = [];
    for (let i = 0; i < selectedStudentsForPrintList.length; i += perPage) {
      sheets.push(selectedStudentsForPrintList.slice(i, i + perPage));
    }
    return sheets;
  }, [selectedStudentsForPrintList, a4Layout]);

  // Download high-resolution PNG
  const handleDownloadPng = async () => {
    if (!activeBadgeSvg) return;
    setIsExporting(true);
    try {
      const blob = new Blob([activeBadgeSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1970;
        canvas.height = 1340;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, 1970, 1340);
          const pngUrl = canvas.toDataURL('image/png', 1.0);
          const a = document.createElement('a');
          const fileName = `${currentRole}_${activeHolderName.replace(/[^a-zA-Z0-9]/g, '_')}_CR100.png`;
          a.download = fileName;
          a.href = pngUrl;
          a.click();
        }
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };
      img.src = url;
    } catch {
      setIsExporting(false);
    }
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!activeBadgeSvg) return;
    const blob = new Blob([activeBadgeSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = `${currentRole}_${activeHolderName.replace(/[^a-zA-Z0-9]/g, '_')}_CR100.svg`;
    a.download = fileName;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print single pass
  const handlePrintSinglePass = () => {
    setIsPrintingBatch(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Print batch sheets
  const handlePrintBatchSheets = () => {
    setIsPrintingBatch(true);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Reset batch print mode on print finish
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrintingBatch(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Filtered attendance for Teacher hub
  const filteredAttendance = useMemo(() => {
    return attendanceList.filter((rec) => {
      const matchesClass = attendanceClassFilter === 'ALL' || rec.classSection === attendanceClassFilter;
      const matchesStatus =
        attendanceStatusFilter === 'ALL' ||
        (attendanceStatusFilter === 'PRESENT' && rec.checkedIn) ||
        (attendanceStatusFilter === 'ABSENT' && !rec.checkedIn);
      const q = attendanceSearchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        rec.studentName.toLowerCase().includes(q) ||
        rec.projectTitle.toLowerCase().includes(q) ||
        rec.passCode.toLowerCase().includes(q) ||
        rec.projectNumber.toString() === q;
      return matchesClass && matchesStatus && matchesQuery;
    });
  }, [attendanceList, attendanceClassFilter, attendanceStatusFilter, attendanceSearchQuery]);

  // Export attendance CSV using Blob to prevent URL fragment truncation from '#'
  const handleExportCsv = () => {
    const headers = ['Student Name', 'Class & Section', 'Booth #', 'Project Title', 'Mentor', 'Pass Code', 'Status', 'Check-In Timestamp'];
    const rows = attendanceList.map((r) => [
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.classSection}"`,
      r.projectNumber,
      `"${r.projectTitle.replace(/"/g, '""')}"`,
      `"${r.mentor.replace(/"/g, '""')}"`,
      `"${r.passCode}"`,
      r.checkedIn ? 'PRESENT' : 'ABSENT',
      `"${r.checkInTime || 'N/A'}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'DPSI_Exhibition_2026_Attendance.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Toggle student check-in
  const handleToggleAttendance = (studentName: string, projectNumber: number) => {
    const updated = attendanceList.map((r) => {
      if (r.studentName === studentName && r.projectNumber === projectNumber) {
        const nextState = !r.checkedIn;
        return {
          ...r,
          checkedIn: nextState,
          checkInTime: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        };
      }
      return r;
    });
    saveAttendance(updated);
  };

  // Manual code scanner check
  const handleScanCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return;

    const matchedRecord = attendanceList.find(
      (r) =>
        r.passCode.toUpperCase() === clean ||
        r.studentName.toUpperCase() === clean
    );

    const matchedStudent = matchedRecord
      ? OFFICIAL_STUDENTS_ROSTER.find(
          (s) =>
            s.student_name === matchedRecord.studentName &&
            s.project_number === matchedRecord.projectNumber
        )
      : OFFICIAL_STUDENTS_ROSTER.find(
          (s) => s.student_name.toUpperCase() === clean
        );

    if (matchedStudent || matchedRecord) {
      setScannedResult({
        found: true,
        student: matchedStudent,
        record: matchedRecord,
        message: 'Valid credential verified on official summit ledger.',
      });
    } else {
      setScannedResult({
        found: false,
        message: 'Credential code not found. Please verify with the Registration Desk.',
      });
    }
  };

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      alert('Camera access denied or unavailable on this device.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* ========================================================================= */}
      {/* SCREEN UI CONTAINER (Hidden entirely during printing) */}
      {/* ========================================================================= */}
      <div id="summit-screen-ui" className="no-print flex-1 flex flex-col w-full">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Return to Main Exhibition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                  DELHI PUBLIC SCHOOL INDIRAPURAM
                </div>
                <h1 className="text-sm sm:text-base font-extrabold font-mono text-white flex items-center gap-2">
                  <span>TECH & INNOVATION SUMMIT 2026</span>
                  <span className="hidden sm:inline-block text-[11px] font-normal px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    CR-100 CREDENTIAL ENGINE
                  </span>
                </h1>
              </div>
            </div>

            {isCodeUnlocked && (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${roleConfig.pillClass}`}>
                  {roleConfig.label}
                </span>
                <button
                  type="button"
                  onClick={handleLockSession}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  title="Lock session and switch account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock / Switch Code</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          {/* GATEKEEPER LOCK SCREEN (Shown when not authenticated) */}
          {!isCodeUnlocked ? (
            <div className="max-w-2xl mx-auto my-8 sm:my-16 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-amber-500 flex items-center justify-center text-amber-400">
                  <KeyRound className="w-3 h-3" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                  SUMMIT CREDENTIAL GATEWAY
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                  Enter your 6-digit summit access code or authorized role key to open your official portal.
                </p>
              </div>

              {/* Code Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyCode(accessCode);
                }}
                className="w-full max-w-md space-y-3"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ENTER ACCESS CODE (e.g. 987654)"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      setAuthError('');
                    }}
                    autoFocus
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-center text-base sm:text-lg font-mono font-bold tracking-widest text-amber-400 placeholder-slate-600 focus:outline-none transition-all uppercase shadow-inner"
                  />
                </div>

                {authError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5">
                    <X className="w-4 h-4" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Verify Access Code & Open Portal</span>
                </button>
              </form>

              {/* Authorized Roles Guide */}
              <div className="w-full pt-6 border-t border-slate-800/80 text-left space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Authorized Summit Credentials:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setAccessCode('987654')}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        Student Innovators (121)
                      </span>
                      <span className="bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                        987654
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Search roster, view official CR-100 badge, save virtual card PNG, or print solo pass.
                    </p>
                  </div>

                  <div
                    onClick={() => setAccessCode('TEACHER2026')}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-400">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        Faculty Incharge Hub
                      </span>
                      <span className="bg-purple-500/10 px-2 py-0.5 rounded text-[10px] group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors">
                        TEACHER2026
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Personalize your faculty pass, manage Master Attendance, and A4 Batch Print Console.
                    </p>
                  </div>

                  <div
                    onClick={() => setAccessCode('JUDGE2026')}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-400">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        Grand Jury Panel
                      </span>
                      <span className="bg-blue-500/10 px-2 py-0.5 rounded text-[10px] group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
                        JUDGE2026
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Official evaluation credential &amp; booth scoring scanner.
                    </p>
                  </div>

                  <div
                    onClick={() => setAccessCode('VIP2026')}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Executive VIP Guests
                      </span>
                      <span className="bg-amber-500/10 px-2 py-0.5 rounded text-[10px] group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        VIP2026
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      VIP protocol credential &amp; executive gallery clearance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED PORTALS */
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setActiveTab('pass');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'pass'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>
                    {currentRole === 'EXHIBITOR'
                      ? 'My Student Pass'
                      : currentRole === 'INCHARGE'
                      ? 'Faculty Incharge Pass'
                      : 'Official Credential'}
                  </span>
                </button>

                {/* Incharge / Faculty specific tabs */}
                {currentRole === 'INCHARGE' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setActiveTab('attendance');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 transition-all ${
                        activeTab === 'attendance'
                          ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Master Attendance ({attendanceList.filter((a) => a.checkedIn).length}/121)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setActiveTab('batch_print');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 transition-all ${
                        activeTab === 'batch_print'
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                      <span>A4 Batch Print Console</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setActiveTab('scanner');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'scanner'
                      ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Card Scanner &amp; Verification</span>
                </button>
              </div>

              {/* TAB 1: PASS PREVIEW & CUSTOMIZER */}
              {activeTab === 'pass' && (
                <div className="space-y-6">
                  {/* Student Selector for Exhibitors */}
                  {currentRole === 'EXHIBITOR' && (
                    <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase">
                          <GraduationCap className="w-4 h-4" />
                          <span>Select Student Innovator from 121 Registered Roster</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Booth #{selectedStudent.project_number} • Section {selectedStudent.class_section}
                        </span>
                      </div>

                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search your name, section (e.g. IX-A, IX-D, VII-H), or project title..."
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Quick selection dropdown / chips */}
                      <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-1.5 space-y-1">
                        {filteredStudents.map((st) => {
                          const isChosen =
                            selectedStudent.student_name === st.student_name &&
                            selectedStudent.project_number === st.project_number;
                          return (
                            <button
                              key={`${st.student_name}__${st.project_number}`}
                              type="button"
                              onClick={() => setSelectedStudent(st)}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between gap-2 ${
                                isChosen
                                  ? 'bg-cyan-500 text-slate-950 font-bold'
                                  : 'hover:bg-slate-900 text-slate-300'
                              }`}
                            >
                              <span className="truncate">
                                {st.student_name}{' '}
                                <span className={isChosen ? 'text-slate-900' : 'text-slate-500'}>
                                  ({st.class_section})
                                </span>
                              </span>
                              <span className="text-[10px] shrink-0 font-mono opacity-80">
                                Booth #{st.project_number}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Faculty Incharge Personal Pass Customizer */}
                  {currentRole === 'INCHARGE' && (
                    <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-purple-500/30 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase">
                          <Sliders className="w-4 h-4 text-purple-400" />
                          <span>Customize Your Faculty Incharge Credential</span>
                        </div>
                        <span className="text-[11px] font-mono text-purple-400/80">
                          ID: {activeCredentialId} • Real-time TopoTag &amp; MicroQR Synthesis
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">
                            TEACHER / FACULTY NAME
                          </label>
                          <input
                            type="text"
                            value={facultyCustomName}
                            onChange={(e) => setFacultyCustomName(e.target.value)}
                            placeholder="e.g. Dr. Priya Verma / Mr. Rajesh Kumar"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {['Dr. Priya Verma', 'Mr. Rajesh Kumar', 'Mrs. Neha Gupta', 'Dr. Amit Roy'].map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => setFacultyCustomName(name)}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700 transition-colors"
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">
                            DESIGNATION / ROLE TITLE
                          </label>
                          <input
                            type="text"
                            value={facultyCustomRole}
                            onChange={(e) => setFacultyCustomRole(e.target.value)}
                            placeholder="e.g. Faculty Incharge / Head of CS"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {['Faculty Incharge', 'Head of CS & AI', 'Senior Physics Mentor', 'ATL Coordinator'].map((role) => (
                              <button
                                key={role}
                                type="button"
                                onClick={() => setFacultyCustomRole(role)}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700 transition-colors"
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">
                            DEPARTMENT / INNOVATION DIVISION
                          </label>
                          <input
                            type="text"
                            value={facultyCustomDept}
                            onChange={(e) => setFacultyCustomDept(e.target.value)}
                            placeholder="e.g. Department of Science & Innovation"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">
                            STATION / COMMAND DESK
                          </label>
                          <input
                            type="text"
                            value={facultyCustomVenue}
                            onChange={(e) => setFacultyCustomVenue(e.target.value)}
                            placeholder="e.g. Faculty Command Desk • Central Atrium"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">
                            FACULTY CREDENTIAL ID (AUTO-HASHED)
                          </label>
                          <input
                            type="text"
                            value={facultyCustomId}
                            onChange={(e) => setFacultyCustomId(e.target.value)}
                            placeholder="e.g. INC-2026"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 placeholder-slate-500 focus:outline-none focus:border-purple-500 uppercase"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              setFacultyCustomName('Dr. Priya Verma');
                              setFacultyCustomRole('Faculty Incharge');
                              setFacultyCustomDept('Department of Science & Innovation');
                              setFacultyCustomVenue('Faculty Command Desk • Central Atrium');
                              setFacultyCustomId('INC-2026');
                            }}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold border border-slate-700 transition-colors w-full flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Defaults</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generic Role Customizer for Judge / VIP / Staff */}
                  {['JUDGE', 'VIP', 'STAFF'].includes(currentRole) && (
                    <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
                        <Sliders className="w-4 h-4" />
                        <span>Customize Your {roleConfig.label}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">FULL NAME</label>
                          <input
                            type="text"
                            value={otherCustomName}
                            onChange={(e) => setOtherCustomName(e.target.value)}
                            placeholder={roleConfig.classDefault}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">TITLE / DESIGNATION</label>
                          <input
                            type="text"
                            value={otherCustomRole}
                            onChange={(e) => setOtherCustomRole(e.target.value)}
                            placeholder={roleConfig.badgeTitle}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">ORGANIZATION / DIVISION</label>
                          <input
                            type="text"
                            value={otherCustomOrg}
                            onChange={(e) => setOtherCustomOrg(e.target.value)}
                            placeholder={roleConfig.domainDefault}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">VENUE ALLOCATION</label>
                          <input
                            type="text"
                            value={otherCustomVenue}
                            onChange={(e) => setOtherCustomVenue(e.target.value)}
                            placeholder={roleConfig.venueDefault}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">CREDENTIAL ID</label>
                          <input
                            type="text"
                            value={otherCustomId}
                            onChange={(e) => setOtherCustomId(e.target.value)}
                            placeholder={`${roleConfig.codePrefix}-0001`}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-500 uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Card Container Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                        Live CR-100 Credential Preview (Apple Card Platinum Edition)
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      CR-100: 98.5 × 67.0 mm • Dynamic Butterfly TopoTag &amp; Micro-QR
                    </div>
                  </div>

                  {/* THE PASS PREVIEW CARD (On Screen) */}
                  <div
                    id="printable-card"
                    className="w-full max-w-4xl mx-auto aspect-[985/670] rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-300 bg-white border border-slate-200/40"
                    style={{
                      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 40px -10px rgba(16, 185, 129, 0.15)',
                    }}
                  >
                    {activeBadgeSvg ? (
                      <div
                        className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                        dangerouslySetInnerHTML={{ __html: activeBadgeSvg }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-400 font-mono text-sm gap-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                        <span>Loading Apple Card CR-100 Credential...</span>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-4xl mx-auto pt-2">
                    <button
                      type="button"
                      onClick={handlePrintSinglePass}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>
                        {currentRole === 'INCHARGE'
                          ? 'Print My Faculty Pass'
                          : currentRole === 'EXHIBITOR'
                          ? 'Print Official Pass'
                          : 'Print Official Credential'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPng}
                      disabled={isExporting}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-mono font-bold flex items-center gap-2 border border-slate-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isExporting ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <Download className="w-4 h-4 text-emerald-400" />}
                      <span>Save Virtual Card (.PNG)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-mono font-bold flex items-center gap-2 border border-slate-700 active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Download Vector (.SVG)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 border border-slate-800 active:scale-95 transition-all"
                    >
                      <Share2 className="w-4 h-4 text-sky-400" />
                      <span>{copiedLink ? 'Link Copied!' : 'Share Portal'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MASTER ATTENDANCE REGISTRY (Only for Incharge) */}
              {activeTab === 'attendance' && currentRole === 'INCHARGE' && (
                <div className="space-y-4">
                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <span>MASTER STUDENT ATTENDANCE REGISTRY</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Check-in status for all 121 student innovators across all exhibition booths.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportCsv}
                        className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export Attendance CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6 relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search student, booth, or title..."
                        value={attendanceSearchQuery}
                        onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <select
                        value={attendanceClassFilter}
                        onChange={(e) => setAttendanceClassFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500"
                      >
                        <option value="ALL">All Sections ({classSectionsList.length})</option>
                        {classSectionsList.map((sec) => (
                          <option key={sec} value={sec}>Section {sec}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <select
                        value={attendanceStatusFilter}
                        onChange={(e) => setAttendanceStatusFilter(e.target.value as 'ALL' | 'PRESENT' | 'ABSENT')}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500"
                      >
                        <option value="ALL">All Status ({attendanceList.length})</option>
                        <option value="PRESENT">Present Only ({attendanceList.filter((a) => a.checkedIn).length})</option>
                        <option value="ABSENT">Absent Only ({attendanceList.filter((a) => !a.checkedIn).length})</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Booth #</th>
                            <th className="py-3 px-4">Student Name</th>
                            <th className="py-3 px-4">Section</th>
                            <th className="py-3 px-4">Project Title</th>
                            <th className="py-3 px-4">Faculty Mentor</th>
                            <th className="py-3 px-4">Pass Code</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredAttendance.map((rec) => (
                            <tr key={`${rec.studentName}__${rec.projectNumber}`} className="hover:bg-slate-850/50 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-amber-400">#{rec.projectNumber}</td>
                              <td className="py-2.5 px-4 font-bold text-white">{rec.studentName}</td>
                              <td className="py-2.5 px-4 text-cyan-300">{rec.classSection}</td>
                              <td className="py-2.5 px-4 max-w-xs truncate text-slate-300" title={rec.projectTitle}>
                                {rec.projectTitle}
                              </td>
                              <td className="py-2.5 px-4 text-slate-400">{rec.mentor}</td>
                              <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{rec.passCode}</td>
                              <td className="py-2.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    rec.checkedIn
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  }`}
                                >
                                  {rec.checkedIn ? 'PRESENT' : 'ABSENT'}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAttendance(rec.studentName, rec.projectNumber)}
                                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                    rec.checkedIn
                                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {rec.checkedIn ? 'Mark Absent' : 'Mark Present'}
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

              {/* TAB 3: A4 BATCH PRINT CONSOLE (Only for Incharge) */}
              {activeTab === 'batch_print' && currentRole === 'INCHARGE' && (
                <div className="space-y-6">
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
                          <Grid className="w-5 h-5 text-cyan-400" />
                          <span>A4 BATCH PRINT CONFIGURATOR</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Format CR-100 badges to fit standard A4 sheets with precision cut-lines and individual security tags.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handlePrintBatchSheets}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all self-start sm:self-auto"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print {selectedStudentIdsForPrint.size} Cards ({a4Sheets.length} A4 Sheet{a4Sheets.length !== 1 ? 's' : ''})</span>
                      </button>
                    </div>

                    {/* Layout Option Pills */}
                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => setA4Layout('8_PER_PAGE')}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          a4Layout === '8_PER_PAGE'
                            ? 'bg-cyan-500/10 border-cyan-500 text-white ring-2 ring-cyan-500/30'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold text-cyan-300">
                          8 Cards per A4 Sheet (Recommended)
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          2 columns × 4 rows (98.5 × 67.0 mm standard CR-100 badge). Perfect fit with 6.5mm margins.
                        </div>
                      </div>

                      <div
                        onClick={() => setA4Layout('4_PER_PAGE')}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          a4Layout === '4_PER_PAGE'
                            ? 'bg-cyan-500/10 border-cyan-500 text-white ring-2 ring-cyan-500/30'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold text-cyan-300">
                          4 Cards per A4 Sheet
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          2 columns × 2 rows. Large presentation format for high-visibility lanyards.
                        </div>
                      </div>

                      <div
                        onClick={() => setA4Layout('1_PER_PAGE')}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          a4Layout === '1_PER_PAGE'
                            ? 'bg-cyan-500/10 border-cyan-500 text-white ring-2 ring-cyan-500/30'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold text-cyan-300">
                          1 Card per A4 Sheet
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Single large credential sheet for desk display or certificate frames.
                        </div>
                      </div>
                    </div>

                    {/* "What cards do you want to print?" Selection Bar */}
                    <div className="pt-4 border-t border-slate-800/80 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                          <Filter className="w-4 h-4 text-amber-400" />
                          <span>Select Cards to Print ({selectedStudentIdsForPrint.size} of 121 Selected)</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentIdsForPrint(
                                new Set(OFFICIAL_STUDENTS_ROSTER.map((s) => `${s.student_name}__${s.project_number}`))
                              );
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-slate-700 transition-colors"
                          >
                            Select All 121
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentIdsForPrint(new Set())}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-400 border border-slate-700 transition-colors"
                          >
                            Clear Selection
                          </button>
                        </div>
                      </div>

                      {/* Quick Section Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {classSectionsList.map((sec) => {
                          const secStudents = OFFICIAL_STUDENTS_ROSTER.filter((s) => s.class_section === sec);
                          const isAllSelected = secStudents.every((s) =>
                            selectedStudentIdsForPrint.has(`${s.student_name}__${s.project_number}`)
                          );
                          return (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => {
                                const nextSet = new Set(selectedStudentIdsForPrint);
                                if (isAllSelected) {
                                  secStudents.forEach((s) => nextSet.delete(`${s.student_name}__${s.project_number}`));
                                } else {
                                  secStudents.forEach((s) => nextSet.add(`${s.student_name}__${s.project_number}`));
                                }
                                setSelectedStudentIdsForPrint(nextSet);
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors border ${
                                isAllSelected
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              Sec {sec} ({secStudents.length})
                            </button>
                          );
                        })}
                      </div>

                      {/* Search inside selection */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search student to toggle print selection..."
                          value={batchPrintSearch}
                          onChange={(e) => setBatchPrintSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Checkbox Grid */}
                      <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {OFFICIAL_STUDENTS_ROSTER.filter((s) => {
                          if (!batchPrintSearch.trim()) return true;
                          const q = batchPrintSearch.toLowerCase();
                          return (
                            s.student_name.toLowerCase().includes(q) ||
                            s.class_section.toLowerCase().includes(q) ||
                            s.project_title.toLowerCase().includes(q)
                          );
                        }).map((s) => {
                          const key = `${s.student_name}__${s.project_number}`;
                          const isChecked = selectedStudentIdsForPrint.has(key);
                          return (
                            <div
                              key={key}
                              onClick={() => {
                                const next = new Set(selectedStudentIdsForPrint);
                                if (isChecked) next.delete(key);
                                else next.add(key);
                                setSelectedStudentIdsForPrint(next);
                              }}
                              className={`p-2 rounded-lg text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors border ${
                                isChecked
                                  ? 'bg-cyan-950/40 border-cyan-700 text-white'
                                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-850'
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                              <div className="truncate flex-1">
                                <span className="font-bold">{s.student_name}</span>{' '}
                                <span className="text-[10px] text-slate-500">({s.class_section})</span>
                              </div>
                              <span className="text-[10px] text-amber-400 shrink-0 font-mono">#{s.project_number}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Print Sheet Preview Info Banner */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>
                        Ready to print <strong>{selectedStudentIdsForPrint.size}</strong> CR-100 badges across{' '}
                        <strong>{a4Sheets.length}</strong> A4 Sheet{a4Sheets.length !== 1 ? 's' : ''}.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePrintBatchSheets}
                      className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono transition-colors"
                    >
                      Open Print Dialogue
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: SCANNER & VERIFICATION */}
              {activeTab === 'scanner' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-400" />
                        <span>CREDENTIAL SCANNER &amp; VERIFICATION</span>
                      </h2>
                      {isCameraActive && (
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="text-xs font-mono text-rose-400 hover:text-rose-300"
                        >
                          Stop Camera
                        </button>
                      )}
                    </div>

                    {/* Camera View */}
                    {isCameraActive ? (
                      <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-slate-700">
                        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                        <div className="absolute inset-0 border-2 border-cyan-400/40 rounded-2xl pointer-events-none flex items-center justify-center">
                          <div className="w-48 h-48 border-2 border-dashed border-cyan-400 rounded-xl animate-pulse" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                        <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-400 font-mono">
                          Scan physical pass QR code using device camera or type credential code below.
                        </p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition-all"
                        >
                          Start Live Camera Scanner
                        </button>
                      </div>
                    )}

                    {/* Manual Code Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleScanCode(scannerInputCode);
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Or enter pass code e.g. DPSI-EXH-001 or student name..."
                        value={scannerInputCode}
                        onChange={(e) => setScannerInputCode(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition-colors"
                      >
                        Verify
                      </button>
                    </form>

                    {/* Scanned Result Card */}
                    {scannedResult && (
                      <div
                        className={`p-4 rounded-xl border ${
                          scannedResult.found
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-mono font-bold text-sm">
                          {scannedResult.found ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-rose-400" />}
                          <span>{scannedResult.found ? 'AUTHENTICATED CREDENTIAL' : 'VERIFICATION FAILED'}</span>
                        </div>
                        <p className="text-xs mt-1 text-slate-300 font-mono">{scannedResult.message}</p>

                        {scannedResult.found && (scannedResult.student || scannedResult.record) && (
                          <div className="mt-3 pt-3 border-t border-emerald-500/30 grid grid-cols-2 gap-2 text-xs font-mono text-slate-200">
                            <div>
                              <span className="text-slate-400 block text-[10px]">CREDENTIAL HOLDER</span>
                              <span className="font-bold">{scannedResult.student?.student_name || scannedResult.record?.studentName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">SECTION</span>
                              <span>{scannedResult.student?.class_section || scannedResult.record?.classSection}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">BOOTH / PROJECT</span>
                              <span>#{scannedResult.student?.project_number || scannedResult.record?.projectNumber}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">PASS CODE</span>
                              <span className="text-amber-400">{scannedResult.student?.pass_code || scannedResult.record?.passCode}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED PRINT MOUNT (Only visible during print, pure white paper) */}
      {/* ========================================================================= */}
      {isCodeUnlocked && (
        <div id="summit-print-mount">
          {/* A. Batch Print Mode: Multi-page A4 Grid Sheets */}
          {isPrintingBatch ? (
            a4Sheets.map((sheetStudents, sheetIdx) => (
              <div
                key={`a4_sheet_${sheetIdx}`}
                className={`a4-sheet ${
                  a4Layout === '8_PER_PAGE'
                    ? 'a4-sheet-8'
                    : a4Layout === '4_PER_PAGE'
                    ? 'a4-sheet-4'
                    : 'a4-sheet-1'
                }`}
              >
                {sheetStudents.map((st) => {
                  const cardSvg = badgeTemplates['exhibitor']
                    ? generateAppleCardSvg(badgeTemplates['exhibitor'], {
                        name: st.student_name,
                        classSection: st.class_section,
                        credentialId: `EXH-${String(st.project_number).padStart(4, '0')}`,
                        projectDomain: st.project_title,
                        venueLocation: `Maker Lab • Booth ${st.project_number}`,
                      })
                    : '';
                  return (
                    <div
                      key={`${st.student_name}__${st.project_number}`}
                      className="card-cell"
                    >
                      <div
                        className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                        dangerouslySetInnerHTML={{ __html: cardSvg }}
                      />
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            /* B. Single Card Print: Clean, official CR-100 badge sheet on pure white A4 */
            <div className="single-a4-sheet">
              <div className="single-a4-header">
                <div className="school-title">DELHI PUBLIC SCHOOL INDIRAPURAM</div>
                <div className="event-title">TECH &amp; INNOVATION SUMMIT 2026 • OFFICIAL CREDENTIAL SHEET</div>
                <div className="spec-meta">
                  CR-100 SPECIFICATION (98.5 × 67.0 mm) • OVD HOLOGRAPHIC SECURITY &amp; TOPOTAG AUTHENTICATED
                </div>
              </div>

              <div className="single-badge-cut-frame">
                <div
                  className="single-badge-svg-container"
                  dangerouslySetInnerHTML={{ __html: activeBadgeSvg }}
                />
              </div>

              <div className="single-a4-footer">
                <div className="cut-instructions">
                  ✂ Trim along the outer dashed guidelines for standard lanyard badge pouch (CR-100 format).
                </div>
                <div className="tracking-line">
                  DPSI-2026 • CREDENTIAL ID: {activeCredentialId} • OFFICIAL SUMMIT PASS
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PROFESSIONAL PRINT STYLESHEET */}
      {/* ========================================================================= */}
      <style jsx global>{`
        /* Screen media: hide print mount completely */
        @media screen {
          #summit-print-mount {
            display: none !important;
          }
        }

        /* Print media: pure white background, production ready, zero dark bleed */
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 6.5mm;
          }

          *,
          *::before,
          *::after {
            box-shadow: none !important;
            text-shadow: none !important;
          }

          html,
          body,
          #__next,
          div#__next,
          .min-h-screen,
          main {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: auto !important;
            height: auto !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide on-screen UI */
          #summit-screen-ui,
          .no-print,
          nav,
          header,
          footer,
          button,
          input,
          select {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
          }

          /* Show dedicated print mount */
          #summit-print-mount {
            display: block !important;
            visibility: visible !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* A4 Batch Sheets */
          .a4-sheet {
            width: 197mm !important;
            height: 268mm !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            overflow: hidden !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
          }

          .a4-sheet-8 {
            display: grid !important;
            grid-template-columns: repeat(2, 98.5mm) !important;
            grid-template-rows: repeat(4, 67.0mm) !important;
          }

          .a4-sheet-4 {
            display: grid !important;
            grid-template-columns: repeat(2, 98.5mm) !important;
            grid-template-rows: repeat(2, 134.0mm) !important;
          }

          .a4-sheet-1 {
            display: grid !important;
            grid-template-columns: 197mm !important;
            grid-template-rows: 268mm !important;
          }

          .card-cell {
            box-sizing: border-box !important;
            padding: 1mm !important;
            border: 0.5pt dashed #cbd5e1 !important; /* Guillotine / scissors cut line */
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
          }

          .card-cell svg {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            display: block !important;
          }

          /* Single Card A4 Sheet */
          .single-a4-sheet {
            width: 197mm !important;
            height: 268mm !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 15mm 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            page-break-after: always !important;
            break-after: page !important;
          }

          .single-a4-header {
            text-align: center !important;
            margin-bottom: 10mm !important;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif !important;
          }

          .single-a4-header .school-title {
            font-size: 8.5pt !important;
            font-weight: 700 !important;
            letter-spacing: 0.15em !important;
            color: #64748b !important;
            text-transform: uppercase !important;
          }

          .single-a4-header .event-title {
            font-size: 11pt !important;
            font-weight: 800 !important;
            letter-spacing: 0.05em !important;
            color: #0f172a !important;
            margin-top: 1.5mm !important;
          }

          .single-a4-header .spec-meta {
            font-size: 7.5pt !important;
            color: #94a3b8 !important;
            font-family: monospace !important;
            margin-top: 1.5mm !important;
          }

          .single-badge-cut-frame {
            width: 150mm !important;
            height: 102mm !important;
            border: 0.75pt dashed #94a3b8 !important;
            padding: 2mm !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            margin: 0 auto !important;
            border-radius: 4mm !important;
          }

          .single-badge-svg-container {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
          }

          .single-badge-svg-container svg {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            display: block !important;
          }

          .single-a4-footer {
            text-align: center !important;
            margin-top: 10mm !important;
            font-family: monospace !important;
            font-size: 8pt !important;
            color: #64748b !important;
            line-height: 1.5 !important;
          }

          .single-a4-footer .cut-instructions {
            font-weight: 600 !important;
            color: #475569 !important;
          }

          .single-a4-footer .tracking-line {
            color: #94a3b8 !important;
            letter-spacing: 0.08em !important;
            margin-top: 1mm !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function PassAndAttendancePortal() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-mono text-sm">
          Loading Summit Gateway...
        </div>
      }
    >
      <PassAndAttendanceContent />
    </Suspense>
  );
}
