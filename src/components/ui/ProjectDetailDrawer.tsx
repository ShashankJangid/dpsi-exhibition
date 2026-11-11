'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getDeviceFingerprint } from '@/lib/fingerprint';
import { castVoteInFirebase } from '@/lib/firebase';
import { playChime, triggerHaptic, playClick } from '@/lib/sound';
import confetti from 'canvas-confetti';
import {
  X,
  ThumbsUp,
  ShieldCheck,
  AlertTriangle,
  Users,
  Code2,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Award,
  Share2,
  Check,
} from 'lucide-react';
import { CategoryType } from '@/types';

const CATEGORY_THEMES: Record<
  CategoryType,
  { badgeBg: string; border: string; glow: string }
> = {
  Physical: {
    badgeBg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/40',
    border: 'border-amber-500/40',
    glow: 'from-amber-100/70 dark:from-amber-950/60 via-transparent to-transparent',
  },
  Digital: {
    badgeBg: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30 dark:border-sky-500/40',
    border: 'border-sky-500/40',
    glow: 'from-sky-100/70 dark:from-sky-950/60 via-transparent to-transparent',
  },
  Business: {
    badgeBg: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40',
    border: 'border-emerald-500/40',
    glow: 'from-emerald-100/70 dark:from-emerald-950/60 via-transparent to-transparent',
  },
  'Show & Tell': {
    badgeBg: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30 dark:border-purple-500/40',
    border: 'border-purple-500/40',
    glow: 'from-purple-100/70 dark:from-purple-950/60 via-transparent to-transparent',
  },
  'Robo Race': {
    badgeBg: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30 dark:border-rose-500/40',
    border: 'border-rose-500/40',
    glow: 'from-rose-100/70 dark:from-rose-950/60 via-transparent to-transparent',
  },
  'Robo Soccer': {
    badgeBg: 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30 dark:border-teal-500/40',
    border: 'border-teal-500/40',
    glow: 'from-teal-100/70 dark:from-teal-950/60 via-transparent to-transparent',
  },
};

