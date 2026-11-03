'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { playClick, playChime, triggerHaptic } from '@/lib/sound';
import { X, Download, Share2, Award, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function DelegatePassModal() {
  const isDelegatePassOpen = useExhibitionStore((state) => state.isDelegatePassOpen);
  const setDelegatePassOpen = useExhibitionStore((state) => state.setDelegatePassOpen);
  const user = useExhibitionStore((state) => state.user);
  const votedProjectIds = useExhibitionStore((state) => state.votedProjectIds);
  const projects = useExhibitionStore((state) => state.projects);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const delegateName = user?.name || 'Innovation Delegate';
  const delegateId = user?.id ? `DPSI-2026-${user.id.slice(0, 6).toUpperCase()}` : 'DPSI-2026-VTR71';
  const votedCount = votedProjectIds.length;

  useEffect(() => {
    if (isDelegatePassOpen) {
      playChime();
      triggerHaptic(25);
    }
  }, [isDelegatePassOpen]);

  // Generate high-resolution 2D Canvas Pass
  useEffect(() => {
    if (!isDelegatePassOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI 1200x700
    const w = 1200;
    const h = 700;
    canvas.width = w;
    canvas.height = h;

    // 1. Deep Midnight Blue / Charcoal Carbon background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#070b14');
    bgGrad.addColorStop(0.5, '#0d1527');
    bgGrad.addColorStop(1, '#05070d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Holographic Geometric Circuit Mesh Pattern
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
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

    // 3. Luxurious Outer Beveled Gold & Cyan Border
    const borderGrad = ctx.createLinearGradient(0, 0, w, h);
    borderGrad.addColorStop(0, '#f59e0b');
    borderGrad.addColorStop(0.5, '#38bdf8');
    borderGrad.addColorStop(1, '#d97706');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Inner subtle gold wireframe
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(42, 42, w - 84, h - 84);

    // 4. Header Section: DPS Indirapuram
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px monospace';
    ctx.letterSpacing = '4px';
    ctx.fillText('DELHI PUBLIC SCHOOL INDIRAPURAM', 70, 95);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px sans-serif';
    ctx.fillText('TECH & INNOVATION SUMMIT 2026', 70, 150);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('OFFICIAL DIGITAL DELEGATE CREDENTIAL', 70, 185);

    // Divider Line
    const divGrad = ctx.createLinearGradient(70, 215, w - 70, 215);
    divGrad.addColorStop(0, '#f59e0b');
    divGrad.addColorStop(0.5, '#38bdf8');
    divGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = divGrad;
    ctx.fillRect(70, 215, w - 140, 3);

    // 5. Delegate Info
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('ATTENDEE NAME', 70, 270);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(delegateName.toUpperCase(), 70, 320);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('DELEGATE ID', 70, 385);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(delegateId, 70, 425);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('VOTING PARTICIPATION', 70, 490);

    ctx.fillStyle = votedCount > 0 ? '#34d399' : '#e2e8f0';
    ctx.font = 'bold 26px sans-serif';
    const voteStatusText = votedCount > 0 ? `VERIFIED VOTER • ${votedCount} BOOTHS ENDORSED` : 'REGISTERED SUMMIT GUEST';
    ctx.fillText(voteStatusText, 70, 528);

    // 6. Right Side: Gold Wax / Hologram Seal Stamp
    ctx.save();
    ctx.translate(960, 370);

    // Outer Glowing Ring
    const sealGrad = ctx.createRadialGradient(0, 0, 40, 0, 0, 140);
    sealGrad.addColorStop(0, '#f59e0b');
    sealGrad.addColorStop(0.7, '#b45309');
    sealGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 140, 0, Math.PI * 2);
    ctx.fill();

    // Solid Gold Medal
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL STAMP', 0, -45);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('★ DPSI ★', 0, -10);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(votedCount > 0 ? 'CERTIFIED' : 'SUMMIT PASS', 0, 25);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('EXHIBITION 2026', 0, 55);

    ctx.restore();

    // 7. Footer: Verification Hash & Barcode
    ctx.fillStyle = '#64748b';
    ctx.font = '14px monospace';
    ctx.fillText('VERIFIED VIA DPS INDIRAPURAM DIGITAL CREDENTIAL REGISTRY • NOVEMBER 2026', 70, 645);

    // Generate downloadable data url
    try {
      const data = canvas.toDataURL('image/png');
      setDownloadUrl(data);
    } catch {}
  }, [isDelegatePassOpen, delegateName, delegateId, votedCount]);

  if (!isDelegatePassOpen) return null;

  const handleDownload = () => {
    playClick();
    triggerHaptic(20);
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `DPSI_Tech_Summit_Delegate_Pass_${delegateId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    playClick();
    triggerHaptic(15);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'DPS Indirapuram Tech Expo 2026 - Delegate Pass',
          text: `I'm attending the DPS Indirapuram Annual Tech & Innovation Summit 2026! Check out 35 student inventions:`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 pointer-events-auto">
      <div
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-slate-900 border-amber-500/50 text-white'
            : 'bg-[#060a14] border-amber-500/50 text-white'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Innovation Delegate Pass</h3>
              <p className="text-[11px] text-slate-400 font-mono">Official Summit Credential & Voter Certificate</p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              setDelegatePassOpen(false);
            }}
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pass Preview Canvas Container */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-amber-500/40 ring-4 ring-amber-500/10">
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cryptographically formatted attendee credential</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Pass (.PNG)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
