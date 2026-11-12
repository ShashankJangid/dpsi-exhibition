'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Upload,
} from 'lucide-react';
import jsQR from 'jsqr';
import { detectTopotagFailsafe, matchTopotagBitmask } from '@/lib/topotagDetector';
import {
  OFFICIAL_STUDENTS_ROSTER,
  OFFICIAL_TEACHERS_AND_INCHARGES,
  OFFICIAL_VIP_GUESTS,
  OFFICIAL_GRAND_JURY,
  PROPRIETARY_ACCESS_CODES,
  StudentEntry,
  TeacherEntry,
  VipGuestEntry,
  GrandJuryEntry,
  getStudentCredentialId,
  getStudentBoothInfo,
} from '@/data/exhibitionRegistry';
import { generateAppleCardSvg, generateMicroQrModules, generateTopotagCells } from '@/lib/badgeGenerator';
import { playChime, triggerHaptic } from '@/lib/sound';

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

const ATTENDANCE_STORAGE_KEY = 'dpsi_exhibition_attendance_v2';
const ATTENDANCE_INCHARGE_STORAGE_KEY = 'dpsi_exhibition_attendance_incharge_v2';
const ATTENDANCE_VIP_STORAGE_KEY = 'dpsi_exhibition_attendance_vip_v2';
const ATTENDANCE_JURY_STORAGE_KEY = 'dpsi_exhibition_attendance_jury_v2';

export type AttendanceSectionType = 'STUDENTS' | 'INCHARGES' | 'VIP_GUESTS' | 'GRAND_JURY';

export interface AttendanceRecord {
  studentName: string;
  classSection: string;
  projectNumber: number;
  projectTitle: string;
  mentor?: string;
  passCode: string;
  accessCode?: string;
  checkedIn: boolean;
  checkInTime?: string;
  timestamp?: string;
}

export interface InchargeAttendanceRecord {
  name: string;
  role: string;
  credentialId: string;
  passCode: string;
  checkedIn: boolean;
  checkInTime?: string;
  timestamp?: string;
}

export interface VipAttendanceRecord {
  name: string;
  designation: string;
  organization: string;
  credentialId: string;
  passCode: string;
  checkedIn: boolean;
  checkInTime?: string;
  timestamp?: string;
}

export interface JuryAttendanceRecord {
  name: string;
  specialization: string;
  institution: string;
  credentialId: string;
  passCode: string;
  checkedIn: boolean;
  checkInTime?: string;
  timestamp?: string;
}


/**
 * Apple Card CR-100 Interactive 3D Card
 * Features real-time pointer-tracking gyroscopic tilt, physical depth perspective,
 * dynamic specular light reflection (Apple Wallet glare), and ambient role backlight.
 */
function InteractiveAppleCard({
  svgContent,
  roleAccent = '#065f46',
}: {
  svgContent: string;
  roleAccent?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Disable gyroscopic 3D tilt on touch devices so vertical page scrolling is never blocked
    if (e.pointerType === 'touch') return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -8.5; // max 8.5 deg
    const rotY = ((x - centerX) / centerX) * 10.5; // max 10.5 deg

    setRotateX(rotX);
    setRotateY(rotY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.38,
    });
  };

  const handlePointerLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: '1400px' }}
      className="relative w-full max-w-4xl mx-auto flex items-center justify-center p-2 sm:p-4 select-none touch-pan-y"
    >
      {/* Dynamic Ambient Role Glow (Subtle velvet spotlight) */}
      <div
        className="absolute -inset-4 sm:-inset-8 rounded-[36px] blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse at center, ${roleAccent} 0%, transparent 70%)`,
        }}
      />

      {/* 3D Physical Card Chassis */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
          transition: rotateX === 0 && rotateY === 0 ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          transformStyle: 'preserve-3d',
          touchAction: 'pan-y',
        }}
        className="relative w-full aspect-[985/670] rounded-2xl sm:rounded-[28px] overflow-hidden bg-white shadow-[0_30px_70px_-15px_rgba(0,0,0,0.65)] will-change-transform border border-slate-200/50"
      >
        {/* SVG Face */}
        <div
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />

        {/* Dynamic Specular Sheen (Apple Wallet Glare) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-overlay"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 380px at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)`,
          }}
        />

        {/* Machined Titanium Beveled Rim */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-[28px] pointer-events-none ring-1 ring-inset ring-white/30 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.6)]" />
      </div>
    </div>
  );
}

/**
 * Precomputed O(1) lookup set of all 197 official registered summit credential IDs.
 * Prevents random non-summit QR codes or optical noise from ever triggering false detections.
 */
const REGISTERED_CREDENTIAL_IDS: Set<string> = (() => {
  const set = new Set<string>();
  for (const s of OFFICIAL_STUDENTS_ROSTER) {
    set.add(getStudentCredentialId(s).toUpperCase());
  }
  for (const t of OFFICIAL_TEACHERS_AND_INCHARGES) {
    set.add(t.credential_id.toUpperCase());
  }
  for (const j of OFFICIAL_GRAND_JURY) {
    set.add(j.credential_id.toUpperCase());
  }
  for (const v of OFFICIAL_VIP_GUESTS) {
    set.add(v.credential_id.toUpperCase());
  }
  set.add('STAFF-2026');
  return set;
})();

/**
 * Strictly extracts and validates a registered DPSI Summit Credential ID from an optical payload.
 * Returns null if the payload does not correspond to a genuine registered summit pass.
 */
function extractVerifiedOpticalCredentialId(rawPayload: string): string | null {
  if (!rawPayload) return null;
  const trimmed = rawPayload.trim();
  const urlMatch = trimmed.match(/[?&]id=([A-Z0-9-]+)/i);
  if (urlMatch && urlMatch[1]) {
    const id = urlMatch[1].toUpperCase();
    if (REGISTERED_CREDENTIAL_IDS.has(id)) return id;
  }
  const directMatch = trimmed.match(/\b(EXH-\d{4}(?:-\d{2})?|INC-\d{4}|VIP-\d{4}|JDG-\d{4}|STAFF-2026)\b/i);
  if (directMatch && directMatch[1]) {
    const id = directMatch[1].toUpperCase();
    if (REGISTERED_CREDENTIAL_IDS.has(id)) return id;
  }
  return null;
}

/**
 * Industrial-Grade Multi-Pass Optical Scanner for Micro-QR Codes (Optimized for both Print & Phone Screens):
 * Pass 1: Center target reticle crop (natural contrast + attemptBoth)
 * Pass 2: Local Min-Max Contrast-Stretched Binarized center crop (eliminates OLED/LCD phone screen glare & bloom)
 * Pass 3: 2x Upscaled Tight Center Zoom with Local Min-Max Binarization (resolves small phone-screen QR codes held at a distance)
 * Pass 4: Lower-right QR quadrant (standard Apple Card CR-100 placement + local contrast binarization)
 * Pass 5: Full frame
 */