export default function ProjectDetailDrawer() {
  const selectedProject = useExhibitionStore((state) => state.selectedProject);
  const isDrawerOpen = useExhibitionStore((state) => state.isDrawerOpen);
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const selectNextProject = useExhibitionStore((state) => state.selectNextProject);
  const selectPrevProject = useExhibitionStore((state) => state.selectPrevProject);
  const votedProjectIds = useExhibitionStore((state) => state.votedProjectIds);
  const markProjectVoted = useExhibitionStore((state) => state.markProjectVoted);
  const incrementProjectVote = useExhibitionStore((state) => state.incrementProjectVote);
  const user = useExhibitionStore((state) => state.user);
  const setAuthModalOpen = useExhibitionStore((state) => state.setAuthModalOpen);
  const setDelegatePassOpen = useExhibitionStore((state) => state.setDelegatePassOpen);
  const isMobile = useExhibitionStore((state) => state.isMobile);

  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccessMessage, setVoteSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const isLightboxActive = isDrawerOpen && isLightboxOpen;

  // Keyboard navigation: Left/Right arrow keys to switch booths, Escape to close
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        selectPrevProject();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        selectNextProject();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isLightboxActive) {
          setIsLightboxOpen(false);
        } else {
          selectProject(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, isLightboxActive, selectPrevProject, selectNextProject, selectProject]);

  const handleShareBooth = async () => {
    playClick();
    if (!selectedProject) return;
    const shareUrl = `${window.location.origin}/?booth=${encodeURIComponent(selectedProject.booth_code)}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  if (!selectedProject) return null;

  const hasVoted = votedProjectIds.includes(selectedProject.id);
  const theme = CATEGORY_THEMES[selectedProject.category] || CATEGORY_THEMES['Digital'];

  const handleCastVote = async () => {
    setVoteError(null);
    setVoteSuccessMessage(null);

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (hasVoted) return;

    setIsVoting(true);
    try {
      const fingerprint = await getDeviceFingerprint();

      const res = await castVoteInFirebase({
        projectId: selectedProject.id,
        fingerprint,
        userId: user.id,
        userEmail: user.email,
      });

      if (res.alreadyVoted) {
        markProjectVoted(selectedProject.id);
        setVoteError(
          res.message ||
            'A vote has already been recorded for this project from this device or account.'
        );
        return;
      }

      if (!res.success) {
        setVoteError(res.message || 'Vote verification failed. Please try again.');
        return;
      }

      markProjectVoted(selectedProject.id);
      try {
        const existing = JSON.parse(localStorage.getItem('dpsi_voted_project_ids') || '[]');
        if (!existing.includes(selectedProject.id)) {
          localStorage.setItem('dpsi_voted_project_ids', JSON.stringify([...existing, selectedProject.id]));
        }
      } catch {
        // localStorage fallback
      }
      incrementProjectVote(selectedProject.id);
      setVoteSuccessMessage(res.message || 'Vote successfully verified and recorded!');

      playChime();
      triggerHaptic(30);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: isMobile ? 0.9 : 0.8, x: 0.5 },
        colors: ['#f59e0b', '#fbbf24', '#0284c7', '#10b981', '#f43f5e'],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during vote submission.';
      setVoteError(msg);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isDrawerOpen && (
          <div
            key="project-drawer-overlay"
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden sm:overflow-y-auto"
          >
            {/* Backdrop with Blur */}
            <motion.div
              key="project-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => selectProject(null)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md transition-all"
            />

            {/* Centered Modal Card / Mobile Bottom Sheet */}
            <motion.div
              key="project-drawer-card"
              role="dialog"
              aria-modal="true"
              initial={isMobile ? { y: '100%', opacity: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={isMobile ? { y: '100%', opacity: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 290 }}
              className="relative z-10 w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-300/80 dark:border-slate-800 bg-[#f8fafc]/98 dark:bg-[#0c1220]/95 backdrop-blur-2xl shadow-2xl flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden sm:my-auto"
            >
            {/* Mobile Drag Indicator Handle */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center w-full">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            <div
              className={`p-3.5 sm:p-5 border-b border-slate-200/90 dark:border-slate-800/80 bg-gradient-to-r ${theme.glow} flex items-center justify-between gap-1.5`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 text-amber-700 dark:text-amber-300 shadow-xs">
                  Booth {selectedProject.booth_code}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md border ${theme.badgeBg}`}
                >
                  {selectedProject.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={selectPrevProject}
                    title="Previous Booth"
                    aria-label="Previous Booth"
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700/60 transition-colors flex items-center gap-0.5 active:scale-95"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                  <button
                    onClick={selectNextProject}
                    title="Next Booth"
                    aria-label="Next Booth"
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700/60 transition-colors flex items-center gap-0.5 active:scale-95"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleShareBooth}
                  title="Copy share link for this booth"
                  aria-label="Copy share link for this booth"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-700/60 transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden sm:inline">Share</span>
                    </>
                  )}
                </button>

                <Link
                  href="/expo"
                  onClick={() => selectProject(null)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-700/60 transition-colors"
                >
                  <span>3D Arena</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => selectProject(null)}
                  aria-label="Close project modal"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors border border-slate-300/80 dark:border-slate-700/60 active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Project Title & Tagline */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {selectedProject.title}
                </h2>
                {selectedProject.tagline && (
                  <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-semibold mt-1">
                    {selectedProject.tagline}
                  </p>
                )}
              </div>

              {/* High-Resolution Project Photo with Lightbox trigger */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative w-full h-44 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group shadow-md cursor-zoom-in"
              >
                <Image
                  src={selectedProject.image_url}
                  alt={selectedProject.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 672px"
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

                {/* Fullscreen Expand Action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  title="Expand Fullscreen Image (Lightbox)"
                  aria-label="Expand Fullscreen Image (Lightbox)"
                  className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-mono font-bold text-white bg-black/70 hover:bg-black/90 px-2.5 py-1 rounded-lg border border-white/20 shadow-md backdrop-blur-md transition-all active:scale-95"
                >
                  <Maximize2 className="w-3 h-3 text-amber-400" />
                  <span>Fullscreen</span>
                </button>

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-200 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-700/80 backdrop-blur-md">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Booth {selectedProject.booth_code} • {selectedProject.zone === 'zone-1' ? 'Zone 1 (Show & Tell)' : selectedProject.zone === 'zone-3' ? 'Zone 3 (Robotics)' : 'Zone 2 (Innovation Hub)'}
                    </span>
                  </div>
                </div>

                <Link
                  href="/expo"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectProject(null);
                  }}
                  className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-mono font-bold text-white bg-blue-600/90 hover:bg-blue-600 px-3 py-1 rounded-md shadow-md backdrop-blur-md transition-all hover:scale-105"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Locate in 3D</span>
                </Link>
              </div>

              {/* Full Expanded Description */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  Project Overview &amp; Abstract
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 font-sans shadow-xs">
                  {selectedProject.description}
                </p>
              </div>

              {/* Tech Stack Chips */}
              {selectedProject.tech_stack && selectedProject.tech_stack.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Code2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Tech Architecture &amp; Schematics</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tech_stack.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-mono font-medium shadow-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Team Members */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Users className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Student Exhibitors &amp; Innovators</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProject.members.map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center font-black text-xs text-slate-950 shadow-sm shrink-0">
                        {member.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {member}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Ballot Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Verified Ballot:</strong> Ballots are authenticated via Google OAuth and single-device verification to prevent duplicate submissions.
                </p>
              </div>

              {/* Error Alert */}
              {voteError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Voting Blocked</p>
                    <p className="text-[11px] mt-0.5 text-rose-600/90 dark:text-rose-400/90">{voteError}</p>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {voteSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Vote Confirmed!</p>
                    <p className="text-[11px] mt-0.5 text-emerald-700/90 dark:text-emerald-400/90">{voteSuccessMessage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-[#090d16] flex items-center justify-between gap-3 sm:gap-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Total Verified Votes
                </span>
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                    {selectedProject.vote_count}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 hidden xs:inline">
                  Co-Engineered by Devansh Grover (Class 7-H, dpsi&apos;31) &amp; Ojas Singh (dpsi&apos;30)
                </span>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">←</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">→</kbd>
                  <span>navigate</span>
                  <kbd className="ml-1 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">esc</kbd>
                </div>
              </div>

              {hasVoted ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    <span>Voted ✓</span>
                  </div>
                  <button
                    onClick={() => {
                      playClick();
                      setDelegatePassOpen(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    title="View & Download Innovation Delegate Pass"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Delegate Pass</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCastVote}
                  disabled={isVoting}
                  className="flex-1 max-w-xs min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all font-mono"
                >
                  {isVoting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Hardware...</span>
                    </>
                  ) : !user ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In to Vote</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Cast Verified Vote</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Full-Screen Image Lightbox */}
    <AnimatePresence>
      {isLightboxActive && selectedProject && (
        <motion.div
          key="project-lightbox-modal"
          role="dialog"
          aria-modal="true"
          aria-label="High-Resolution Project Preview Lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-8 select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
            {/* Lightbox Top Bar */}
            <div className="w-full max-w-5xl flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-amber-500 text-slate-950">
                  Booth {selectedProject.booth_code}
                </span>
                <span className="text-sm sm:text-base font-semibold truncate max-w-md">
                  {selectedProject.title.replace(/^.+•\s*/, '')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  ← / → to switch booths • ESC to close
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(false);
                  }}
                  aria-label="Close Lightbox"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Center Image with Nav Buttons */}
            <div
              className="relative max-w-5xl max-h-[75vh] w-full flex items-center justify-center my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedProject.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                src={selectedProject.image_url}
                alt={selectedProject.title}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/15"
              />

              {/* Prev / Next buttons inside lightbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectPrevProject();
                }}
                aria-label="Previous Booth"
                className="absolute left-2 sm:-left-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectNextProject();
                }}
                aria-label="Next Booth"
                className="absolute right-2 sm:-right-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Bottom Metadata Bar */}
            <div className="w-full max-w-5xl text-center text-xs font-mono text-slate-400 z-10 flex items-center justify-center gap-4">
              <span className="text-amber-400 font-bold">{selectedProject.category}</span>
              <span>•</span>
              <span className="truncate max-w-md">{selectedProject.members.join(', ')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
