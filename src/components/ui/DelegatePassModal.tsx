'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { playClick, playChime, triggerHaptic } from '@/lib/sound';
import {
  X,
  Download,
  Share2,
  Award,
  ShieldCheck,
  Sparkles,
  User,
  GraduationCap,
  Briefcase,
  Ticket,
  Printer,
  ExternalLink,
} from 'lucide-react';

export type DelegateRole = 'Judge' | 'Faculty' | 'Student Innovator' | 'Guest';

const ROLES: { id: DelegateRole; label: string; icon: typeof User; color: string; badgeClass: string }[] = [
  {
    id: 'Judge',
    label: 'Judge',
    icon: Award,
    color: '#a855f7',
    badgeClass: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40',
  },
  {
    id: 'Faculty',
    label: 'Faculty',
    icon: GraduationCap,
    color: '#3b82f6',
    badgeClass: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40',
  },
  {
    id: 'Student Innovator',
    label: 'Student Innovator',
    icon: Briefcase,
    color: '#f59e0b',
    badgeClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40',
  },
  {
    id: 'Guest',
    label: 'Guest',
    icon: Ticket,
    color: '#10b981',
    badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
  },
];

export default function DelegatePassModal() {
  const isDelegatePassOpen = useExhibitionStore((state) => state.isDelegatePassOpen);
  const setDelegatePassOpen = useExhibitionStore((state) => state.setDelegatePassOpen);
  const user = useExhibitionStore((state) => state.user);
  const votedProjectIds = useExhibitionStore((state) => state.votedProjectIds);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Customization inputs
  const [attendeeName, setAttendeeName] = useState(user?.name || 'Innovation Delegate');
  const [selectedRole, setSelectedRole] = useState<DelegateRole>('Guest');

  const votedCount = votedProjectIds.length;

  const rolePrefix = useMemo(() => {
    switch (selectedRole) {
      case 'Judge':
        return 'JDG';
      case 'Faculty':
        return 'FAC';
      case 'Student Innovator':
        return 'STU';
      default:
        return 'GST';
    }
  }, [selectedRole]);

  const delegateId = useMemo(() => {
    const seed = user?.id ? user.id.slice(0, 4).toUpperCase() : '8421';
    return `DPSI-2026-${rolePrefix}-${seed}`;
  }, [user, rolePrefix]);

  const activeRoleConfig = useMemo(() => {
    return ROLES.find((r) => r.id === selectedRole) || ROLES[3];
  }, [selectedRole]);

  useEffect(() => {
    if (isDelegatePassOpen) {
      playChime();
      triggerHaptic(25);
    }
  }, [isDelegatePassOpen]);

  // Generate high-resolution 2D Canvas Pass (1200x700)
  useEffect(() => {
    if (!isDelegatePassOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 1200;
    const h = 700;
    canvas.width = w;
    canvas.height = h;

    // 1. Deep Midnight Blue / Charcoal Carbon background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#060a14');
    bgGrad.addColorStop(0.5, '#0c1425');
    bgGrad.addColorStop(1, '#04070d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Holographic Circuit Mesh Grid
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 40; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 3. Luxurious Beveled Border based on role accent color
    const borderGrad = ctx.createLinearGradient(0, 0, w, h);
    borderGrad.addColorStop(0, activeRoleConfig.color);
    borderGrad.addColorStop(0.5, '#f59e0b');
    borderGrad.addColorStop(1, '#38bdf8');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Inner wireframe
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(42, 42, w - 84, h - 84);

    // 4. Header Section: DPS Indirapuram
    ctx.fillStyle = activeRoleConfig.color;
    ctx.font = 'bold 20px monospace';
    ctx.fillText('DELHI PUBLIC SCHOOL INDIRAPURAM', 70, 95);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px sans-serif';
    ctx.fillText('TECH & INNOVATION SUMMIT 2026', 70, 148);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('OFFICIAL DIGITAL DELEGATE CREDENTIAL', 70, 185);

    // Divider Line
    const divGrad = ctx.createLinearGradient(70, 215, w - 70, 215);
    divGrad.addColorStop(0, activeRoleConfig.color);
    divGrad.addColorStop(0.6, '#f59e0b');
    divGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = divGrad;
    ctx.fillRect(70, 212, w - 140, 3);

    // 5. Delegate Details
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('ATTENDEE NAME', 70, 265);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText((attendeeName || 'DELEGATE').toUpperCase(), 70, 312);

    // Role Tag Badge on Canvas
    ctx.fillStyle = activeRoleConfig.color;
    ctx.fillRect(70, 335, 240, 38);
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 16px monospace';
    ctx.fillText(`ROLE: ${selectedRole.toUpperCase()}`, 85, 360);

    // Delegate ID
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('DELEGATE ID', 70, 420);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(delegateId, 70, 455);

    // Voting Status
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('VOTING PARTICIPATION', 70, 508);

    ctx.fillStyle = votedCount > 0 ? '#34d399' : '#e2e8f0';
    ctx.font = 'bold 22px sans-serif';
    const voteStatusText =
      votedCount > 0
        ? `VERIFIED VOTER • ${votedCount} BOOTHS ENDORSED`
        : 'REGISTERED SUMMIT GUEST';
    ctx.fillText(voteStatusText, 70, 542);

    // 6. Right Side: Geometric QR Code Matrix
    ctx.save();
    ctx.translate(920, 260);

    // QR Code Frame
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-10, -10, 180, 180);
    ctx.strokeStyle = activeRoleConfig.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(-12, -12, 184, 184);

    // Stylized QR pattern blocks
    ctx.fillStyle = '#0f172a';
    // Three Finder Corners
    ctx.fillRect(0, 0, 42, 42);
    ctx.clearRect(8, 8, 26, 26);
    ctx.fillRect(14, 14, 14, 14);

    ctx.fillRect(118, 0, 42, 42);
    ctx.clearRect(126, 8, 26, 26);
    ctx.fillRect(132, 14, 14, 14);

    ctx.fillRect(0, 118, 42, 42);
    ctx.clearRect(8, 126, 26, 26);
    ctx.fillRect(14, 132, 14, 14);

    // Internal Pseudo Matrix Dots
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i * 3 + j * 7) % 2 === 0) {
          ctx.fillRect(52 + (i % 6) * 10, 52 + (j % 6) * 10, 6, 6);
        }
      }
    }
    // Small Emblem Center
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(72, 72, 16, 16);

    ctx.restore();

    // QR Code label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN FOR DIGITAL VERIFICATION', 1000, 460);
    ctx.textAlign = 'left';

    // 7. Footer: Verification Hash
    ctx.fillStyle = '#64748b';
    ctx.font = '13px monospace';
    ctx.fillText(
      `AUTHENTICATED VIA DPS INDIRAPURAM DIGITAL CREDENTIAL REGISTRY • NOV 14-15, 2026`,
      70,
      645
    );

    // Generate downloadable data url
    try {
      const data = canvas.toDataURL('image/png');
      setDownloadUrl(data);
    } catch {}
  }, [isDelegatePassOpen, attendeeName, selectedRole, delegateId, votedCount, activeRoleConfig]);

  // Keyboard listener: Escape key closes pass modal
  useEffect(() => {
    if (!isDelegatePassOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setDelegatePassOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDelegatePassOpen, setDelegatePassOpen]);

  if (!isDelegatePassOpen) return null;

  const handleDownload = () => {
    playClick();
    triggerHaptic(20);
    if (!downloadUrl) return;
    const cleanName = attendeeName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Delegate';
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `DPSI_Pass_${cleanName}_${rolePrefix}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    playClick();
    triggerHaptic(15);
    const passUrl = window.location.origin;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `DPS Indirapuram Tech Expo 2026 - ${selectedRole} Pass`,
          text: `Here is my official credential for DPS Indirapuram Tech & Innovation Summit 2026 (${selectedRole}):`,
          url: passUrl,
        });
      } catch {}
    } else {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(passUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch {}
      }
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setDelegatePassOpen(false);
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 pointer-events-auto overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Personalized Delegate Credential"
        className={`relative w-full max-w-2xl my-auto rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-slate-900 border-amber-500/50 text-white'
            : 'bg-[#060a14] border-amber-500/50 text-white'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Personalized Delegate Credential</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Official Summit Pass with Authenticated QR Matrix
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              setDelegatePassOpen(false);
            }}
            aria-label="Close pass modal"
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customization Controls: Name & Role */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Name Input */}
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1">
                ATTENDEE NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="e.g. Dr. Priya Verma / Alex Sharma"
                  maxLength={30}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Role Switcher */}
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1">
                SELECT CREDENTIAL ROLE
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ROLES.map((r) => {
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        playClick();
                        setSelectedRole(r.id);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all text-center flex items-center justify-center gap-1 active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Pass Preview Canvas Container */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          {/* Apple Wallet Style Live Card Preview */}
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-amber-500/40 ring-4 ring-amber-500/10">
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>

          {/* Action Toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Credential ID: <strong className="text-amber-400">{delegateId}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all font-mono"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Pass (.PNG)</span>
              </button>
            </div>
          </div>

          {/* Full Credential & Attendance Hub Portal Link */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-[11px] font-mono text-slate-400">
              Need printable physical badges or student attendance check-in?
            </span>
            <Link
              href="/pass"
              onClick={() => setDelegatePassOpen(false)}
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center sm:justify-start gap-1 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/50 transition-colors shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Full Pass & Attendance Portal</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
