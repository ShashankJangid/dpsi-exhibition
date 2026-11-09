'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { playClick, triggerHaptic } from '@/lib/sound';
import { PROPRIETARY_ACCESS_CODES } from '@/data/exhibitionRegistry';
import {
  X,
  Award,
  KeyRound,
  Lock,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function DelegatePassModal() {
  const isDelegatePassOpen = useExhibitionStore((state) => state.isDelegatePassOpen);
  const setDelegatePassOpen = useExhibitionStore((state) => state.setDelegatePassOpen);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';
  const router = useRouter();

  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDelegatePassOpen(false);
      }
    };
    if (isDelegatePassOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDelegatePassOpen, setDelegatePassOpen]);

  if (!isDelegatePassOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) {
      setErrorMsg('Please enter your summit access code.');
      return;
    }

    const validCodes = Object.values(PROPRIETARY_ACCESS_CODES) as string[];
    if (validCodes.includes(trimmed)) {
      triggerHaptic();
      setDelegatePassOpen(false);
      router.push(`/pass?code=${trimmed}`);
    } else {
      setErrorMsg('Invalid authorization code. Check your credentials.');
    }
  };

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) setDelegatePassOpen(false);
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 pointer-events-auto overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Official Summit Credential Gateway"
        className={`relative w-full max-w-lg my-auto rounded-3xl border shadow-2xl overflow-hidden transition-all ${
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
                <span>Official Summit Credential Gateway</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Authentication Required for CR-100 Badges
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed font-sans">
              Summit credentials and CR-100 security badges are cryptographically signed with unique TopoTags and Micro-QR codes. Personalized passes can only be generated with a verified access code.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              Enter 6-Digit Summit Access Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. 987654 (Students) or TEACHER2026"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors uppercase"
                autoFocus
              />
            </div>
            {errorMsg && (
              <div className="text-xs font-mono text-rose-400 flex items-center gap-1.5">
                <span>✕</span> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all"
            >
              <span>Authenticate & Open Credential</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Access Guide */}
          <div className="pt-4 border-t border-slate-800 space-y-2 text-[11px] font-mono text-slate-400">
            <div className="text-slate-300 font-bold uppercase text-[10px] tracking-wider">
              Authorized Summit Roles:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Student Innovators: <strong className="text-cyan-300">987654</strong></span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Faculty / Incharge: <strong className="text-purple-300">TEACHER2026</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/pass"
              onClick={() => setDelegatePassOpen(false)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
            >
              Go to Full Summit Pass & Attendance Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
