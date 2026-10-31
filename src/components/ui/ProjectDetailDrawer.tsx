'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getDeviceFingerprint } from '@/lib/fingerprint';
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
  const isMobile = useExhibitionStore((state) => state.isMobile);

  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccessMessage, setVoteSuccessMessage] = useState<string | null>(null);

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

      const voteApiUrl = process.env.NEXT_PUBLIC_VOTE_API_URL || '/api/vote';
      const res = await fetch(voteApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          fingerprint,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409 || data.alreadyVoted) {
        markProjectVoted(selectedProject.id);
        setVoteError(
          data.message ||
            'Anti-Cheat Alert: A vote has already been recorded for this project from this device or account.'
        );
        return;
      }

      if (res.status === 429) {
        setVoteError(
          data.message || 'Rate limit reached: Too many requests. Please wait a moment before trying again.'
        );
        return;
      }

      if (!res.ok || !data.success) {
        setVoteError(data.message || 'Vote verification failed. Please try again.');
        return;
      }

      markProjectVoted(selectedProject.id);
      incrementProjectVote(selectedProject.id);
      setVoteSuccessMessage(data.message || 'Vote successfully verified and recorded!');

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
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden sm:overflow-y-auto">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => selectProject(null)}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md transition-all"
          />

          {/* Centered Modal Card / Mobile Bottom Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={isMobile ? { y: '100%', opacity: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: '100%', opacity: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 290 }}
            className="relative z-10 w-full max-w-2xl max-h-[88vh] rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-300/80 dark:border-slate-800 bg-[#f8fafc]/98 dark:bg-[#0c1220]/95 backdrop-blur-2xl shadow-2xl flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden sm:my-auto"
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center w-full">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            <div
              className={`p-4 sm:p-5 border-b border-slate-200/90 dark:border-slate-800/80 bg-gradient-to-r ${theme.glow} flex items-center justify-between`}
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

              {/* High-Resolution Project Photo */}
              <div className="relative w-full h-44 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProject.image_url}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-200 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-700/80 backdrop-blur-md">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Floor Coordinates: [{selectedProject.position_x}, {selectedProject.position_z}]
                    </span>
                  </div>
                </div>

                <Link
                  href="/expo"
                  onClick={() => selectProject(null)}
                  className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-mono font-bold text-white bg-blue-600/90 hover:bg-blue-600 px-3 py-1 rounded-md shadow-md backdrop-blur-md transition-all hover:scale-105"
                >
                  <Maximize2 className="w-3 h-3" />
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

              {/* Anti-Cheat Voting Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Verified Anti-Cheat Voting:</strong> Ballots are cryptographically bound to hardware canvas fingerprints and Google OAuth signatures to prevent duplicate submissions.
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
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-[#090d16] flex items-center justify-between gap-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
                  Co-Engineered by Ojas Singh dpsi&apos;&apos;30
                </span>
              </div>

              {hasVoted ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  <span>Voted ✓</span>
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
  );
}