function scanImageDataWithMultiPass(imageData: ImageData): { data: string; credentialId: string; method: string } | null {
  const { width, height, data } = imageData;

  const validateCode = (code: { data: string } | null, method: string) => {
    if (!code || !code.data) return null;
    const raw = code.data.trim();
    if (!raw) return null;
    const verifiedId = extractVerifiedOpticalCredentialId(raw);
    if (!verifiedId) return null;
    return { data: verifiedId, credentialId: verifiedId, method };
  };

  // Pass 1 & 2: Center crop (primary target reticle where users hold phone or printed pass)
  if (width >= 100 && height >= 100) {
    const cx = Math.floor(width * 0.16);
    const cy = Math.floor(height * 0.14);
    const cw = Math.floor(width * 0.68);
    const ch = Math.floor(height * 0.72);
    const cData = new Uint8ClampedArray(cw * ch * 4);
    const lums = new Float32Array(cw * ch);
    let minLum = 255;
    let maxLum = 0;
    let lumSum = 0;

    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const srcIdx = ((cy + y) * width + (cx + x)) * 4;
        const pxIdx = y * cw + x;
        const dstIdx = pxIdx * 4;
        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];
        cData[dstIdx] = r;
        cData[dstIdx + 1] = g;
        cData[dstIdx + 2] = b;
        cData[dstIdx + 3] = 255;
        const lum = (r * 299 + g * 587 + b * 114) / 1000;
        lums[pxIdx] = lum;
        lumSum += lum;
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }
    }

    const resCenter = validateCode(jsQR(cData, cw, ch, { inversionAttempts: 'attemptBoth' }), 'QR_CENTER');
    if (resCenter) return resCenter;

    // Pass 2: Local Min-Max Contrast Stretch Binarization (defeats phone screen backlight glare where dark QR modules appear grey)
    const avgLum = lumSum / (cw * ch);
    const localMid = minLum + (maxLum - minLum) * 0.52;
    const threshold = Math.max(70, Math.min(205, (avgLum * 0.92 + localMid) * 0.5));
    for (let i = 0; i < lums.length; i++) {
      const val = lums[i] < threshold ? 0 : 255;
      const dstIdx = i * 4;
      cData[dstIdx] = val;
      cData[dstIdx + 1] = val;
      cData[dstIdx + 2] = val;
    }
    const resBinary = validateCode(jsQR(cData, cw, ch, { inversionAttempts: 'dontInvert' }), 'QR_CENTER_ENHANCED');
    if (resBinary) return resBinary;
  }

  // Pass 3: 2x Upscaled Tight Center Zoom (resolves small Micro-QR codes on phone screens held 15-40cm from laptop webcam)
  if (width >= 160 && height >= 160) {
    const zx = Math.floor(width * 0.28);
    const zy = Math.floor(height * 0.24);
    const zw = Math.floor(width * 0.44);
    const zh = Math.floor(height * 0.52);
    const upW = zw * 2;
    const upH = zh * 2;
    if (upW <= 1280 && upH <= 1280) {
      let zMin = 255;
      let zMax = 0;
      const zLums = new Float32Array(zw * zh);
      for (let y = 0; y < zh; y++) {
        for (let x = 0; x < zw; x++) {
          const srcIdx = ((zy + y) * width + (zx + x)) * 4;
          const lum = (data[srcIdx] * 299 + data[srcIdx + 1] * 587 + data[srcIdx + 2] * 114) / 1000;
          zLums[y * zw + x] = lum;
          if (lum < zMin) zMin = lum;
          if (lum > zMax) zMax = lum;
        }
      }
      const zThresh = zMin + (zMax - zMin) * 0.54;
      const upData = new Uint8ClampedArray(upW * upH * 4);
      for (let y = 0; y < upH; y++) {
        const srcY = y >> 1;
        for (let x = 0; x < upW; x++) {
          const srcX = x >> 1;
          const lum = zLums[srcY * zw + srcX];
          const val = lum < zThresh ? 0 : 255;
          const dstIdx = (y * upW + x) * 4;
          upData[dstIdx] = val;
          upData[dstIdx + 1] = val;
          upData[dstIdx + 2] = val;
          upData[dstIdx + 3] = 255;
        }
      }
      const resZoom = validateCode(jsQR(upData, upW, upH, { inversionAttempts: 'dontInvert' }), 'QR_PHONE_ZOOM_2X');
      if (resZoom) return resZoom;
    }
  }

  // Pass 4: Lower-right QR quadrant (full CR-100 badge framing)
  if (width >= 80 && height >= 80) {
    const qx = Math.floor(width * 0.46);
    const qy = Math.floor(height * 0.36);
    const qw = width - qx;
    const qh = height - qy;
    const qData = new Uint8ClampedArray(qw * qh * 4);
    for (let y = 0; y < qh; y++) {
      for (let x = 0; x < qw; x++) {
        const srcIdx = ((qy + y) * width + (qx + x)) * 4;
        const dstIdx = (y * qw + x) * 4;
        qData[dstIdx] = data[srcIdx];
        qData[dstIdx + 1] = data[srcIdx + 1];
        qData[dstIdx + 2] = data[srcIdx + 2];
        qData[dstIdx + 3] = 255;
      }
    }
    const resQuad = validateCode(jsQR(qData, qw, qh, { inversionAttempts: 'attemptBoth' }), 'QR_QUADRANT');
    if (resQuad) return resQuad;
  }

  // Pass 5: Full frame
  const resFull = validateCode(jsQR(data, width, height, { inversionAttempts: 'attemptBoth' }), 'QR_FULL');
  if (resFull) return resFull;

  return null;
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

  // Synchronize authentication state when URL query access code parameter changes
  useEffect(() => {
    const code = (searchParams.get('code') || '').trim().toUpperCase();
    if (code) {
      queueMicrotask(() => {
        setAccessCode(code);
        if (code === PROPRIETARY_ACCESS_CODES.STUDENT_DEFAULT) {
          setIsCodeUnlocked(true);
          setUnlockedRole('EXHIBITOR');
        } else if (code === PROPRIETARY_ACCESS_CODES.TEACHER_INCHARGE) {
          setIsCodeUnlocked(true);
          setUnlockedRole('INCHARGE');
        } else if (code === PROPRIETARY_ACCESS_CODES.STAFF_OPS) {
          setIsCodeUnlocked(true);
          setUnlockedRole('STAFF');
        } else if (code === PROPRIETARY_ACCESS_CODES.JUDGE_PANEL) {
          setIsCodeUnlocked(true);
          setUnlockedRole('JUDGE');
        } else if (code === PROPRIETARY_ACCESS_CODES.VIP_DELEGATE) {
          setIsCodeUnlocked(true);
          setUnlockedRole('VIP');
        }
      });
    }
  }, [searchParams]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'pass' | 'attendance' | 'batch_print' | 'scanner'>('pass');

  // Student Innovator Pass State
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentEntry>(() => OFFICIAL_STUDENTS_ROSTER[0]);

  // Faculty Incharge / Teacher Pass State
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherEntry>(() => OFFICIAL_TEACHERS_AND_INCHARGES[0]);
  const [facultyCustomName, setFacultyCustomName] = useState('Shashank Jangid');
  const [facultyCustomId, setFacultyCustomId] = useState('INC-0001');

  // Incharge pass generator roster view tab
  const [inchargePassRoster, setInchargePassRoster] = useState<'INCHARGES' | 'VIP_GUESTS' | 'GRAND_JURY'>('INCHARGES');

  // Grand Jury Pass State (Official Evaluators)
  const [selectedJudge, setSelectedJudge] = useState<GrandJuryEntry>(() => OFFICIAL_GRAND_JURY[0]);

  // VIP Guest Pass State (Official Dignitaries & Patrons)
  const [selectedVip, setSelectedVip] = useState<VipGuestEntry>(() => OFFICIAL_VIP_GUESTS[0]);

  // Batch Print Roster Selector & Selection Sets
  const [batchPrintRoster, setBatchPrintRoster] = useState<'STUDENTS' | 'INCHARGES' | 'VIP_GUESTS' | 'GRAND_JURY'>('STUDENTS');
  const [selectedInchargeIdsForPrint, setSelectedInchargeIdsForPrint] = useState<Set<string>>(
    () => new Set(OFFICIAL_TEACHERS_AND_INCHARGES.map((t) => t.credential_id))
  );
  const [selectedVipIdsForPrint, setSelectedVipIdsForPrint] = useState<Set<string>>(
    () => new Set(OFFICIAL_VIP_GUESTS.map((v) => v.credential_id))
  );
  const [selectedJuryIdsForPrint, setSelectedJuryIdsForPrint] = useState<Set<string>>(
    () => new Set(OFFICIAL_GRAND_JURY.map((j) => j.credential_id))
  );

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
    return OFFICIAL_STUDENTS_ROSTER.map((s) => ({
      studentName: s.student_name,
      classSection: s.class_section,
      projectNumber: s.project_number,
      projectTitle: s.project_title,
      mentor: s.mentor,
      passCode: getStudentCredentialId(s),
      accessCode: s.pass_code,
      checkedIn: false,
    }));
  });

  // 4 Sections Attendance State
  const [attendanceActiveSection, setAttendanceActiveSection] = useState<AttendanceSectionType>('STUDENTS');

  // Incharge Attendance
  const [inchargeAttendanceList, setInchargeAttendanceList] = useState<InchargeAttendanceRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ATTENDANCE_INCHARGE_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return OFFICIAL_TEACHERS_AND_INCHARGES.map((t) => ({
      name: t.name,
      role: 'Faculty Incharge',
      credentialId: t.credential_id,
      passCode: t.pass_code,
      checkedIn: false,
    }));
  });

  // VIP Guests Attendance
  const [vipAttendanceList, setVipAttendanceList] = useState<VipAttendanceRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ATTENDANCE_VIP_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return OFFICIAL_VIP_GUESTS.map((v) => ({
      name: v.name,
      designation: v.designation,
      organization: v.organization,
      credentialId: v.credential_id,
      passCode: v.pass_code,
      checkedIn: false,
    }));
  });

  // Grand Jury Attendance
  const [juryAttendanceList, setJuryAttendanceList] = useState<JuryAttendanceRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ATTENDANCE_JURY_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return OFFICIAL_GRAND_JURY.map((j) => ({
      name: j.name,
      specialization: j.specialization,
      institution: j.institution,
      credentialId: j.credential_id,
      passCode: j.pass_code,
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
    scanMethod?: 'QR_CODE' | 'TOPOTAG_FAILSAFE';
    hammingDistance?: number;
    student?: StudentEntry;
    record?: AttendanceRecord;
    specialRole?: {
      title: string;
      name: string;
      role: string;
      credentialId: string;
      venueLocation: string;
    };
    message?: string;
  } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanActiveIndicator, setScanActiveIndicator] = useState(false);
  const [scannerFocusStage, setScannerFocusStage] = useState<'MICRO_QR_PRIMARY' | 'TOPOTAG_FAILSAFE_STANDBY'>('MICRO_QR_PRIMARY');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPhoneScanModalOpen, setIsPhoneScanModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);
  const lastScannedCodeRef = useRef<string | null>(null);
  const lastDetectedTimeRef = useRef<number>(0);

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

  const inchargeAttendanceListRef = useRef(inchargeAttendanceList);
  useEffect(() => {
    inchargeAttendanceListRef.current = inchargeAttendanceList;
  }, [inchargeAttendanceList]);

  const vipAttendanceListRef = useRef(vipAttendanceList);
  useEffect(() => {
    vipAttendanceListRef.current = vipAttendanceList;
  }, [vipAttendanceList]);

  const juryAttendanceListRef = useRef(juryAttendanceList);
  useEffect(() => {
    juryAttendanceListRef.current = juryAttendanceList;
  }, [juryAttendanceList]);

  // Save attendance
  const saveAttendance = useCallback((records: AttendanceRecord[]) => {
    setAttendanceList(records);
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // storage unavailable
    }
  }, []);

  const saveInchargeAttendance = useCallback((records: InchargeAttendanceRecord[]) => {
    setInchargeAttendanceList(records);
    try {
      localStorage.setItem(ATTENDANCE_INCHARGE_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // storage unavailable
    }
  }, []);

  const saveVipAttendance = useCallback((records: VipAttendanceRecord[]) => {
    setVipAttendanceList(records);
    try {
      localStorage.setItem(ATTENDANCE_VIP_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // storage unavailable
    }
  }, []);

  const saveJuryAttendance = useCallback((records: JuryAttendanceRecord[]) => {
    setJuryAttendanceList(records);
    try {
      localStorage.setItem(ATTENDANCE_JURY_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // storage unavailable
    }
  }, []);

  // Optical & Manual code scanner check
  const handleScanCode = useCallback((code: string, scanMethod: 'QR_CODE' | 'TOPOTAG_FAILSAFE' = 'QR_CODE', hammingDistance?: number) => {
    let clean = code.trim().toUpperCase();
    if (!clean) return;

    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Handle full URL strings (e.g. https://.../pass?id=EXH-0036-01&name=OJAS+SINGH)
    const urlParamMatch = code.match(/[?&]id=([A-Z0-9-]+)/i);
    const urlNameMatch = code.match(/[?&]name=([^&#]+)/i);
    const decodedUrlName = urlNameMatch
      ? decodeURIComponent(urlNameMatch[1].replace(/\+/g, ' ')).trim().toUpperCase()
      : '';

    if (urlParamMatch) {
      clean = urlParamMatch[1].toUpperCase();
    } else {
      const exhMatch = clean.match(/EXH-\d{4}(-\d{2})?/i);
      if (exhMatch) {
        clean = exhMatch[0].toUpperCase();
      }
    }

    // A. Recognition of Faculty In-Charge passes (8 Registered Teachers & INC- IDs)
    const matchedTeacher = OFFICIAL_TEACHERS_AND_INCHARGES.find(
      (t) =>
        t.credential_id.toUpperCase() === clean ||
        t.name.trim().toUpperCase() === clean ||
        (decodedUrlName && t.name.trim().toUpperCase() === decodedUrlName)
    );

    if (
      matchedTeacher ||
      clean.startsWith('INC-') ||
      clean === PROPRIETARY_ACCESS_CODES.TEACHER_INCHARGE ||
      clean.includes('INCHARGE') ||
      clean.includes('FACULTY')
    ) {
      const teacherName = matchedTeacher?.name || selectedTeacher?.name || facultyCustomName || 'FACULTY IN-CHARGE';
      const teacherId = matchedTeacher?.credential_id || selectedTeacher?.credential_id || 'INC-0001';

      // Record in Faculty Incharge Attendance
      const updatedTeachers = inchargeAttendanceListRef.current.map((t) => {
        if (t.credentialId.toUpperCase() === teacherId.toUpperCase() || t.name.toUpperCase() === teacherName.toUpperCase()) {
          return {
            ...t,
            checkedIn: true,
            checkInTime: t.checkedIn ? t.checkInTime : nowTime,
            timestamp: t.timestamp || nowTime,
          };
        }
        return t;
      });
      saveInchargeAttendance(updatedTeachers);

      setScannedResult({
        found: true,
        scanMethod,
        hammingDistance,
        specialRole: {
          title: 'DELHI PUBLIC SCHOOL INDIRAPURAM',
          name: teacherName,
          role: 'FACULTY INCHARGE • 2026',
          credentialId: teacherId,
          venueLocation: 'Exhibition Floor',
        },
        message: scanMethod === 'TOPOTAG_FAILSAFE'
          ? `[TOPOTAG OPTICAL RECOVERY] Verified Faculty In-charge (${teacherName}) attendance authenticated as PRESENT via TopoTag invariant matrix.`
          : `Verified Faculty In-charge (${teacherName}) attendance authenticated as PRESENT.`,
      });
      return;
    }

    // B. Recognition of Grand Jury passes
    const matchedJury = OFFICIAL_GRAND_JURY.find(
      (j) =>
        j.credential_id.toUpperCase() === clean ||
        j.name.trim().toUpperCase() === clean ||
        (decodedUrlName && j.name.trim().toUpperCase() === decodedUrlName)
    );

    if (
      matchedJury ||
      clean.startsWith('JDG-') ||
      clean === 'JURY-2026' ||
      clean === PROPRIETARY_ACCESS_CODES.JUDGE_PANEL ||
      clean.includes('JURY') ||
      clean.includes('JUDGE')
    ) {
      const juryName = matchedJury?.name || 'HONORABLE GRAND JURY EVALUATOR';
      const juryId = matchedJury?.credential_id || 'JDG-0001';
      const jurySpec = matchedJury ? `${matchedJury.specialization} • ${matchedJury.institution}` : 'GRAND JURY EVALUATOR • ALL-POD ACCESS';

      // Record in Grand Jury Attendance
      const updatedJury = juryAttendanceListRef.current.map((j) => {
        if (j.credentialId.toUpperCase() === juryId.toUpperCase() || j.name.toUpperCase() === juryName.toUpperCase()) {
          return {
            ...j,
            checkedIn: true,
            checkInTime: j.checkedIn ? j.checkInTime : nowTime,
            timestamp: j.timestamp || nowTime,
          };
        }
        return j;
      });
      saveJuryAttendance(updatedJury);

      setScannedResult({
        found: true,
        scanMethod,
        hammingDistance,
        specialRole: {
          title: 'DPSI INNOVATION FEST 2026',
          name: juryName,
          role: jurySpec,
          credentialId: juryId,
          venueLocation: 'VIP & Evaluation Pavilion • Main Stage',
        },
        message: scanMethod === 'TOPOTAG_FAILSAFE'
          ? `[TOPOTAG OPTICAL RECOVERY] Verified Grand Jury Evaluator (${juryName}) attendance authenticated as PRESENT via TopoTag invariant matrix.`
          : `Verified Grand Jury Evaluator (${juryName}) attendance authenticated as PRESENT.`,
      });
      return;
    }

    // C. Recognition of VIP Delegate passes
    const matchedVip = OFFICIAL_VIP_GUESTS.find(
      (v) =>
        v.credential_id.toUpperCase() === clean ||
        v.name.trim().toUpperCase() === clean ||
        (decodedUrlName && v.name.trim().toUpperCase() === decodedUrlName)
    );

    if (
      matchedVip ||
      clean.startsWith('VIP-') ||
      clean === 'VIP-2026' ||
      clean === PROPRIETARY_ACCESS_CODES.VIP_DELEGATE ||
      clean.includes('VIP')
    ) {
      const vipName = matchedVip?.name || 'DISTINGUISHED VIP GUEST';
      const vipId = matchedVip?.credential_id || 'VIP-0001';
      const vipOrg = matchedVip ? `${matchedVip.designation} • ${matchedVip.organization}` : 'VIP DELEGATE • CEREMONIAL ENCLOSURE';

      // Record in VIP Attendance
      const updatedVip = vipAttendanceListRef.current.map((v) => {
        if (v.credentialId.toUpperCase() === vipId.toUpperCase() || v.name.toUpperCase() === vipName.toUpperCase()) {
          return {
            ...v,
            checkedIn: true,
            checkInTime: v.checkedIn ? v.checkInTime : nowTime,
            timestamp: v.timestamp || nowTime,
          };
        }
        return v;
      });
      saveVipAttendance(updatedVip);

      setScannedResult({
        found: true,
        scanMethod,
        hammingDistance,
        specialRole: {
          title: 'DISTINGUISHED SUMMIT DELEGATE',
          name: vipName,
          role: vipOrg,
          credentialId: vipId,
          venueLocation: 'Main Auditorium VIP Enclosure',
        },
        message: scanMethod === 'TOPOTAG_FAILSAFE'
          ? `[TOPOTAG OPTICAL RECOVERY] Distinguished VIP Delegate (${vipName}) attendance authenticated as PRESENT via TopoTag invariant matrix.`
          : `Distinguished VIP Delegate (${vipName}) attendance authenticated as PRESENT.`,
      });
      return;
    }

    // D. Recognition of Operations / Staff passes
    if (
      clean === 'STAFF-2026' ||
      clean === PROPRIETARY_ACCESS_CODES.STAFF_OPS ||
      clean.includes('STAFF')
    ) {
      setScannedResult({
        found: true,
        scanMethod,
        hammingDistance,
        specialRole: {
          title: 'OPERATIONS & MARSHAL CREW',
          name: 'SUMMIT OPERATIONS STAFF',
          role: 'OPERATIONS & LOGISTICS CREW',
          credentialId: 'STAFF-2026',
          venueLocation: 'Central Event Operations Desk',
        },
        message: scanMethod === 'TOPOTAG_FAILSAFE'
          ? '[TOPOTAG OPTICAL RECOVERY] Summit Operations & Event Control credentials authenticated via TopoTag.'
          : 'Summit Operations & Event Control credentials authenticated.',
      });
      return;
    }

    // E. Strict Match for Student Exhibitors (Eliminates team member collision bug)
    let matchedStudent = OFFICIAL_STUDENTS_ROSTER.find(
      (s) => getStudentCredentialId(s).toUpperCase() === clean
    );

    // If not matched by exact credential ID, match by URL decoded name or raw name
    if (!matchedStudent && decodedUrlName) {
      matchedStudent = OFFICIAL_STUDENTS_ROSTER.find(
        (s) => s.student_name.trim().toUpperCase() === decodedUrlName
      );
    }
    if (!matchedStudent) {
      matchedStudent = OFFICIAL_STUDENTS_ROSTER.find(
        (s) => s.student_name.trim().toUpperCase() === clean
      );
    }

    const matchedRecord = matchedStudent
      ? attendanceList.find(
          (r) =>
            r.studentName.toUpperCase() === matchedStudent!.student_name.toUpperCase() &&
            r.projectNumber === matchedStudent!.project_number
        )
      : attendanceList.find(
          (r) =>
            r.passCode.toUpperCase() === clean ||
            r.studentName.toUpperCase() === clean
        );

    const finalStudent = matchedStudent || (matchedRecord
      ? OFFICIAL_STUDENTS_ROSTER.find(
          (s) =>
            s.student_name.toUpperCase() === matchedRecord.studentName.toUpperCase() &&
            s.project_number === matchedRecord.projectNumber
        )
      : undefined);

    if (finalStudent) {
      const nowTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const wasAlreadyCheckedIn = matchedRecord?.checkedIn;

      // Automatically mark attendance as PRESENT on the official ledger
      const updatedList = attendanceList.map((rec) => {
        if (
          rec.studentName.toUpperCase() === finalStudent.student_name.toUpperCase() &&
          rec.projectNumber === finalStudent.project_number
        ) {
          return {
            ...rec,
            checkedIn: true,
            timestamp: rec.checkedIn ? rec.timestamp : nowTime,
          };
        }
        return rec;
      });
      saveAttendance(updatedList);

      setScannedResult({
        found: true,
        scanMethod,
        hammingDistance,
        student: finalStudent,
        record: {
          studentName: finalStudent.student_name,
          classSection: finalStudent.class_section,
          projectNumber: finalStudent.project_number,
          projectTitle: finalStudent.project_title,
          passCode: finalStudent.pass_code,
          checkedIn: true,
          checkInTime: wasAlreadyCheckedIn ? (matchedRecord?.checkInTime || nowTime) : nowTime,
          timestamp: wasAlreadyCheckedIn ? (matchedRecord?.timestamp || nowTime) : nowTime,
        },
        message: scanMethod === 'TOPOTAG_FAILSAFE'
          ? `[TOPOTAG OPTICAL RECOVERY] Authenticated! Student ${finalStudent.student_name} recorded as PRESENT via TopoTag invariant matrix.`
          : wasAlreadyCheckedIn
          ? `Verified! Student was already checked in at ${matchedRecord?.timestamp || nowTime}.`
          : `Authenticated! Attendance recorded as PRESENT on the official summit ledger.`,
      });
    } else {
      setScannedResult({
        found: false,
        scanMethod,
        message: `Credential code "${clean}" not found on the official summit registry. Please verify with the Registration Desk.`,
      });
    }
  }, [attendanceList, facultyCustomName, selectedTeacher, saveAttendance, saveInchargeAttendance, saveVipAttendance, saveJuryAttendance]);

  const handleScanCodeRef = useRef(handleScanCode);

  useEffect(() => {
    handleScanCodeRef.current = handleScanCode;
  }, [handleScanCode]);

  useEffect(() => {
    if (!isCameraActive || !streamRef.current || !videoRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.setAttribute('playsinline', 'true');
    video.play().catch((err) => {
      console.warn('Video playback warning:', err);
    });

    let animationFrameId: number;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let lastScanTime = 0;

    // Industrial multi-frame consensus & Micro-QR priority state
    let missedQrFrames = 0;
    const recentTopotagHits: string[] = [];
    setScannerFocusStage('MICRO_QR_PRIMARY');

    // Optional hardware-accelerated BarcodeDetector (Chrome/Edge C++ ML engine — excels on phone screens)
    let nativeBarcodeDetector: { detect: (source: HTMLCanvasElement) => Promise<Array<{ rawValue?: string }>> } | null = null;
    try {
      const BD = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => typeof nativeBarcodeDetector }).BarcodeDetector;
      if (BD) {
        nativeBarcodeDetector = new BD({ formats: ['qr_code'] });
      }
    } catch {
      nativeBarcodeDetector = null;
    }

    const triggerVerifiedLock = (
      confirmedId: string,
      confirmedMethod: 'QR_CODE' | 'TOPOTAG_FAILSAFE',
      confirmedHamming?: number
    ) => {
      const now = performance.now();
      if (now - lastDetectedTimeRef.current < 3000) return;
      lastScannedCodeRef.current = confirmedId;
      lastDetectedTimeRef.current = now;
      setScannerInputCode(confirmedId);
      playChime();
      triggerHaptic(40);
      setScanActiveIndicator(true);
      setTimeout(() => setScanActiveIndicator(false), 1800);
      handleScanCodeRef.current(confirmedId, confirmedMethod, confirmedHamming);
    };

    const scanFrame = () => {
      if (video.readyState >= video.HAVE_CURRENT_DATA && ctx) {
        const now = performance.now();
        // Sample frame every 90ms (~11 FPS) for crisp optical lock on phone screens and printed cards
        if (now - lastScanTime > 90 && video.videoWidth > 0 && video.videoHeight > 0) {
          lastScanTime = now;

          // Enforce 3.0-second post-scan cooldown lock to prevent rapid-fire duplicate triggers
          if (now - lastDetectedTimeRef.current >= 3000) {
            const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
            const w = Math.floor(video.videoWidth * scale);
            const h = Math.floor(video.videoHeight * scale);

            if (w > 0 && h > 0) {
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(video, 0, 0, w, h);
              const imageData = ctx.getImageData(0, 0, w, h);

              // STAGE 1A: Hardware BarcodeDetector async check (if supported by browser)
              if (nativeBarcodeDetector) {
                nativeBarcodeDetector
                  .detect(canvas)
                  .then((barcodes) => {
                    for (const b of barcodes) {
                      const verified = extractVerifiedOpticalCredentialId(b.rawValue || '');
                      if (verified) {
                        missedQrFrames = 0;
                        recentTopotagHits.length = 0;
                        setScannerFocusStage('MICRO_QR_PRIMARY');
                        triggerVerifiedLock(verified, 'QR_CODE');
                        break;
                      }
                    }
                  })
                  .catch(() => {
                    // ignore native detector errors
                  });
              }

              // STAGE 1B (PRIMARY): Multi-pass jsQR with 2x phone-screen zoom & local min-max glare binarization
              const qrResult = scanImageDataWithMultiPass(imageData);

              if (qrResult && qrResult.credentialId) {
                // Verified registered Micro-QR visible (Reed-Solomon CRC + 197-ID allowlist = 0% false positive)
                missedQrFrames = 0;
                recentTopotagHits.length = 0;
                setScannerFocusStage((prev) => (prev !== 'MICRO_QR_PRIMARY' ? 'MICRO_QR_PRIMARY' : prev));
                triggerVerifiedLock(qrResult.credentialId, 'QR_CODE');
              } else {
                // No Micro-QR in this frame
                missedQrFrames++;

                // STAGE 2 (FAILSAFE): Engage TopoTag failsafe after 10 frames (~0.9s) with NO visible Micro-QR
                if (missedQrFrames >= 10) {
                  setScannerFocusStage((prev) =>
                    prev !== 'TOPOTAG_FAILSAFE_STANDBY' ? 'TOPOTAG_FAILSAFE_STANDBY' : prev
                  );
                  const topotagResult = detectTopotagFailsafe(imageData);
                  if (
                    topotagResult &&
                    topotagResult.credentialId &&
                    topotagResult.hammingDistance === 0 &&
                    REGISTERED_CREDENTIAL_IDS.has(topotagResult.credentialId.toUpperCase())
                  ) {
                    const tId = topotagResult.credentialId.toUpperCase();
                    recentTopotagHits.push(tId);
                    if (recentTopotagHits.length > 5) recentTopotagHits.shift();

                    // Require 2 frames within the last 5 frames agreeing on the exact 98-point TopoTag signature
                    const matchCount = recentTopotagHits.filter((id) => id === tId).length;
                    if (matchCount >= 2) {
                      recentTopotagHits.length = 0;
                      missedQrFrames = 0;
                      triggerVerifiedLock(tId, 'TOPOTAG_FAILSAFE', 0);
                    }
                  } else {
                    recentTopotagHits.push('');
                    if (recentTopotagHits.length > 5) recentTopotagHits.shift();
                  }
                }
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(scanFrame);
    };

    animationFrameId = requestAnimationFrame(scanFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleToggleInchargeAttendance = (credentialId: string) => {
    const updated = inchargeAttendanceList.map((r) => {
      if (r.credentialId === credentialId) {
        const nextState = !r.checkedIn;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...r,
          checkedIn: nextState,
          checkInTime: nextState ? now : undefined,
          timestamp: nextState ? now : undefined,
        };
      }
      return r;
    });
    saveInchargeAttendance(updated);
  };

  const handleToggleVipAttendance = (credentialId: string) => {
    const updated = vipAttendanceList.map((r) => {
      if (r.credentialId === credentialId) {
        const nextState = !r.checkedIn;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...r,
          checkedIn: nextState,
          checkInTime: nextState ? now : undefined,
          timestamp: nextState ? now : undefined,
        };
      }
      return r;
    });
    saveVipAttendance(updated);
  };

  const handleToggleJuryAttendance = (credentialId: string) => {
    const updated = juryAttendanceList.map((r) => {
      if (r.credentialId === credentialId) {
        const nextState = !r.checkedIn;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...r,
          checkedIn: nextState,
          checkInTime: nextState ? now : undefined,
          timestamp: nextState ? now : undefined,
        };
      }
      return r;
    });
    saveJuryAttendance(updated);
  };

  // Filter students for innovator lookup
  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return OFFICIAL_STUDENTS_ROSTER.slice(0, 15);
    const q = studentSearchQuery.toLowerCase().trim();
    return OFFICIAL_STUDENTS_ROSTER.filter((s) => {
      const boothInfo = getStudentBoothInfo(s.project_number);
      const credId = getStudentCredentialId(s).toLowerCase();
      return (
        s.student_name.toLowerCase().includes(q) ||
        s.class_section.toLowerCase().includes(q) ||
        s.project_title.toLowerCase().includes(q) ||
        s.pass_code.toLowerCase().includes(q) ||
        s.project_number.toString() === q ||
        credId.includes(q) ||
        boothInfo.booth_code.toLowerCase().includes(q) ||
        boothInfo.venue_location.toLowerCase().includes(q)
      );
    });
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

  // Enforce teacher-only access to optical live scanner
  useEffect(() => {
    if (currentRole !== 'INCHARGE' && activeTab === 'scanner') {
      queueMicrotask(() => {
        stopCamera();
        setActiveTab('pass');
      });
    }
  }, [currentRole, activeTab, stopCamera]);

  // Active Credential ID based on role, roster selection, and customizer
  const activeCredentialId = useMemo(() => {
    if (currentRole === 'EXHIBITOR') {
      return getStudentCredentialId(selectedStudent);
    }
    if (currentRole === 'INCHARGE') {
      if (inchargePassRoster === 'VIP_GUESTS') {
        return (selectedVip?.credential_id || 'VIP-0001').trim().toUpperCase();
      }
      if (inchargePassRoster === 'GRAND_JURY') {
        return (selectedJudge?.credential_id || 'JDG-0001').trim().toUpperCase();
      }
      return (selectedTeacher?.credential_id || facultyCustomId || 'INC-0001').trim().toUpperCase();
    }
    if (currentRole === 'JUDGE') {
      return (selectedJudge?.credential_id || otherCustomId || 'JDG-0001').trim().toUpperCase();
    }
    if (currentRole === 'VIP') {
      return (selectedVip?.credential_id || otherCustomId || 'VIP-0001').trim().toUpperCase();
    }
    return (otherCustomId || `${roleConfig.codePrefix}-0001`).trim().toUpperCase();
  }, [
    currentRole,
    inchargePassRoster,
    selectedStudent,
    selectedTeacher,
    selectedJudge,
    selectedVip,
    facultyCustomId,
    otherCustomId,
    roleConfig,
  ]);

  // Display name of the active credential holder
  const activeHolderName = useMemo(() => {
    if (currentRole === 'EXHIBITOR') return selectedStudent.student_name;
    if (currentRole === 'INCHARGE') {
      if (inchargePassRoster === 'VIP_GUESTS') return selectedVip?.name || 'Dr. V. K. Sharma';
      if (inchargePassRoster === 'GRAND_JURY') return selectedJudge?.name || 'Prof. Rajesh K. Pathak';
      return selectedTeacher?.name || facultyCustomName || 'Shashank Jangid';
    }
    if (currentRole === 'JUDGE') return selectedJudge?.name || otherCustomName || 'Prof. Rajesh K. Pathak';
    if (currentRole === 'VIP') return selectedVip?.name || otherCustomName || 'Dr. V. K. Sharma';
    return otherCustomName || roleConfig.classDefault;
  }, [
    currentRole,
    inchargePassRoster,
    selectedStudent,
    selectedTeacher,
    selectedJudge,
    selectedVip,
    facultyCustomName,
    otherCustomName,
    roleConfig,
  ]);

  // Dynamic SVG for the active pass
  const activeBadgeSvg = useMemo(() => {
    const effectiveRoleKey =
      currentRole === 'INCHARGE'
        ? inchargePassRoster === 'VIP_GUESTS'
          ? 'vip'
          : inchargePassRoster === 'GRAND_JURY'
          ? 'judge'
          : 'incharge'
        : currentRole.toLowerCase();

    const template = badgeTemplates[effectiveRoleKey];
    if (!template) return '';

    if (currentRole === 'EXHIBITOR') {
      const boothInfo = getStudentBoothInfo(selectedStudent);
      return generateAppleCardSvg(template, {
        name: selectedStudent.student_name,
        classSection: selectedStudent.class_section,
        credentialId: activeCredentialId,
        projectDomain: selectedStudent.project_title,
        venueLocation: selectedStudent.venue_location || boothInfo.venue_location,
      });
    }

    if (currentRole === 'INCHARGE') {
      if (inchargePassRoster === 'VIP_GUESTS') {
        const vipName = (selectedVip?.name || 'DR. V. K. SHARMA').trim().toUpperCase();
        return generateAppleCardSvg(template, {
          name: vipName,
          classSection: '',
          credentialId: activeCredentialId,
          projectDomain: '',
          venueLocation: '',
        });
      }
      if (inchargePassRoster === 'GRAND_JURY') {
        const judgeName = (selectedJudge?.name || 'PROF. RAJESH K. PATHAK').trim().toUpperCase();
        return generateAppleCardSvg(template, {
          name: judgeName,
          classSection: '',
          credentialId: activeCredentialId,
          projectDomain: '',
          venueLocation: '',
        });
      }
      const teacherName = (selectedTeacher?.name || facultyCustomName || 'SHASHANK JANGID').trim().toUpperCase();
      return generateAppleCardSvg(template, {
        name: teacherName,
        classSection: '',
        credentialId: activeCredentialId,
        projectDomain: '',
        venueLocation: '',
      });
    }

    if (currentRole === 'JUDGE') {
      const judgeName = (selectedJudge?.name || otherCustomName || 'PROF. RAJESH K. PATHAK').trim().toUpperCase();
      return generateAppleCardSvg(template, {
        name: judgeName,
        classSection: '',
        credentialId: activeCredentialId,
        projectDomain: '',
        venueLocation: '',
      });
    }

    if (currentRole === 'VIP') {
      const vipName = (selectedVip?.name || otherCustomName || 'DR. V. K. SHARMA').trim().toUpperCase();
      return generateAppleCardSvg(template, {
        name: vipName,
        classSection: '',
        credentialId: activeCredentialId,
        projectDomain: '',
        venueLocation: '',
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
    inchargePassRoster,
    selectedStudent,
    selectedTeacher,
    selectedJudge,
    selectedVip,
    roleConfig,
    activeCredentialId,
    facultyCustomName,
    otherCustomName,
    otherCustomRole,
    otherCustomOrg,
    otherCustomVenue,
  ]);

  // Selected cards for A4 batch print (Supports Students, Incharges, VIPs, and Grand Jury)
  const selectedCardsForPrintList = useMemo(() => {
    if (batchPrintRoster === 'INCHARGES') {
      return OFFICIAL_TEACHERS_AND_INCHARGES
        .filter((t) => selectedInchargeIdsForPrint.has(t.credential_id))
        .map((t) => ({
          key: t.credential_id,
          name: t.name.toUpperCase(),
          classSection: '',
          credentialId: t.credential_id,
          projectDomain: '',
          venueLocation: '',
          templateKey: 'incharge' as const,
        }));
    }
    if (batchPrintRoster === 'VIP_GUESTS') {
      return OFFICIAL_VIP_GUESTS
        .filter((v) => selectedVipIdsForPrint.has(v.credential_id))
        .map((v) => ({
          key: v.credential_id,
          name: v.name.toUpperCase(),
          classSection: '',
          credentialId: v.credential_id,
          projectDomain: '',
          venueLocation: '',
          templateKey: 'vip' as const,
        }));
    }
    if (batchPrintRoster === 'GRAND_JURY') {
      return OFFICIAL_GRAND_JURY
        .filter((j) => selectedJuryIdsForPrint.has(j.credential_id))
        .map((j) => ({
          key: j.credential_id,
          name: j.name.toUpperCase(),
          classSection: '',
          credentialId: j.credential_id,
          projectDomain: '',
          venueLocation: '',
          templateKey: 'judge' as const,
        }));
    }
    return OFFICIAL_STUDENTS_ROSTER
      .filter((s) => selectedStudentIdsForPrint.has(`${s.student_name}__${s.project_number}`))
      .map((s) => {
        const boothInfo = getStudentBoothInfo(s);
        return {
          key: `${s.student_name}__${s.project_number}`,
          name: s.student_name,
          classSection: s.class_section,
          credentialId: getStudentCredentialId(s),
          projectDomain: s.project_title,
          venueLocation: s.venue_location || boothInfo.venue_location,
          templateKey: 'exhibitor' as const,
        };
      });
  }, [
    batchPrintRoster,
    selectedStudentIdsForPrint,
    selectedInchargeIdsForPrint,
    selectedVipIdsForPrint,
    selectedJuryIdsForPrint,
  ]);

  // Chunk selected cards into A4 sheets
  const a4Sheets = useMemo(() => {
    const perPage = a4Layout === '8_PER_PAGE' ? 8 : a4Layout === '4_PER_PAGE' ? 4 : 1;
    const sheets: (typeof selectedCardsForPrintList)[] = [];
    for (let i = 0; i < selectedCardsForPrintList.length; i += perPage) {
      sheets.push(selectedCardsForPrintList.slice(i, i + perPage));
    }
    return sheets;
  }, [selectedCardsForPrintList, a4Layout]);

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

  // Filtered attendance for Students
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

  // Filtered attendance for Incharges
  const filteredInchargeAttendance = useMemo(() => {
    return inchargeAttendanceList.filter((rec) => {
      const matchesStatus =
        attendanceStatusFilter === 'ALL' ||
        (attendanceStatusFilter === 'PRESENT' && rec.checkedIn) ||
        (attendanceStatusFilter === 'ABSENT' && !rec.checkedIn);
      const q = attendanceSearchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        rec.name.toLowerCase().includes(q) ||
        rec.credentialId.toLowerCase().includes(q) ||
        rec.role.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [inchargeAttendanceList, attendanceStatusFilter, attendanceSearchQuery]);

  // Filtered attendance for VIP Guests
  const filteredVipAttendance = useMemo(() => {
    return vipAttendanceList.filter((rec) => {
      const matchesStatus =
        attendanceStatusFilter === 'ALL' ||
        (attendanceStatusFilter === 'PRESENT' && rec.checkedIn) ||
        (attendanceStatusFilter === 'ABSENT' && !rec.checkedIn);
      const q = attendanceSearchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        rec.name.toLowerCase().includes(q) ||
        rec.designation.toLowerCase().includes(q) ||
        rec.organization.toLowerCase().includes(q) ||
        rec.credentialId.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [vipAttendanceList, attendanceStatusFilter, attendanceSearchQuery]);

  // Filtered attendance for Grand Jury
  const filteredJuryAttendance = useMemo(() => {
    return juryAttendanceList.filter((rec) => {
      const matchesStatus =
        attendanceStatusFilter === 'ALL' ||
        (attendanceStatusFilter === 'PRESENT' && rec.checkedIn) ||
        (attendanceStatusFilter === 'ABSENT' && !rec.checkedIn);
      const q = attendanceSearchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        rec.name.toLowerCase().includes(q) ||
        rec.specialization.toLowerCase().includes(q) ||
        rec.institution.toLowerCase().includes(q) ||
        rec.credentialId.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [juryAttendanceList, attendanceStatusFilter, attendanceSearchQuery]);

  // Combined totals across all 4 categories
  const totalAttendeesAll = useMemo(() => {
    return attendanceList.length + inchargeAttendanceList.length + vipAttendanceList.length + juryAttendanceList.length;
  }, [attendanceList, inchargeAttendanceList, vipAttendanceList, juryAttendanceList]);

  const totalPresentAll = useMemo(() => {
    return (
      attendanceList.filter((a) => a.checkedIn).length +
      inchargeAttendanceList.filter((a) => a.checkedIn).length +
      vipAttendanceList.filter((a) => a.checkedIn).length +
      juryAttendanceList.filter((a) => a.checkedIn).length
    );
  }, [attendanceList, inchargeAttendanceList, vipAttendanceList, juryAttendanceList]);

  // Active category stats
  const activeSectionStats = useMemo(() => {
    if (attendanceActiveSection === 'INCHARGES') {
      const total = inchargeAttendanceList.length;
      const present = inchargeAttendanceList.filter((a) => a.checkedIn).length;
      return {
        title: 'Faculty Incharges',
        singular: 'Incharge',
        total,
        present,
        absent: total - present,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
        colorText: 'text-purple-300',
        colorBadge: 'bg-purple-950/20 border-purple-500/30',
        colorPill: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
      };
    }
    if (attendanceActiveSection === 'VIP_GUESTS') {
      const total = vipAttendanceList.length;
      const present = vipAttendanceList.filter((a) => a.checkedIn).length;
      return {
        title: 'VIP Delegates',
        singular: 'VIP Guest',
        total,
        present,
        absent: total - present,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
        colorText: 'text-amber-300',
        colorBadge: 'bg-amber-950/20 border-amber-500/30',
        colorPill: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      };
    }
    if (attendanceActiveSection === 'GRAND_JURY') {
      const total = juryAttendanceList.length;
      const present = juryAttendanceList.filter((a) => a.checkedIn).length;
      return {
        title: 'Grand Jury Evaluators',
        singular: 'Jury Evaluator',
        total,
        present,
        absent: total - present,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
        colorText: 'text-blue-300',
        colorBadge: 'bg-blue-950/20 border-blue-500/30',
        colorPill: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
      };
    }
    // Default STUDENTS
    const total = attendanceList.length;
    const present = attendanceList.filter((a) => a.checkedIn).length;
    return {
      title: 'Student Innovators',
      singular: 'Student',
      total,
      present,
      absent: total - present,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
      colorText: 'text-emerald-300',
      colorBadge: 'bg-emerald-950/20 border-emerald-500/30',
      colorPill: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    };
  }, [attendanceActiveSection, attendanceList, inchargeAttendanceList, vipAttendanceList, juryAttendanceList]);

  // Export attendance CSV
  const handleExportCsv = (mode: 'SECTION' | 'ALL' = 'SECTION') => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let fileName = `DPSI_Exhibition_2026_${attendanceActiveSection}_Attendance.csv`;

    if (mode === 'ALL') {
      headers = ['Category', 'Name', 'Role / Class', 'Organization / Project', 'Credential ID', 'Status', 'Check-In Timestamp'];
      const studentRows = attendanceList.map((r) => [
        'Student Innovator',
        `"${r.studentName.replace(/"/g, '""')}"`,
        `"${r.classSection}"`,
        `"Booth #${r.projectNumber} - ${r.projectTitle.replace(/"/g, '""')}"`,
        `"${r.passCode}"`,
        r.checkedIn ? 'PRESENT' : 'ABSENT',
        `"${r.checkInTime || 'N/A'}"`,
      ]);
      const inchargeRows = inchargeAttendanceList.map((r) => [
        'Faculty Incharge',
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.role}"`,
        '"Faculty Leadership"',
        `"${r.credentialId}"`,
        r.checkedIn ? 'PRESENT' : 'ABSENT',
        `"${r.checkInTime || 'N/A'}"`,
      ]);
      const vipRows = vipAttendanceList.map((r) => [
        'VIP Guest',
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.designation}"`,
        `"${r.organization.replace(/"/g, '""')}"`,
        `"${r.credentialId}"`,
        r.checkedIn ? 'PRESENT' : 'ABSENT',
        `"${r.checkInTime || 'N/A'}"`,
      ]);
      const juryRows = juryAttendanceList.map((r) => [
        'Grand Jury',
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.specialization}"`,
        `"${r.institution.replace(/"/g, '""')}"`,
        `"${r.credentialId}"`,
        r.checkedIn ? 'PRESENT' : 'ABSENT',
        `"${r.checkInTime || 'N/A'}"`,
      ]);
      rows = [...studentRows, ...inchargeRows, ...vipRows, ...juryRows];
      fileName = 'DPSI_Exhibition_2026_Master_Summit_Ledger.csv';
    } else if (attendanceActiveSection === 'STUDENTS') {
      headers = ['Student Name', 'Class & Section', 'Booth #', 'Project Title', 'Mentor', 'Pass Code', 'Status', 'Check-In Timestamp'];
      rows = attendanceList.map((r) => [
        `"${r.studentName.replace(/"/g, '""')}"`,
        `"${r.classSection}"`,
        r.projectNumber,
        `"${r.projectTitle.replace(/"/g, '""')}"`,
        `"${(r.mentor || '').replace(/"/g, '""')}"`,
        `"${r.passCode}"`,
        r.checkedIn ? 'PRESENT' : 'ABSENT',
        `"${r.checkInTime || 'N/A'}"`,
      ]);
    } else if (attendanceActiveSection === 'INCHARGES') {
      headers = ['Faculty Incharge Name', 'Role', 'Credential ID', 'Access Code', 'Status', 'Check-In Timestamp'];
      rows = inchargeAttendanceList.map((r) => [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.role}"`,
        `"${r.credentialId}"`,
        `"${r.passCode}"`,
        r.checkedIn ? 'PRESENT' : 'ABSENT',
        `"${r.checkInTime || 'N/A'}"`,
      ]);
    } else if (attendanceActiveSection === 'VIP_GUESTS') {
      headers = ['VIP Guest Name', 'Designation / Honor', 'Organization', 'Credential ID', 'Access Code', 'Status', 'Check-In Timestamp'];
      rows = vipAttendanceList.map((r) => [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.designation}"`,
        `"${r.organization.replace(/"/g, '""')}"`,
        `"${r.credentialId}"`,
        `"${r.passCode}"`,
        r.checkedIn ? 'PRESENT' : 'ABSENT',
        `"${r.checkInTime || 'N/A'}"`,
      ]);
    } else if (attendanceActiveSection === 'GRAND_JURY') {
      headers = ['Grand Jury Evaluator', 'Domain Specialization', 'Institution', 'Credential ID', 'Access Code', 'Status', 'Check-In Timestamp'];
      rows = juryAttendanceList.map((r) => [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.specialization}"`,
        `"${r.institution.replace(/"/g, '""')}"`,
        `"${r.credentialId}"`,
        `"${r.passCode}"`,
        r.checkedIn ? 'PRESENT' : 'ABSENT',
        `"${r.checkInTime || 'N/A'}"`,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
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

  // Start Camera (With mobile HTTP fallback detection)
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'Mobile Security Notice: Mobile browsers disable live video on local HTTP IPs. Tap "Take Photo with Phone Camera" below to scan passes with your camera!'
        );
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access denied or unavailable.';
      setCameraError(`${msg}. Tap "Take Photo with Phone Camera" below to snap and verify passes.`);
      console.error('Camera access error:', err);
    }
  };

  // Image File Scanner (Supports SVG vector passes, PNG, JPEG, WEBP)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // A. Native SVG pass inspection (Micro-QR primary, TopoTag failsafe if QR damaged/missing)
    if (file.name.toLowerCase().endsWith('.svg') || file.type === 'image/svg+xml') {
      const textReader = new FileReader();
      textReader.onload = (ev) => {
        const svgText = (ev.target?.result as string) || '';
        const qrGroupMatch = svgText.match(/<g transform="translate\(200, 32\)">([\s\S]*?)<\/g>/);
        const hasIntactMicroQr = Boolean(qrGroupMatch && qrGroupMatch[1].includes('shape-rendering="crispEdges"'));

        if (hasIntactMicroQr) {
          const urlMatch = svgText.match(/[?&]id=([A-Z0-9-]+)/i);
          const credMatch = svgText.match(/\b(EXH-\d{4}(?:-\d{2})?|INC-\d{4}|VIP-\d{4}|JDG-\d{4})\b/i);
          const idFound = urlMatch?.[1] || credMatch?.[1];
          if (idFound) {
            playChime();
            triggerHaptic(40);
            setScanActiveIndicator(true);
            setTimeout(() => setScanActiveIndicator(false), 1400);
            setScannerInputCode(idFound.toUpperCase());
            handleScanCode(idFound.toUpperCase(), 'QR_CODE');
            return;
          }
        }

        // Micro-QR not visible/intact in SVG -> fall back to TopoTag 18-cell invariant bitmask
        const ringMatches = [...svgText.matchAll(/data-cell="(\d+)"/g)].map((m) => parseInt(m[1], 10));
        if (ringMatches.length >= 5 && ringMatches.length <= 7) {
          let svgMask = 0;
          for (const idx of ringMatches) {
            svgMask |= 1 << idx;
          }
          const matchedTopo = matchTopotagBitmask(svgMask, 0);
          if (matchedTopo && matchedTopo.credentialId) {
            playChime();
            triggerHaptic(40);
            setScanActiveIndicator(true);
            setTimeout(() => setScanActiveIndicator(false), 1400);
            setScannerInputCode(matchedTopo.credentialId.toUpperCase());
            handleScanCode(matchedTopo.credentialId.toUpperCase(), 'TOPOTAG_FAILSAFE', 0);
            return;
          }
        }

        const encMatch = svgText.match(/(?:Topological Invariant Code Hexagons|TOPOTAG) \(Encoded ID:\s*([A-Z0-9-]+)\)/i);
        if (encMatch?.[1]) {
          playChime();
          triggerHaptic(40);
          setScanActiveIndicator(true);
          setTimeout(() => setScanActiveIndicator(false), 1400);
          setScannerInputCode(encMatch[1].toUpperCase());
          handleScanCode(encMatch[1].toUpperCase(), 'TOPOTAG_FAILSAFE', 0);
          return;
        }
      };
      textReader.readAsText(file);
      e.target.value = '';
      return;
    }

    // B. Raster image optical scanning (PNG, JPEG, WEBP, photo captures)
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        // Fill pure white background to ensure transparent images composite with high contrast
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const qrResult = scanImageDataWithMultiPass(imageData);
        if (qrResult) {
          playChime();
          triggerHaptic(40);
          setScanActiveIndicator(true);
          setTimeout(() => setScanActiveIndicator(false), 1400);
          setScannerInputCode(qrResult.data);
          handleScanCode(qrResult.data, 'QR_CODE');
        } else {
          // TopoTag Failsafe fallback
          const topotagResult = detectTopotagFailsafe(imageData);
          if (topotagResult && topotagResult.credentialId) {
            playChime();
            triggerHaptic(40);
            setScanActiveIndicator(true);
            setTimeout(() => setScanActiveIndicator(false), 1400);
            setScannerInputCode(topotagResult.credentialId);
            handleScanCode(topotagResult.credentialId, 'TOPOTAG_FAILSAFE', topotagResult.hammingDistance);
          } else {
            alert('No readable QR code or TopoTag signature detected in this image. Please ensure the cardlet is clear and well-lit.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* ========================================================================= */}
      {/* SCREEN UI CONTAINER (Hidden entirely during printing) */}
      {/* ========================================================================= */}
      <div id="summit-screen-ui" className="no-print flex-1 flex flex-col w-full relative">
        {/* Subtle Ambient Background Gradient Spotlights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Apple-Grade Navigation Bar */}
        <nav className="sticky top-0 z-40 bg-[#070b13]/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Link
                href="/"
                className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] active:scale-95 transition-all"
                title="Return to Main Exhibition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
                    DELHI PUBLIC SCHOOL INDIRAPURAM
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2.5 mt-0.5">
                  <span>Tech &amp; Innovation Summit 2026</span>
                  <span className="hidden sm:inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                    CR-100 Credential Suite
                  </span>
                </h1>
              </div>
            </div>

            {isCodeUnlocked && (
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-semibold border ${roleConfig.pillClass}`}>
                  <span className="hidden sm:inline">{roleConfig.label}</span>
                  <span className="sm:hidden">{currentRole}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLockSession}
                  className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 text-xs font-mono font-medium flex items-center gap-1.5 active:scale-95 transition-all"
                  title="Lock session and switch access key"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 relative z-10">
          {/* ========================================================================= */}
          {/* A. GATEKEEPER LOCK SCREEN (Shown when not authenticated)                 */}
          {/* ========================================================================= */}
          {!isCodeUnlocked ? (
            <div className="max-w-xl mx-auto my-12 sm:my-20 flex flex-col items-center text-center space-y-8">
              {/* Apple Security Enclave Monogram */}
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.12] flex items-center justify-center text-emerald-400 shadow-2xl backdrop-blur-xl">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#070b13] border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Summit Credential Gateway
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                  Enter your 6-digit summit pass code or authorized role key to open the official operations portal.
                </p>
              </div>

              {/* Code Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyCode(accessCode);
                }}
                className="w-full max-w-md space-y-3.5"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ENTER 6-DIGIT CODE"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      setAuthError('');
                    }}
                    autoFocus
                    className="w-full bg-black/40 border-2 border-white/[0.12] focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-center text-lg sm:text-xl font-mono font-bold tracking-[0.25em] text-emerald-400 placeholder-slate-600 focus:outline-none transition-all uppercase shadow-inner"
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-medium flex items-center justify-center gap-2">
                    <X className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 active:scale-[0.98] transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Verify Pass Code &amp; Open Portal</span>
                </button>
              </form>

              {/* Authorized Roles Guide (Apple Settings Style) */}
              <div className="w-full pt-8 border-t border-white/[0.08] text-left space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Authorized Summit Access Profiles</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setAccessCode('987654');
                      handleVerifyCode('987654');
                    }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/40 hover:bg-white/[0.05] transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Student Innovators ({OFFICIAL_STUDENTS_ROSTER.length})
                      </span>
                      <span className="bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                        Tap to Open &rarr;
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      Search roster, view personalized Apple Card pass, download virtual PNG, or print solo badge.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setAccessCode('TEACHER2026');
                      handleVerifyCode('TEACHER2026');
                    }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/40 hover:bg-white/[0.05] transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-400">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Faculty Incharge Hub
                      </span>
                      <span className="bg-purple-500/10 px-2 py-0.5 rounded-full text-[10px] group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors">
                        Tap to Open &rarr;
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      Customize supervisor pass, manage Master Attendance, and trigger A4 Batch Printing.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setAccessCode('JUDGE2026');
                      handleVerifyCode('JUDGE2026');
                    }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/40 hover:bg-white/[0.05] transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-400">
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Grand Jury Evaluators
                      </span>
                      <span className="bg-blue-500/10 px-2 py-0.5 rounded-full text-[10px] group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
                        Tap to Open &rarr;
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      Official jury credential &amp; booth evaluation camera scanner.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setAccessCode('VIP2026');
                      handleVerifyCode('VIP2026');
                    }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/40 hover:bg-white/[0.05] transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Executive VIP Guests
                      </span>
                      <span className="bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px] group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        Tap to Open &rarr;
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      VIP protocol credential &amp; executive gallery clearance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* B. AUTHENTICATED PORTAL (Apple Fluid UI)                                 */
            /* ========================================================================= */
            <div className="space-y-6">
              {/* Apple Segmented Control Bar (Mobile-Optimized Horizontal Scroll) */}
              <div className="w-full overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
                <div className="inline-flex min-w-full sm:min-w-0 items-center gap-1 p-1 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-inner whitespace-nowrap">
                  {/* Tab 1: Card View */}
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setActiveTab('pass');
                    }}
                    className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors z-10 ${
                      activeTab === 'pass' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {activeTab === 'pass' && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-white/[0.1] rounded-xl shadow-sm border border-white/[0.12]"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <Layers className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">
                      {currentRole === 'EXHIBITOR'
                        ? 'Innovator Pass'
                        : currentRole === 'INCHARGE'
                        ? 'Supervisor Pass'
                        : 'Official Credential'}
                    </span>
                  </button>

                  {/* Tab 2: Attendance (Incharge only) */}
                  {currentRole === 'INCHARGE' && (
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setActiveTab('attendance');
                      }}
                      className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors z-10 ${
                        activeTab === 'attendance' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {activeTab === 'attendance' && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 bg-white/[0.1] rounded-xl shadow-sm border border-white/[0.12]"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <FileSpreadsheet className="w-4 h-4 relative z-10 text-purple-400" />
                      <span className="relative z-10">Attendance</span>
                      <span className="relative z-10 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                        {totalPresentAll}/{totalAttendeesAll}
                      </span>
                    </button>
                  )}

                  {/* Tab 3: A4 Batch Print (Incharge only) */}
                  {currentRole === 'INCHARGE' && (
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setActiveTab('batch_print');
                      }}
                      className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors z-10 ${
                        activeTab === 'batch_print' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {activeTab === 'batch_print' && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 bg-white/[0.1] rounded-xl shadow-sm border border-white/[0.12]"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <Printer className="w-4 h-4 relative z-10 text-cyan-400" />
                      <span className="relative z-10">Batch Print</span>
                    </button>
                  )}

                  {/* Tab 4: Optical Scanner (Restricted Exclusively to Teachers / Incharges) */}
                  {currentRole === 'INCHARGE' && (
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setActiveTab('scanner');
                      }}
                      className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors z-10 ${
                        activeTab === 'scanner' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {activeTab === 'scanner' && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 bg-white/[0.1] rounded-xl shadow-sm border border-white/[0.12]"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <Camera className="w-4 h-4 relative z-10 text-emerald-400" />
                      <span className="relative z-10">Live Scanner</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* TAB 1: PASS PREVIEW & INTERACTIVE 3D CARD STAGE                           */}
              {/* ========================================================================= */}
              {activeTab === 'pass' && (
                <div className="space-y-6">
                  {/* Student Innovator Roster Selector (Exhibitors) */}
                  {currentRole === 'EXHIBITOR' && (
                    <div className="bg-white/[0.03] p-4 sm:p-5 rounded-3xl border border-white/[0.08] space-y-3.5 backdrop-blur-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                          <GraduationCap className="w-4 h-4" />
                          <span>Student Innovator Directory ({OFFICIAL_STUDENTS_ROSTER.length} Registered Exhibitors)</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Active: {selectedStudent.student_name} ({selectedStudent.class_section}) • {selectedStudent.venue_location || getStudentBoothInfo(selectedStudent).venue_location}
                        </span>
                      </div>

                      {/* Search & Filter Bar */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search student by name, class, project title, or booth..."
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      {/* Selection Chips */}
                      <div className="max-h-44 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/30 p-1.5 space-y-1">
                        {filteredStudents.map((st) => {
                          const isChosen =
                            selectedStudent.student_name === st.student_name &&
                            selectedStudent.project_number === st.project_number;
                          return (
                            <button
                              key={`${st.student_name}__${st.project_number}`}
                              type="button"
                              onClick={() => setSelectedStudent(st)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between gap-2 ${
                                isChosen
                                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                                  : 'hover:bg-white/[0.05] text-slate-300'
                              }`}
                            >
                              <span className="truncate">
                                {st.student_name}{' '}
                                <span className={isChosen ? 'text-slate-900 font-semibold' : 'text-slate-500'}>
                                  ({st.class_section})
                                </span>
                              </span>
                              <span className="text-[10px] shrink-0 font-mono opacity-80">
                                {getStudentCredentialId(st)} • {st.booth_codes ? `Booths ${st.booth_codes}` : `Booth ${getStudentBoothInfo(st).booth_code}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Faculty Incharge Hub Pass Explorer (Teachers, VIPs, and Grand Jury) */}
                  {currentRole === 'INCHARGE' && (
                    <div className="bg-white/[0.03] p-4 sm:p-5 rounded-3xl border border-white/[0.08] space-y-4 backdrop-blur-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 p-1 bg-black/40 border border-white/[0.08] rounded-2xl">
                          <button
                            type="button"
                            onClick={() => setInchargePassRoster('INCHARGES')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                              inchargePassRoster === 'INCHARGES'
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>1. Incharges ({OFFICIAL_TEACHERS_AND_INCHARGES.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setInchargePassRoster('VIP_GUESTS')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                              inchargePassRoster === 'VIP_GUESTS'
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>2. VIP Guests ({OFFICIAL_VIP_GUESTS.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setInchargePassRoster('GRAND_JURY')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                              inchargePassRoster === 'GRAND_JURY'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>3. Grand Jury ({OFFICIAL_GRAND_JURY.length})</span>
                          </button>
                        </div>

                        <span className="text-[11px] font-mono text-slate-300">
                          Active Pass:{' '}
                          <span className="font-bold text-white">
                            {inchargePassRoster === 'VIP_GUESTS'
                              ? `${selectedVip.name} • ${selectedVip.credential_id}`
                              : inchargePassRoster === 'GRAND_JURY'
                              ? `${selectedJudge.name} • ${selectedJudge.credential_id}`
                              : `${selectedTeacher.name} • ${selectedTeacher.credential_id}`}
                          </span>
                        </span>
                      </div>

                      {/* Incharge Roster Grid */}
                      {inchargePassRoster === 'INCHARGES' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {OFFICIAL_TEACHERS_AND_INCHARGES.map((teacher) => {
                            const isSelected = selectedTeacher.name === teacher.name;
                            return (
                              <button
                                key={teacher.credential_id}
                                type="button"
                                onClick={() => {
                                  setSelectedTeacher(teacher);
                                  setFacultyCustomName(teacher.name);
                                  setFacultyCustomId(teacher.credential_id);
                                }}
                                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-400'
                                    : 'bg-black/30 border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.15]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    isSelected ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400'
                                  }`}>
                                    {teacher.credential_id}
                                  </span>
                                  {isSelected && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-sans font-bold leading-tight">
                                    {teacher.name}
                                  </p>
                                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                    Faculty Incharge
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* VIP Guests Roster Grid */}
                      {inchargePassRoster === 'VIP_GUESTS' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {OFFICIAL_VIP_GUESTS.map((vip) => {
                            const isSelected = selectedVip.credential_id === vip.credential_id;
                            return (
                              <button
                                key={vip.credential_id}
                                type="button"
                                onClick={() => {
                                  setSelectedVip(vip);
                                  setOtherCustomName(vip.name);
                                  setOtherCustomId(vip.credential_id);
                                  setOtherCustomOrg(vip.designation);
                                  setOtherCustomVenue(vip.organization);
                                }}
                                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-amber-600/20 border-amber-500/50 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                                    : 'bg-black/30 border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.15]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    isSelected ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-400'
                                  }`}>
                                    {vip.credential_id}
                                  </span>
                                  {isSelected && (
                                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#FBBF24]" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-sans font-bold leading-tight">
                                    {vip.name}
                                  </p>
                                  <p className="text-[11px] font-sans text-amber-300 font-medium mt-0.5 line-clamp-1">
                                    {vip.designation}
                                  </p>
                                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 line-clamp-1">
                                    {vip.organization}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Grand Jury Roster Grid */}
                      {inchargePassRoster === 'GRAND_JURY' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {OFFICIAL_GRAND_JURY.map((judge) => {
                            const isSelected = selectedJudge.credential_id === judge.credential_id;
                            return (
                              <button
                                key={judge.credential_id}
                                type="button"
                                onClick={() => {
                                  setSelectedJudge(judge);
                                  setOtherCustomName(judge.name);
                                  setOtherCustomId(judge.credential_id);
                                  setOtherCustomOrg(judge.specialization);
                                  setOtherCustomVenue(judge.institution);
                                }}
                                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-400'
                                    : 'bg-black/30 border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.15]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400'
                                  }`}>
                                    {judge.credential_id}
                                  </span>
                                  {isSelected && (
                                    <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-sans font-bold leading-tight">
                                    {judge.name}
                                  </p>
                                  <p className="text-[11px] font-sans text-blue-300 font-medium mt-0.5 line-clamp-1">
                                    {judge.specialization}
                                  </p>
                                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 line-clamp-1">
                                    {judge.institution}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Grand Jury Authenticated Evaluator Directory */}
                  {currentRole === 'JUDGE' && (
                    <div className="bg-white/[0.03] p-4 sm:p-5 rounded-3xl border border-white/[0.08] space-y-4 backdrop-blur-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase">
                          <Award className="w-4 h-4" />
                          <span>Grand Jury Directory ({OFFICIAL_GRAND_JURY.length} Official Evaluators)</span>
                        </div>
                        <span className="text-[11px] font-mono text-blue-300">
                          Active Pass: {selectedJudge.name} • {selectedJudge.credential_id}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {OFFICIAL_GRAND_JURY.map((judge) => {
                          const isSelected = selectedJudge.credential_id === judge.credential_id;
                          return (
                            <button
                              key={judge.credential_id}
                              type="button"
                              onClick={() => {
                                setSelectedJudge(judge);
                                setOtherCustomName(judge.name);
                                setOtherCustomId(judge.credential_id);
                                setOtherCustomOrg(judge.specialization);
                                setOtherCustomVenue(judge.institution);
                              }}
                              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                                isSelected
                                  ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-400'
                                  : 'bg-black/30 border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.15]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400'
                                }`}>
                                  {judge.credential_id}
                                </span>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-sans font-bold leading-tight">
                                  {judge.name}
                                </p>
                                <p className="text-[11px] font-sans text-blue-300 font-medium mt-0.5 line-clamp-1">
                                  {judge.specialization}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400 mt-0.5 line-clamp-1">
                                  {judge.institution}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* VIP Guests Authenticated Dignitary Directory */}
                  {currentRole === 'VIP' && (
                    <div className="bg-white/[0.03] p-4 sm:p-5 rounded-3xl border border-white/[0.08] space-y-4 backdrop-blur-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
                          <Sparkles className="w-4 h-4" />
                          <span>VIP Dignitaries &amp; Patrons Directory ({OFFICIAL_VIP_GUESTS.length} Official VIPs)</span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-300">
                          Active Pass: {selectedVip.name} • {selectedVip.credential_id}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {OFFICIAL_VIP_GUESTS.map((vip) => {
                          const isSelected = selectedVip.credential_id === vip.credential_id;
                          return (
                            <button
                              key={vip.credential_id}
                              type="button"
                              onClick={() => {
                                setSelectedVip(vip);
                                setOtherCustomName(vip.name);
                                setOtherCustomId(vip.credential_id);
                                setOtherCustomOrg(vip.designation);
                                setOtherCustomVenue(vip.organization);
                              }}
                              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                                isSelected
                                  ? 'bg-amber-600/20 border-amber-500/50 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                                  : 'bg-black/30 border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.15]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-400'
                                }`}>
                                  {vip.credential_id}
                                </span>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#FBBF24]" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-sans font-bold leading-tight">
                                  {vip.name}
                                </p>
                                <p className="text-[11px] font-sans text-amber-300 font-medium mt-0.5 line-clamp-1">
                                  {vip.designation}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400 mt-0.5 line-clamp-1">
                                  {vip.organization}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Generic Role Customizer for Staff */}
                  {currentRole === 'STAFF' && (
                    <div className="bg-white/[0.03] p-4 sm:p-5 rounded-3xl border border-white/[0.08] space-y-4 backdrop-blur-xl">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase">
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
                            className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">TITLE / DESIGNATION</label>
                          <input
                            type="text"
                            value={otherCustomRole}
                            onChange={(e) => setOtherCustomRole(e.target.value)}
                            placeholder={roleConfig.badgeTitle}
                            className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">ORGANIZATION / DIVISION</label>
                          <input
                            type="text"
                            value={otherCustomOrg}
                            onChange={(e) => setOtherCustomOrg(e.target.value)}
                            placeholder={roleConfig.domainDefault}
                            className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">VENUE ALLOCATION</label>
                          <input
                            type="text"
                            value={otherCustomVenue}
                            onChange={(e) => setOtherCustomVenue(e.target.value)}
                            placeholder={roleConfig.venueDefault}
                            className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1 font-semibold">CREDENTIAL ID</label>
                          <input
                            type="text"
                            value={otherCustomId}
                            onChange={(e) => setOtherCustomId(e.target.value)}
                            placeholder={`${roleConfig.codePrefix}-0001`}
                            className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs font-mono text-rose-300 placeholder-slate-500 focus:outline-none focus:border-rose-500 uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                        CR-100 Apple Card Specification • Gyroscopic 3D Tilt Enabled
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Standard CR-100: 98.5 × 67.0 mm • Dynamic TopoTag &amp; Micro-QR Matrix
                    </div>
                  </div>

                  {/* INTERACTIVE 3D APPLE CARD STAGE */}
                  <div id="printable-card" className="w-full">
                    {activeBadgeSvg ? (
                      <InteractiveAppleCard
                        svgContent={activeBadgeSvg}
                        roleAccent={
                          currentRole === 'INCHARGE'
                            ? inchargePassRoster === 'VIP_GUESTS'
                              ? ROLE_CONFIG.VIP.accentColor
                              : inchargePassRoster === 'GRAND_JURY'
                              ? ROLE_CONFIG.JUDGE.accentColor
                              : ROLE_CONFIG.INCHARGE.accentColor
                            : roleConfig.accentColor
                        }
                      />
                    ) : (
                      <div className="w-full aspect-[985/670] max-w-4xl mx-auto rounded-3xl bg-white/[0.03] border border-white/[0.08] flex flex-col items-center justify-center text-slate-400 font-mono text-sm gap-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                        <span>Rendering Apple Card Vector Engine...</span>
                      </div>
                    )}
                  </div>

                  {/* Tactile Action Toolbar (Clean Grid for Mobile & Desktop) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full max-w-4xl mx-auto pt-2">
                    <button
                      type="button"
                      onClick={handlePrintSinglePass}
                      className="w-full px-3 py-3 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 active:scale-95 transition-all text-center"
                    >
                      <Printer className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span className="truncate">
                        {currentRole === 'INCHARGE'
                          ? inchargePassRoster === 'VIP_GUESTS'
                            ? 'Print VIP Pass'
                            : inchargePassRoster === 'GRAND_JURY'
                            ? 'Print Jury Pass'
                            : 'Print Supervisor'
                          : currentRole === 'EXHIBITOR'
                          ? 'Print Pass'
                          : currentRole === 'JUDGE'
                          ? 'Print Jury'
                          : currentRole === 'VIP'
                          ? 'Print VIP'
                          : 'Print Credential'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPhoneScanModalOpen(true)}
                      className="w-full px-3 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 border border-amber-400/40 active:scale-95 transition-all text-center"
                    >
                      <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Big QR Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPng}
                      disabled={isExporting}
                      className="w-full px-3 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs sm:text-sm font-mono font-semibold flex items-center justify-center gap-2 border border-white/[0.1] active:scale-95 transition-all disabled:opacity-50 text-center"
                    >
                      {isExporting ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" /> : <Download className="w-4 h-4 text-emerald-400 shrink-0" />}
                      <span className="truncate">Save .PNG</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className="w-full px-3 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs sm:text-sm font-mono font-semibold flex items-center justify-center gap-2 border border-white/[0.1] active:scale-95 transition-all text-center"
                    >
                      <Download className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">Vector .SVG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="w-full col-span-2 sm:col-span-1 px-3 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 text-xs sm:text-sm font-mono font-medium flex items-center justify-center gap-2 border border-white/[0.08] active:scale-95 transition-all text-center"
                    >
                      <Share2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{copiedLink ? 'Copied!' : 'Share Pass'}</span>
                    </button>
                  </div>

                  {/* Full-Screen High-Contrast Phone Check-In Modal (Enlarged Micro-QR + TopoTag for instant webcam lock) */}
                  {isPhoneScanModalOpen && (
                    <div
                      onClick={() => setIsPhoneScanModalOpen(false)}
                      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white text-slate-950 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-emerald-500 flex flex-col items-center text-center space-y-4"
                      >
                        <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="text-left">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 block">
                              PHONE SCREEN CHECK-IN MODE
                            </span>
                            <span className="text-sm font-bold text-slate-900 block truncate max-w-[220px]">
                              {activeHolderName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsPhoneScanModalOpen(false)}
                            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Giant High-Contrast 21x21 Micro-QR for instant Phone-to-Webcam detection */}
                        <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-inner flex flex-col items-center">
                          <svg viewBox="-8 -8 100 100" className="w-56 h-56 block">
                            <rect x="-8" y="-8" width="100" height="100" fill="#FFFFFF" />
                            <g dangerouslySetInnerHTML={{ __html: generateMicroQrModules(activeCredentialId) }} />
                          </svg>
                          <span className="mt-2 text-base font-mono font-black tracking-widest text-slate-900">
                            {activeCredentialId}
                          </span>
                        </div>

                        {/* Enlarged Butterfly TopoTag Failsafe Matrix */}
                        <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200 flex flex-col items-center">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                            OPTICAL FAILSAFE TOPOTAG MATRIX
                          </span>
                          <svg viewBox="80 115 265 120" className="w-48 h-24 block bg-white rounded-lg border border-slate-200">
                            <rect x="80" y="115" width="265" height="120" fill="#FFFFFF" />
                            <g dangerouslySetInnerHTML={{ __html: generateTopotagCells(activeCredentialId) }} />
                          </svg>
                        </div>

                        <p className="text-[11px] font-mono text-slate-600 leading-relaxed">
                          Hold this screen toward the scanner webcam from 15–50 cm away for instant optical verification.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: MASTER ATTENDANCE REGISTRY (4 SECTIONS - TEACHERS ONLY)            */}
              {/* ========================================================================= */}
              {activeTab === 'attendance' && currentRole === 'INCHARGE' && (
                <div className="space-y-6">
                  {/* 4 Section Segmented Navigation Tabs */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 bg-black/40 rounded-2xl border border-white/[0.08]">
                    {/* Section 1: Students */}
                    <button
                      type="button"
                      onClick={() => {
                        setAttendanceActiveSection('STUDENTS');
                        setAttendanceSearchQuery('');
                      }}
                      className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between gap-2 transition-all ${
                        attendanceActiveSection === 'STUDENTS'
                          ? 'bg-emerald-600/30 border border-emerald-500/50 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400'
                          : 'bg-white/[0.02] border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                        <span>1. Students</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        {attendanceList.filter((a) => a.checkedIn).length}/{attendanceList.length}
                      </span>
                    </button>

                    {/* Section 2: Incharges */}
                    <button
                      type="button"
                      onClick={() => {
                        setAttendanceActiveSection('INCHARGES');
                        setAttendanceSearchQuery('');
                      }}
                      className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between gap-2 transition-all ${
                        attendanceActiveSection === 'INCHARGES'
                          ? 'bg-purple-600/30 border border-purple-500/50 text-white shadow-md shadow-purple-950/40 ring-1 ring-purple-400'
                          : 'bg-white/[0.02] border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>2. Incharges</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                        {inchargeAttendanceList.filter((a) => a.checkedIn).length}/{inchargeAttendanceList.length}
                      </span>
                    </button>

                    {/* Section 3: VIP Guests */}
                    <button
                      type="button"
                      onClick={() => {
                        setAttendanceActiveSection('VIP_GUESTS');
                        setAttendanceSearchQuery('');
                      }}
                      className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between gap-2 transition-all ${
                        attendanceActiveSection === 'VIP_GUESTS'
                          ? 'bg-amber-600/30 border border-amber-500/50 text-white shadow-md shadow-amber-950/40 ring-1 ring-amber-400'
                          : 'bg-white/[0.02] border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>3. VIP Guests</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        {vipAttendanceList.filter((a) => a.checkedIn).length}/{vipAttendanceList.length}
                      </span>
                    </button>

                    {/* Section 4: Grand Jury */}
                    <button
                      type="button"
                      onClick={() => {
                        setAttendanceActiveSection('GRAND_JURY');
                        setAttendanceSearchQuery('');
                      }}
                      className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between gap-2 transition-all ${
                        attendanceActiveSection === 'GRAND_JURY'
                          ? 'bg-blue-600/30 border border-blue-500/50 text-white shadow-md shadow-blue-950/40 ring-1 ring-blue-400'
                          : 'bg-white/[0.02] border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-400" />
                        <span>4. Grand Jury</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                        {juryAttendanceList.filter((a) => a.checkedIn).length}/{juryAttendanceList.length}
                      </span>
                    </button>
                  </div>

                  {/* Executive Metric KPI Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">{activeSectionStats.title}</div>
                      <div className="text-2xl font-mono font-bold text-white mt-1 tabular-nums">{activeSectionStats.total}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Total Registered</div>
                    </div>

                    <div className={`p-4 rounded-2xl border backdrop-blur-xl ${activeSectionStats.colorBadge}`}>
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Checked In</div>
                      <div className={`text-2xl font-mono font-bold mt-1 tabular-nums ${activeSectionStats.colorText}`}>
                        {activeSectionStats.present}
                      </div>
                      <div className="text-[11px] text-emerald-400/80 mt-0.5">Verified at Summit</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Awaiting Check-in</div>
                      <div className="text-2xl font-mono font-bold text-slate-300 mt-1 tabular-nums">
                        {activeSectionStats.absent}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Pending Arrival</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Check-in Rate</div>
                      <div className="text-2xl font-mono font-bold text-white mt-1 tabular-nums">
                        {activeSectionStats.rate}%
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Attendance Progress</div>
                    </div>
                  </div>

                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08] backdrop-blur-xl">
                    <div>
                      <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
                        {attendanceActiveSection === 'STUDENTS' && <GraduationCap className="w-5 h-5 text-emerald-400" />}
                        {attendanceActiveSection === 'INCHARGES' && <ShieldCheck className="w-5 h-5 text-purple-400" />}
                        {attendanceActiveSection === 'VIP_GUESTS' && <Sparkles className="w-5 h-5 text-amber-400" />}
                        {attendanceActiveSection === 'GRAND_JURY' && <Award className="w-5 h-5 text-blue-400" />}
                        <span>{activeSectionStats.title} Attendance Ledger</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Real-time check-in ledger with instant CSV export and optical badge synchronization.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportCsv('SECTION')}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-mono font-bold flex items-center gap-2 border border-white/[0.1] active:scale-95 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Export {activeSectionStats.singular} CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportCsv('ALL')}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-mono font-bold flex items-center gap-2 border border-purple-500/40 active:scale-95 transition-all"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-purple-300" />
                        <span>Export All 4 Sections</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06]">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="text"
                        placeholder={
                          attendanceActiveSection === 'STUDENTS'
                            ? 'Search student by name, pass code, or booth...'
                            : attendanceActiveSection === 'INCHARGES'
                            ? 'Search faculty incharge by name or ID...'
                            : attendanceActiveSection === 'VIP_GUESTS'
                            ? 'Search VIP guest by name or organization...'
                            : 'Search grand jury by name, specialization, or institution...'
                        }
                        value={attendanceSearchQuery}
                        onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Status Segmented Pill */}
                    <div className="inline-flex p-1 bg-black/40 rounded-xl border border-white/[0.08]">
                      {(['ALL', 'PRESENT', 'ABSENT'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setAttendanceStatusFilter(mode)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                            attendanceStatusFilter === mode
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>

                    {/* Class Section Selector (Students only) */}
                    {attendanceActiveSection === 'STUDENTS' && (
                      <select
                        value={attendanceClassFilter}
                        onChange={(e) => setAttendanceClassFilter(e.target.value)}
                        className="px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="ALL">All Sections ({OFFICIAL_STUDENTS_ROSTER.length})</option>
                        {classSectionsList.map((sec) => (
                          <option key={sec} value={sec}>
                            Section {sec}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Section 1 Table: STUDENTS */}
                  {attendanceActiveSection === 'STUDENTS' && (
                    <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20 backdrop-blur-xl">
                      <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="sticky top-0 bg-[#0d1424] border-b border-white/[0.08] text-slate-400 font-mono text-[11px] uppercase tracking-wider z-10">
                            <tr>
                              <th className="py-3 px-4">Student Name</th>
                              <th className="py-3 px-4">Section</th>
                              <th className="py-3 px-4">Booth</th>
                              <th className="py-3 px-4">Project Title</th>
                              <th className="py-3 px-4">Credential ID</th>
                              <th className="py-3 px-4">Check-In Time</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {filteredAttendance.map((rec) => (
                              <tr
                                key={`${rec.studentName}__${rec.projectNumber}`}
                                className="hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="py-3 px-4 font-bold text-white font-sans">{rec.studentName}</td>
                                <td className="py-3 px-4 text-slate-400 font-mono">{rec.classSection}</td>
                                <td className="py-3 px-4 text-emerald-400 font-mono font-bold">#{rec.projectNumber}</td>
                                <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">{rec.projectTitle}</td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px] tabular-nums">{rec.passCode}</td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{rec.checkInTime || '—'}</td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      rec.checkedIn
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${rec.checkedIn ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                    {rec.checkedIn ? 'PRESENT' : 'ABSENT'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAttendance(rec.studentName, rec.projectNumber)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all active:scale-95 ${
                                      rec.checkedIn
                                        ? 'bg-white/[0.05] hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/[0.08]'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
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
                  )}

                  {/* Section 2 Table: INCHARGES */}
                  {attendanceActiveSection === 'INCHARGES' && (
                    <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20 backdrop-blur-xl">
                      <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="sticky top-0 bg-[#0d1424] border-b border-white/[0.08] text-slate-400 font-mono text-[11px] uppercase tracking-wider z-10">
                            <tr>
                              <th className="py-3 px-4">Faculty Incharge</th>
                              <th className="py-3 px-4">Role Title</th>
                              <th className="py-3 px-4">Credential ID</th>
                              <th className="py-3 px-4">Access Code</th>
                              <th className="py-3 px-4">Check-In Time</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {filteredInchargeAttendance.map((rec) => (
                              <tr
                                key={rec.credentialId}
                                className="hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="py-3 px-4 font-bold text-white font-sans">{rec.name}</td>
                                <td className="py-3 px-4 text-purple-300 font-mono">{rec.role}</td>
                                <td className="py-3 px-4 text-amber-300 font-mono font-bold">{rec.credentialId}</td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px] tabular-nums">{rec.passCode}</td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{rec.checkInTime || '—'}</td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      rec.checkedIn
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                        : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${rec.checkedIn ? 'bg-purple-400' : 'bg-slate-500'}`} />
                                    {rec.checkedIn ? 'PRESENT' : 'ABSENT'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleInchargeAttendance(rec.credentialId)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all active:scale-95 ${
                                      rec.checkedIn
                                        ? 'bg-white/[0.05] hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/[0.08]'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/40'
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
                  )}

                  {/* Section 3 Table: VIP GUESTS */}
                  {attendanceActiveSection === 'VIP_GUESTS' && (
                    <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20 backdrop-blur-xl">
                      <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="sticky top-0 bg-[#0d1424] border-b border-white/[0.08] text-slate-400 font-mono text-[11px] uppercase tracking-wider z-10">
                            <tr>
                              <th className="py-3 px-4">VIP Delegate Name</th>
                              <th className="py-3 px-4">Designation / Honor</th>
                              <th className="py-3 px-4">Organization</th>
                              <th className="py-3 px-4">Credential ID</th>
                              <th className="py-3 px-4">Check-In Time</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {filteredVipAttendance.map((rec) => (
                              <tr
                                key={rec.credentialId}
                                className="hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="py-3 px-4 font-bold text-white font-sans">{rec.name}</td>
                                <td className="py-3 px-4 text-amber-300 font-mono">{rec.designation}</td>
                                <td className="py-3 px-4 text-slate-300 font-sans">{rec.organization}</td>
                                <td className="py-3 px-4 text-amber-400 font-mono font-bold">{rec.credentialId}</td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{rec.checkInTime || '—'}</td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      rec.checkedIn
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                        : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${rec.checkedIn ? 'bg-amber-400' : 'bg-slate-500'}`} />
                                    {rec.checkedIn ? 'PRESENT' : 'ABSENT'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleVipAttendance(rec.credentialId)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all active:scale-95 ${
                                      rec.checkedIn
                                        ? 'bg-white/[0.05] hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/[0.08]'
                                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/40'
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
                  )}

                  {/* Section 4 Table: GRAND JURY */}
                  {attendanceActiveSection === 'GRAND_JURY' && (
                    <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20 backdrop-blur-xl">
                      <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="sticky top-0 bg-[#0d1424] border-b border-white/[0.08] text-slate-400 font-mono text-[11px] uppercase tracking-wider z-10">
                            <tr>
                              <th className="py-3 px-4">Grand Jury Evaluator</th>
                              <th className="py-3 px-4">Domain Specialization</th>
                              <th className="py-3 px-4">Institution / Division</th>
                              <th className="py-3 px-4">Credential ID</th>
                              <th className="py-3 px-4">Check-In Time</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {filteredJuryAttendance.map((rec) => (
                              <tr
                                key={rec.credentialId}
                                className="hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="py-3 px-4 font-bold text-white font-sans">{rec.name}</td>
                                <td className="py-3 px-4 text-blue-300 font-mono">{rec.specialization}</td>
                                <td className="py-3 px-4 text-slate-300 font-sans">{rec.institution}</td>
                                <td className="py-3 px-4 text-blue-400 font-mono font-bold">{rec.credentialId}</td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{rec.checkInTime || '—'}</td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      rec.checkedIn
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                        : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${rec.checkedIn ? 'bg-blue-400' : 'bg-slate-500'}`} />
                                    {rec.checkedIn ? 'PRESENT' : 'ABSENT'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleJuryAttendance(rec.credentialId)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all active:scale-95 ${
                                      rec.checkedIn
                                        ? 'bg-white/[0.05] hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/[0.08]'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950/40'
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
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: A4 BATCH PRINT CONSOLE (Only for Incharge)                         */}
              {/* ========================================================================= */}
              {activeTab === 'batch_print' && currentRole === 'INCHARGE' && (
                <div className="space-y-6">
                  <div className="bg-white/[0.03] p-5 sm:p-6 rounded-3xl border border-white/[0.08] space-y-5 backdrop-blur-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
                          <Grid className="w-5 h-5 text-cyan-400" />
                          <span>A4 Precision Batch Print Configurator</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Format official CR-100 badges to fit standard A4 sheets with precision cut-lines and individual security tags.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handlePrintBatchSheets}
                        className="px-6 py-3 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white text-xs sm:text-sm font-mono font-bold flex items-center gap-2.5 shadow-xl shadow-emerald-950/60 active:scale-95 transition-all self-start sm:self-auto"
                      >
                        <Printer className="w-4 h-4 text-emerald-300" />
                        <span>Print {selectedCardsForPrintList.length} Cards ({a4Sheets.length} Sheet{a4Sheets.length !== 1 ? 's' : ''})</span>
                      </button>
                    </div>

                    {/* Layout Option Pills */}
                    <div className="pt-2 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => setA4Layout('8_PER_PAGE')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                          a4Layout === '8_PER_PAGE'
                            ? 'bg-emerald-950/30 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                            : 'bg-black/30 border-white/[0.06] text-slate-400 hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold text-emerald-300">
                          8 Cards per Sheet (Standard)
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          2 columns × 4 rows (98.5 × 67.0 mm CR-100 badge). Exact fit with 6.5mm margins.
                        </div>
                      </div>

                      <div
                        onClick={() => setA4Layout('4_PER_PAGE')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                          a4Layout === '4_PER_PAGE'
                            ? 'bg-emerald-950/30 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                            : 'bg-black/30 border-white/[0.06] text-slate-400 hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold text-emerald-300">
                          4 Cards per Sheet
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          2 columns × 2 rows. Large presentation format for lanyard inserts.
                        </div>
                      </div>

                      <div
                        onClick={() => setA4Layout('1_PER_PAGE')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                          a4Layout === '1_PER_PAGE'
                            ? 'bg-emerald-950/30 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                            : 'bg-black/30 border-white/[0.06] text-slate-400 hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold text-emerald-300">
                          1 Card per Sheet
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Single large credential sheet for desk display or certificate frames.
                        </div>
                      </div>
                    </div>

                    {/* Batch Print Roster Selector */}
                    <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold mr-1">Roster:</span>
                      <button
                        type="button"
                        onClick={() => setBatchPrintRoster('STUDENTS')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                          batchPrintRoster === 'STUDENTS'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                            : 'bg-black/30 text-slate-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Students ({selectedStudentIdsForPrint.size}/{OFFICIAL_STUDENTS_ROSTER.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchPrintRoster('INCHARGES')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                          batchPrintRoster === 'INCHARGES'
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                            : 'bg-black/30 text-slate-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Incharges ({selectedInchargeIdsForPrint.size}/8)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchPrintRoster('VIP_GUESTS')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                          batchPrintRoster === 'VIP_GUESTS'
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                            : 'bg-black/30 text-slate-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>VIP Guests ({selectedVipIdsForPrint.size}/6)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchPrintRoster('GRAND_JURY')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                          batchPrintRoster === 'GRAND_JURY'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                            : 'bg-black/30 text-slate-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Grand Jury ({selectedJuryIdsForPrint.size}/6)</span>
                      </button>
                    </div>

                    {/* Section 1: STUDENTS Print Selector */}
                    {batchPrintRoster === 'STUDENTS' && (
                      <div className="pt-2 space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                            <Filter className="w-4 h-4 text-emerald-400" />
                            <span>Select Student Cards ({selectedStudentIdsForPrint.size} of {OFFICIAL_STUDENTS_ROSTER.length} Selected)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentIdsForPrint(
                                  new Set(OFFICIAL_STUDENTS_ROSTER.map((s) => `${s.student_name}__${s.project_number}`))
                                );
                              }}
                              className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-emerald-300 border border-white/[0.08] transition-colors"
                            >
                              Select All {OFFICIAL_STUDENTS_ROSTER.length}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentIdsForPrint(new Set())}
                              className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-slate-400 border border-white/[0.08] transition-colors"
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
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors border ${
                                  isAllSelected
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                                    : 'bg-black/30 text-slate-400 border-white/[0.06] hover:border-white/[0.12]'
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
                            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Checkbox Grid */}
                        <div className="max-h-56 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/30 p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
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
                                className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors border ${
                                  isChecked
                                    ? 'bg-emerald-950/40 border-emerald-600/50 text-white'
                                    : 'bg-white/[0.02] border-white/[0.04] text-slate-400 hover:bg-white/[0.05]'
                                }`}
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600 shrink-0" />
                                )}
                                <div className="truncate flex-1">
                                  <span className="font-bold">{s.student_name}</span>{' '}
                                  <span className="text-[10px] text-slate-500">({s.class_section})</span>
                                </div>
                                <span className="text-[10px] text-emerald-400 shrink-0 font-mono">{getStudentCredentialId(s)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section 2: INCHARGES Print Selector */}
                    {batchPrintRoster === 'INCHARGES' && (
                      <div className="pt-2 space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span>Select Faculty Incharge Badges ({selectedInchargeIdsForPrint.size} of 8 Selected)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInchargeIdsForPrint(
                                  new Set(OFFICIAL_TEACHERS_AND_INCHARGES.map((t) => t.credential_id))
                                );
                              }}
                              className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-purple-300 border border-white/[0.08] transition-colors"
                            >
                              Select All 8
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedInchargeIdsForPrint(new Set())}
                              className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-slate-400 border border-white/[0.08] transition-colors"
                            >
                              Clear Selection
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {OFFICIAL_TEACHERS_AND_INCHARGES.map((t) => {
                            const isChecked = selectedInchargeIdsForPrint.has(t.credential_id);
                            return (
                              <div
                                key={t.credential_id}
                                onClick={() => {
                                  const next = new Set(selectedInchargeIdsForPrint);
                                  if (isChecked) next.delete(t.credential_id);
                                  else next.add(t.credential_id);
                                  setSelectedInchargeIdsForPrint(next);
                                }}
                                className={`p-3 rounded-2xl text-xs font-mono flex items-center justify-between gap-2 cursor-pointer transition-colors border ${
                                  isChecked
                                    ? 'bg-purple-950/40 border-purple-500/50 text-white'
                                    : 'bg-white/[0.02] border-white/[0.04] text-slate-400 hover:bg-white/[0.05]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-600 shrink-0" />
                                  )}
                                  <span className="font-bold">{t.name}</span>
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold font-mono">
                                  {t.credential_id}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section 3: VIP GUESTS Print Selector */}
                    {batchPrintRoster === 'VIP_GUESTS' && (
                      <div className="pt-2 space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Select VIP Guest Badges ({selectedVipIdsForPrint.size} of 6 Selected)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVipIdsForPrint(
                                  new Set(OFFICIAL_VIP_GUESTS.map((v) => v.credential_id))
                                );
                              }}
                              className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-amber-300 border border-white/[0.08] transition-colors"
                            >
                              Select All 6
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedVipIdsForPrint(new Set())}
                              className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-slate-400 border border-white/[0.08] transition-colors"
                            >
                              Clear Selection
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {OFFICIAL_VIP_GUESTS.map((v) => {
                            const isChecked = selectedVipIdsForPrint.has(v.credential_id);
                            return (
                              <div
                                key={v.credential_id}
                                onClick={() => {
                                  const next = new Set(selectedVipIdsForPrint);
                                  if (isChecked) next.delete(v.credential_id);
                                  else next.add(v.credential_id);
                                  setSelectedVipIdsForPrint(next);
                                }}
                                className={`p-3 rounded-2xl text-xs font-mono flex items-center justify-between gap-2 cursor-pointer transition-colors border ${
                                  isChecked
                                    ? 'bg-amber-950/40 border-amber-500/50 text-white'
                                    : 'bg-white/[0.02] border-white/[0.04] text-slate-400 hover:bg-white/[0.05]'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-600 shrink-0" />
                                  )}
                                  <div className="truncate">
                                    <div className="font-bold">{v.name}</div>
                                    <div className="text-[10px] text-amber-300/80 truncate">{v.designation}</div>
                                  </div>
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono shrink-0">
                                  {v.credential_id}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section 4: GRAND JURY Print Selector */}
                    {batchPrintRoster === 'GRAND_JURY' && (
                      <div className="pt-2 space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-blue-400" />
                            <span>Select Grand Jury Badges ({selectedJuryIdsForPrint.size} of 6 Selected)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJuryIdsForPrint(
                                  new Set(OFFICIAL_GRAND_JURY.map((j) => j.credential_id))
                                );
                              }}
                              className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-blue-300 border border-white/[0.08] transition-colors"
                            >
                              Select All 6
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedJuryIdsForPrint(new Set())}
                              className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-slate-400 border border-white/[0.08] transition-colors"
                            >
                              Clear Selection
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {OFFICIAL_GRAND_JURY.map((j) => {
                            const isChecked = selectedJuryIdsForPrint.has(j.credential_id);
                            return (
                              <div
                                key={j.credential_id}
                                onClick={() => {
                                  const next = new Set(selectedJuryIdsForPrint);
                                  if (isChecked) next.delete(j.credential_id);
                                  else next.add(j.credential_id);
                                  setSelectedJuryIdsForPrint(next);
                                }}
                                className={`p-3 rounded-2xl text-xs font-mono flex items-center justify-between gap-2 cursor-pointer transition-colors border ${
                                  isChecked
                                    ? 'bg-blue-950/40 border-blue-500/50 text-white'
                                    : 'bg-white/[0.02] border-white/[0.04] text-slate-400 hover:bg-white/[0.05]'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-600 shrink-0" />
                                  )}
                                  <div className="truncate">
                                    <div className="font-bold">{j.name}</div>
                                    <div className="text-[10px] text-blue-300/80 truncate">{j.specialization}</div>
                                  </div>
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold font-mono shrink-0">
                                  {j.credential_id}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Print Sheet Preview Info Banner */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <Grid className="w-4 h-4 text-emerald-400" />
                      <span>Ready to print: {selectedCardsForPrintList.length} badges arranged across {a4Sheets.length} pages.</span>
                    </div>
                    <span className="hidden sm:inline text-slate-500">Pure White Background • Zero Ink Bleed</span>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: OPTICAL CAMERA SCANNER & INSTANT VERIFICATION (TEACHERS ONLY)      */}
              {/* ========================================================================= */}
              {activeTab === 'scanner' && currentRole === 'INCHARGE' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-white/[0.03] p-5 sm:p-6 rounded-3xl border border-white/[0.08] space-y-5 backdrop-blur-xl">
                    <div className="text-center space-y-1">
                      <h2 className="text-base sm:text-lg font-mono font-bold text-white flex items-center justify-center gap-2">
                        <Camera className="w-5 h-5 text-emerald-400" />
                        <span>Live Credential Optical Scanner</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-mono">
                        Point camera at a physical pass Micro-QR / TopoTag or enter pass code.
                      </p>
                    </div>

                    {/* Camera Feed Container */}
                    {isCameraActive ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/[0.1] shadow-2xl">
                        <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
                        {/* Scanning Reticle */}
                        <div
                          className={`absolute inset-0 border-2 m-8 rounded-xl pointer-events-none flex flex-col items-center justify-center transition-colors duration-300 ${
                            scanActiveIndicator
                              ? 'border-emerald-400 bg-emerald-500/10'
                              : 'border-emerald-500/40'
                          }`}
                        >
                          {scanActiveIndicator ? (
                            <div className="px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/50 animate-pulse">
                              <Check className="w-4 h-4" />
                              <span>CREDENTIAL DECODED</span>
                            </div>
                          ) : (
                            <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,1)] animate-bounce" />
                          )}
                        </div>

                        {/* Top Live Status Indicator */}
                        <div
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border flex items-center gap-2 text-[10px] font-mono ${
                            scannerFocusStage === 'MICRO_QR_PRIMARY'
                              ? 'border-emerald-500/30 text-emerald-300'
                              : 'border-amber-500/40 text-amber-300'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full animate-ping ${
                              scannerFocusStage === 'MICRO_QR_PRIMARY' ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                          <span>
                            {scannerFocusStage === 'MICRO_QR_PRIMARY'
                              ? 'PRIMARY FOCUS: MICRO-QR OPTICAL ENGINE'
                              : 'MICRO-QR NOT VISIBLE • TOPOTAG FAILSAFE STANDBY'}
                          </span>
                        </div>

                        {/* Bottom Action Controls */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-mono border border-white/20 hover:bg-white/10 active:scale-95 flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>Upload Image</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-mono border border-white/20 hover:bg-white/10 active:scale-95"
                          >
                            Close Camera
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl bg-black/30 border border-white/[0.06] text-center space-y-3.5">
                        <Camera className="w-10 h-10 text-emerald-400 mx-auto" />
                        <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto">
                          Scan physical badge Mini-QR / TopoTag with high-speed camera or upload a pass image.
                        </p>
                        {cameraError && (
                          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
                            {cameraError}. Try using &quot;Upload Pass Image&quot; or check camera permissions.
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => mobileCameraInputRef.current?.click()}
                            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-emerald-950/50 active:scale-95 flex items-center gap-2 ring-1 ring-emerald-400"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Take Photo with Phone Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={startCamera}
                            className="px-4 py-2.5 rounded-2xl bg-[#065f46]/80 hover:bg-[#065f46] text-white text-xs font-mono font-semibold transition-all border border-emerald-500/30 active:scale-95 flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Start Continuous Webcam</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-mono font-medium border border-white/[0.1] transition-all active:scale-95 flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4 text-amber-400" />
                            <span>Upload Pass File (.SVG / .PNG)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Hidden File Input for Image / SVG Upload Scanning */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    {/* Dedicated Native Phone Camera Snap Input (Opens Phone Camera Directly) */}
                    <input
                      type="file"
                      ref={mobileCameraInputRef}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    {/* Manual Code Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleScanCode(scannerInputCode);
                      }}
                      className="flex gap-2.5"
                    >
                      <input
                        type="text"
                        placeholder="OR TYPE PASS CODE e.g. EXH-0036-01 or student name..."
                        value={scannerInputCode}
                        onChange={(e) => setScannerInputCode(e.target.value)}
                        className="flex-1 px-4 py-3 bg-black/40 border border-white/[0.1] rounded-2xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-mono font-bold transition-colors active:scale-95"
                      >
                        Verify
                      </button>
                    </form>

                    {/* Scanned Result Card */}
                    {scannedResult && (
                      <div
                        className={`p-5 rounded-2xl border ${
                          scannedResult.found
                            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                            : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-mono font-bold text-sm">
                          {scannedResult.found ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-rose-400" />}
                          <span>{scannedResult.found ? 'AUTHENTICATED CREDENTIAL' : 'VERIFICATION FAILED'}</span>
                        </div>
                        {scannedResult.scanMethod === 'TOPOTAG_FAILSAFE' && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-semibold">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            OPTICAL FAILSAFE: VERIFIED VIA TOPOTAG INVARIANT MATRIX {scannedResult.hammingDistance !== undefined && scannedResult.hammingDistance > 0 ? `(${scannedResult.hammingDistance}-BIT CORRECTION)` : '(EXACT MATCH)'}
                          </div>
                        )}
                        <p className="text-xs mt-1 text-slate-300 font-mono">{scannedResult.message}</p>

                        {scannedResult.found && scannedResult.specialRole && (
                          <div className="mt-3.5 pt-3.5 border-t border-emerald-500/30 grid grid-cols-2 gap-2.5 text-xs font-mono text-slate-200">
                            <div>
                              <span className="text-slate-400 block text-[10px]">AUTHORIZED HOLDER</span>
                              <span className="font-bold text-white text-sm">{scannedResult.specialRole.name}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">ORGANIZATION / ROLE</span>
                              <span className="font-bold text-amber-300">{scannedResult.specialRole.role}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">ASSIGNED VENUE</span>
                              <span className="font-bold text-emerald-300">{scannedResult.specialRole.venueLocation}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">CREDENTIAL ID</span>
                              <span className="text-amber-400 font-bold">{scannedResult.specialRole.credentialId}</span>
                            </div>
                            <div className="col-span-2 mt-1 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 block">SECURITY CLEARANCE</span>
                                <span className="text-xs text-emerald-300 font-semibold">{scannedResult.specialRole.title}</span>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                ALL-ARENA ACCESS
                              </span>
                            </div>
                          </div>
                        )}

                        {scannedResult.found && (scannedResult.student || scannedResult.record) && (
                          <div className="mt-3.5 pt-3.5 border-t border-emerald-500/30 grid grid-cols-2 gap-2.5 text-xs font-mono text-slate-200">
                            <div>
                              <span className="text-slate-400 block text-[10px]">CREDENTIAL HOLDER</span>
                              <span className="font-bold text-white text-sm">{scannedResult.student?.student_name || scannedResult.record?.studentName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">CLASS &amp; SECTION</span>
                              <span className="font-bold">{scannedResult.student?.class_section || scannedResult.record?.classSection}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">PHYSICAL BOOTH</span>
                              <span className="font-bold text-emerald-300">
                                {scannedResult.student?.venue_location || getStudentBoothInfo(scannedResult.student || scannedResult.record?.projectNumber || 1).venue_location}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">CREDENTIAL ID</span>
                              <span className="text-amber-400 font-bold">
                                {scannedResult.student
                                  ? getStudentCredentialId(scannedResult.student)
                                  : scannedResult.record?.passCode || 'N/A'}
                              </span>
                            </div>
                            <div className="col-span-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                              <span className="text-xs font-mono text-emerald-300 font-bold flex items-center gap-1.5">
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>STATUS: PRESENT (Recorded at {scannedResult.record?.timestamp || 'Just now'})</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                CHECKED IN
                              </span>
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
            a4Sheets.map((sheetCards, sheetIdx) => (
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
                {sheetCards.map((card) => {
                  const tmpl = badgeTemplates[card.templateKey] || badgeTemplates['exhibitor'];
                  const cardSvg = tmpl
                    ? generateAppleCardSvg(tmpl, {
                        name: card.name,
                        classSection: card.classSection,
                        credentialId: card.credentialId,
                        projectDomain: card.projectDomain,
                        venueLocation: card.venueLocation,
                      })
                    : '';
                  return (
                    <div
                      key={card.key}
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
            /* B. Single Card Print: Only the card and its perimeter cut outline on pure white paper */
            <div className="single-a4-sheet">
              <div className="single-badge-cut-frame">
                <div
                  className="single-badge-svg-container"
                  dangerouslySetInnerHTML={{ __html: activeBadgeSvg }}
                />
              </div>
              <div className="single-cut-text-line">
                ✂ Cut along the line
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
            margin: 10mm;
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
            min-height: 0 !important;
            height: auto !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide on-screen UI */
          #summit-screen-ui,
          .no-print,
          canvas,
          [aria-hidden="true"],
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

          .a4-sheet:last-of-type,
          .a4-sheet:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
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

          /* Single Card A4 Sheet: Exact 1-Page Layout with Zero Trailing Page */
          .single-a4-sheet {
            width: 100% !important;
            max-width: 190mm !important;
            box-sizing: border-box !important;
            margin: 35mm auto 0 auto !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: 250mm !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .single-badge-cut-frame {
            width: 150mm !important;
            height: 102mm !important;
            border: none !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            margin: 0 auto !important;
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

          /* Cutting line along the edge of the card */
          .print-cut-line {
            display: block !important;
            stroke: #475569 !important;
            stroke-width: 1.5 !important;
            stroke-dasharray: 6 4 !important;
          }

          .single-cut-text-line {
            margin-top: 6mm !important;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", monospace, sans-serif !important;
            font-size: 8.5pt !important;
            font-weight: 600 !important;
            color: #64748b !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
            text-align: center !important;
          }

          .apple-card-base,
          #dpsi-shield,
          [filter*="shield-shadow"],
          [filter*="plateShadow"],
          .single-badge-svg-container [filter],
          .a4-badge-cell [filter] {
            filter: none !important;
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
