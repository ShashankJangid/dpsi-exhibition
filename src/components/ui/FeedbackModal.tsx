'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquarePlus, ArrowUpRight, Clock } from 'lucide-react';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { FEEDBACK_FORM_URL } from '@/lib/utils';
import { playClick } from '@/lib/sound';

const SESSION_SEEN_KEY = 'dpsi_feedback_popup_seen_v1';
const LOCAL_SUBMITTED_KEY = 'dpsi_feedback_submitted_v1';

export default function FeedbackModal() {
  const isDrawerOpen = useExhibitionStore((state) => state.isDrawerOpen);
  const isAuthModalOpen = useExhibitionStore((state) => state.isAuthModalOpen);
  const isSearchModalOpen = useExhibitionStore((state) => state.isSearchModalOpen);
  const isLeaderboardOpen = useExhibitionStore((state) => state.isLeaderboardOpen);
  const isDelegatePassOpen = useExhibitionStore((state) => state.isDelegatePassOpen);

  const [isOpen, setIsOpen] = useState(false);

  const dismissPopup = useCallback((markSubmitted = false) => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(SESSION_SEEN_KEY, '1');
      if (markSubmitted) {
        localStorage.setItem(LOCAL_SUBMITTED_KEY, '1');
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  useEffect(() => {
    try {
      if (
        localStorage.getItem(LOCAL_SUBMITTED_KEY) === '1' ||
        sessionStorage.getItem(SESSION_SEEN_KEY) === '1'
      ) {
        return;
      }
    } catch {
      // Proceed if storage access fails
    }

    const timer = setTimeout(() => {
      const state = useExhibitionStore.getState();
      const anyModalOpen =
        state.isDrawerOpen ||
        state.isAuthModalOpen ||
        state.isSearchModalOpen ||
        state.isLeaderboardOpen ||
        state.isDelegatePassOpen;

      if (!anyModalOpen) {
        setIsOpen(true);
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  // Auto-close if user opens another priority modal
  useEffect(() => {
    if (
      isOpen &&
      (isDrawerOpen || isAuthModalOpen || isSearchModalOpen || isLeaderboardOpen || isDelegatePassOpen)
    ) {
      queueMicrotask(() => dismissPopup(false));
    }
  }, [
    isOpen,
    isDrawerOpen,
    isAuthModalOpen,
    isSearchModalOpen,
    isLeaderboardOpen,
    isDelegatePassOpen,
    dismissPopup,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissPopup(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dismissPopup]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={() => dismissPopup(false)}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-4 bg-slate-900/45 dark:bg-black/80 backdrop-blur-md cursor-pointer"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-md rounded-3xl bg-[#f8fafc]/98 dark:bg-[#0c1220]/95 border border-slate-300/80 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-slate-800 dark:text-slate-100 overflow-hidden cursor-default"
          >
            {/* Subtle Ambient Radial Highlight */}
            <div className="pointer-events-none absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                playClick();
                dismissPopup(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-800 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-all"
              aria-label="Close feedback popup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* School Brand & Header */}
            <div className="flex items-center gap-3.5 mb-5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-slate-200">
                <Image
                  src="/dps_shield.png"
                  alt="DPS Indirapuram Emblem"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                    DPS Indirapuram
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Visitor Feedback
                  </span>
                </div>
                <h2
                  id="feedback-modal-title"
                  className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5"
                >
                  Share Your Feedback
                </h2>
              </div>
            </div>

            {/* Info Ribbon */}
            <div className="mb-4 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] font-sans">
                  Innovation Exhibition 2026 • Official Google Form
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                <Clock className="w-3 h-3" />
                <span>~60s</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-6">
              Visiting our 44 student innovation booths or exploring the 3D Virtual Hall? Let us know what stood out and help our young visionaries grow!
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-col gap-2.5">
              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  playClick();
                  dismissPopup(true);
                }}
                className="w-full min-h-[48px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-[#238636] hover:bg-[#2ea043] text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                <MessageSquarePlus className="w-4 h-4 shrink-0" />
                <span>Give Feedback Now</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </a>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  dismissPopup(false);
                }}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-300/80 dark:border-slate-700/80 bg-white/80 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-semibold text-xs transition-all active:scale-[0.98]"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
