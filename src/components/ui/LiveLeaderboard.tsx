'use client';

import { useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { CategoryType, Project } from '@/types';
import {
  X,
  Medal,
  ThumbsUp,
  ArrowRight,
  Flame,
  Trophy,
  Sparkles,
} from 'lucide-react';

const FILTER_TABS: { label: string; value: CategoryType | 'All' }[] = [
  { label: 'All Projects', value: 'All' },
  { label: 'Physical (P01-P12)', value: 'Physical' },
  { label: 'Digital (D01-D12)', value: 'Digital' },
  { label: 'Business (B01-B07)', value: 'Business' },
  { label: 'Show & Tell', value: 'Show & Tell' },
  { label: 'Robo Race', value: 'Robo Race' },
  { label: 'Robo Soccer', value: 'Robo Soccer' },
];

export default function LiveLeaderboard() {
  const isLeaderboardOpen = useExhibitionStore((state) => state.isLeaderboardOpen);
  const setLeaderboardOpen = useExhibitionStore((state) => state.setLeaderboardOpen);
  const projects = useExhibitionStore((state) => state.projects);
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const activeTab = useExhibitionStore((state) => state.activeLeaderboardTab);
  const setActiveTab = useExhibitionStore((state) => state.setActiveLeaderboardTab);

  const sortedProjects = useMemo(() => {
    const list =
      activeTab === 'All'
        ? [...projects]
        : projects.filter((p) => p.category === activeTab);

    return list.sort((a, b) => b.vote_count - a.vote_count);
  }, [projects, activeTab]);

  const maxVotes = useMemo(() => {
    return Math.max(...sortedProjects.map((p) => p.vote_count), 1);
  }, [sortedProjects]);

  const top1 = sortedProjects[0] as Project | undefined;
  const top2 = sortedProjects[1] as Project | undefined;
  const top3 = sortedProjects[2] as Project | undefined;

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    if (!isLeaderboardOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setLeaderboardOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLeaderboardOpen, setLeaderboardOpen]);

  return (
    <AnimatePresence>
      {isLeaderboardOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setLeaderboardOpen(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/60 dark:bg-black/85 backdrop-blur-md"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Live Standings and Rankings Leaderboard"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#f8fafc]/98 dark:bg-[#090d16] border border-slate-300/80 dark:border-slate-800 shadow-2xl flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden"
          >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-amber-100/70 dark:from-amber-500/15 via-white/50 dark:via-[#0b101c] to-amber-100/50 dark:to-amber-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 px-2 sm:px-2.5 py-1 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0 border border-slate-200">
                <Image
                  src="/dps_shield.png"
                  alt="DPS Indirapuram Emblem"
                  width={28}
                  height={28}
                  className="h-full w-auto object-contain block sm:hidden"
                />
                <Image
                  src="/dps_indirapuram_logo.png"
                  alt="DPS Indirapuram Logo"
                  width={150}
                  height={28}
                  className="h-full w-auto max-w-[140px] sm:max-w-[170px] object-contain hidden sm:block"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span>Live Standings &amp; Podium</span>
                  </h2>
                  <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
                    REALTIME
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                  DPS Indirapuram • Real-time verified community &amp; jury ballot tally
                </p>
              </div>
            </div>

            <button
              onClick={() => setLeaderboardOpen(false)}
              aria-label="Close leaderboard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-slate-600 hover:text-slate-950 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="p-2 sm:p-3 bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200/90 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5">
            {FILTER_TABS.map((tab) => {
              const isSelected = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable Container with Podium + Rankings List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-6">
            {/* ─── TOP-3 OLYMPIC PODIUM ─── */}
            {top1 && (
              <div className="pt-2 pb-1">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Top-3 Championship Podium</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Vote Share % Relative to Leader
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-4">
                  {/* #2 Silver (Left) */}
                  {top2 ? (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="flex flex-col items-center"
                    >
                      {/* Avatar / Medal */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-800 border-2 border-slate-300 dark:border-slate-500 shadow-md flex items-center justify-center -mb-5 z-10">
                        <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-200" />
                      </div>
                      {/* Podium Pedestal */}
                      <div className="w-full pt-7 pb-3 px-2 sm:px-3 rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-gradient-to-b from-slate-100 to-slate-200/60 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center text-center shadow-md">
                        <span className="text-xs font-black font-mono text-slate-500 dark:text-slate-400">
                          2ND PLACE
                        </span>
                        <span className="mt-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {top2.booth_code}
                        </span>
                        <h4 className="mt-1 text-xs font-bold text-slate-900 dark:text-white line-clamp-1 w-full" title={top2.title}>
                          {top2.title.replace(/^.+•\s*/, '')}
                        </h4>

                        {/* Animated Vote Share Progress Bar */}
                        <div className="w-full mt-2.5 px-1">
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                              {top2.vote_count} votes
                            </span>
                            <span className="text-slate-500 tabular-nums">
                              {Math.round((top2.vote_count / maxVotes) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-300/80 dark:bg-slate-800 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-slate-400 dark:bg-slate-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${(top2.vote_count / maxVotes) * 100}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setLeaderboardOpen(false);
                            selectProject(top2);
                          }}
                          className="mt-3 w-full py-1 text-[11px] font-mono font-bold rounded-lg bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1 active:scale-95"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div />
                  )}

                  {/* #1 Gold (Center, Elevated) */}
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center z-10"
                  >
                    {/* Crown / Gold Medal */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border-2 border-amber-200 dark:border-amber-300 shadow-lg shadow-amber-500/25 flex items-center justify-center -mb-6 z-10">
                      <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950" />
                    </div>
                    {/* Podium Pedestal */}
                    <div className="w-full pt-8 pb-3.5 px-2.5 sm:px-3.5 rounded-2xl border-2 border-amber-400/80 dark:border-amber-500/60 bg-gradient-to-b from-amber-50/90 to-amber-100/50 dark:from-[#19150d] dark:to-[#0a0d14] flex flex-col items-center text-center shadow-xl ring-2 ring-amber-500/10">
                      <span className="text-xs font-black font-mono text-amber-700 dark:text-amber-400 tracking-wider">
                        ★ 1ST PLACE ★
                      </span>
                      <span className="mt-1 text-[10px] font-mono font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 shadow-xs">
                        {top1.booth_code}
                      </span>
                      <h4 className="mt-1 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 w-full" title={top1.title}>
                        {top1.title.replace(/^.+•\s*/, '')}
                      </h4>

                      {/* Animated Vote Share Progress Bar (100% Benchmark) */}
                      <div className="w-full mt-2.5 px-1">
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                            {top1.vote_count} votes
                          </span>
                          <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                            Leader (100%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-amber-200/80 dark:bg-amber-950/60 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-sm"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setLeaderboardOpen(false);
                          selectProject(top1);
                        }}
                        className="mt-3 w-full py-1.5 text-[11px] font-mono font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs flex items-center justify-center gap-1 active:scale-95"
                      >
                        <span>Inspect Leader</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>

                  {/* #3 Bronze (Right) */}
                  {top3 ? (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="flex flex-col items-center"
                    >
                      {/* Bronze Medal */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-600/70 shadow-md flex items-center justify-center -mb-5 z-10">
                        <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-amber-100" />
                      </div>
                      {/* Podium Pedestal */}
                      <div className="w-full pt-7 pb-3 px-2 sm:px-3 rounded-2xl border border-amber-800/40 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/40 to-amber-100/30 dark:from-[#130d09] dark:to-slate-950 flex flex-col items-center text-center shadow-md">
                        <span className="text-xs font-black font-mono text-amber-800 dark:text-amber-500">
                          3RD PLACE
                        </span>
                        <span className="mt-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-800/30">
                          {top3.booth_code}
                        </span>
                        <h4 className="mt-1 text-xs font-bold text-slate-900 dark:text-white line-clamp-1 w-full" title={top3.title}>
                          {top3.title.replace(/^.+•\s*/, '')}
                        </h4>

                        {/* Animated Vote Share Progress Bar */}
                        <div className="w-full mt-2.5 px-1">
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                            <span className="font-bold text-amber-800 dark:text-amber-400 tabular-nums">
                              {top3.vote_count} votes
                            </span>
                            <span className="text-slate-500 tabular-nums">
                              {Math.round((top3.vote_count / maxVotes) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-300/80 dark:bg-slate-800 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-amber-700/80 dark:bg-amber-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${(top3.vote_count / maxVotes) * 100}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setLeaderboardOpen(false);
                            selectProject(top3);
                          }}
                          className="mt-3 w-full py-1 text-[11px] font-mono font-bold rounded-lg bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1 active:scale-95"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            )}

            {/* ─── FULL STANDINGS & VOTE SHARES LIST (RANKS 4+) ─── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-xs font-mono font-bold text-slate-500">
                <span>All Competing Inventions ({sortedProjects.length})</span>
                <span>Relative Vote Share</span>
              </div>

              <AnimatePresence mode="popLayout">
                {sortedProjects.map((project, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  const votePercent = Math.round((project.vote_count / maxVotes) * 100);

                  return (
                    <motion.div
                      layout
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all overflow-hidden ${
                        isTop3
                          ? 'bg-amber-50/50 dark:bg-[#0f1422] border-amber-300/60 dark:border-amber-500/20 shadow-xs'
                          : 'bg-white/90 dark:bg-[#0a0d16] border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      {/* Subtle Background Progress Fill */}
                      <div
                        className="absolute inset-y-0 left-0 bg-amber-500/5 dark:bg-amber-500/5 pointer-events-none transition-all duration-500"
                        style={{ width: `${votePercent}%` }}
                      />

                      {/* Rank Badge & Project Info */}
                      <div className="relative z-10 flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                            rank === 1
                              ? 'text-amber-800 dark:text-amber-300 bg-amber-400/20 border-amber-400/50'
                              : rank === 2
                              ? 'text-slate-700 dark:text-slate-300 bg-slate-200/80 border-slate-400/40'
                              : rank === 3
                              ? 'text-amber-800 dark:text-amber-400 bg-amber-600/20 border-amber-600/40'
                              : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <span className="font-mono">#{rank}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-slate-300/80 dark:border-slate-700">
                              {project.booth_code}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {project.category}
                            </span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                            {project.title.replace(/^.+•\s*/, '')}
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 truncate font-sans">
                            {project.members.join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar & Actions */}
                      <div className="relative z-10 flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
                        {/* Vote Share Visual Bar */}
                        <div className="hidden sm:flex flex-col items-end w-28">
                          <span className="text-[10px] font-mono font-semibold text-slate-500 tabular-nums">
                            {votePercent}% share
                          </span>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-0.5">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${votePercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Vote Pill */}
                        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <ThumbsUp className="w-3 h-3 text-amber-500" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                            {project.vote_count}
                          </span>
                        </div>

                        {/* Inspect Button */}
                        <button
                          onClick={() => {
                            setLeaderboardOpen(false);
                            selectProject(project);
                          }}
                          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/40 dark:border-amber-500/30 text-xs font-bold transition-all group font-mono active:scale-95"
                        >
                          <span className="hidden xs:inline">Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 dark:bg-[#07090e] border-t border-slate-200/90 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-4 sm:px-5 pb-safe">
            <span className="font-mono text-[11px] tabular-nums">
              {sortedProjects.length} Competing Projects • Max {maxVotes} Votes
            </span>
            <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Verified Standings</span>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
