'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { Project, CategoryType } from '@/types';
import {
  X,
  Compass,
  Cpu,
  Code2,
  TrendingUp,
  Bot,
  Sparkles,
  Eye,
  ThumbsUp,
  Layers,
  Radio,
} from 'lucide-react';

// High-quality dedicated SVG icons replacing OS emojis
export function RaceCarIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M9.5 17h5" />
      <circle cx="17" cy="17" r="2.5" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

export function SoccerBallIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 7 15 10 14 14 10 14 9 10" fill="currentColor" fillOpacity="0.25" />
      <line x1="12" y1="2" x2="12" y2="7" />
      <line x1="15" y1="10" x2="21.5" y2="9" />
      <line x1="14" y1="14" x2="19" y2="19.5" />
      <line x1="10" y1="14" x2="5" y2="19.5" />
      <line x1="9" y1="10" x2="2.5" y2="9" />
    </svg>
  );
}

export interface CategoryCardStyle {
  badge: string;
  pill: string;
  hoverBorder: string;
  hoverBg: string;
  hoverText: string;
  voteIcon: string;
  eyeBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORY_STYLES: Record<CategoryType, CategoryCardStyle> = {
  Physical: {
    badge: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
    pill: 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300 font-semibold',
    hoverBorder: 'hover:border-amber-400/90 dark:hover:border-amber-500/60',
    hoverBg: 'hover:bg-amber-500/[0.04] dark:hover:bg-amber-500/[0.08]',
    hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    voteIcon: 'text-amber-500',
    eyeBg: 'bg-amber-500 text-slate-950 shadow-amber-500/20',
    icon: Cpu,
  },
  Digital: {
    badge: 'bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400',
    pill: 'bg-sky-500/10 border-sky-500/25 text-sky-700 dark:text-sky-300 font-semibold',
    hoverBorder: 'hover:border-sky-400/90 dark:hover:border-sky-500/60',
    hoverBg: 'hover:bg-sky-500/[0.04] dark:hover:bg-sky-500/[0.08]',
    hoverText: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
    voteIcon: 'text-sky-500',
    eyeBg: 'bg-sky-500 text-slate-950 shadow-sky-500/20',
    icon: Code2,
  },
  Business: {
    badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    pill: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-semibold',
    hoverBorder: 'hover:border-emerald-400/90 dark:hover:border-emerald-500/60',
    hoverBg: 'hover:bg-emerald-500/[0.04] dark:hover:bg-emerald-500/[0.08]',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    voteIcon: 'text-emerald-500',
    eyeBg: 'bg-emerald-500 text-slate-950 shadow-emerald-500/20',
    icon: TrendingUp,
  },
  'Show & Tell': {
    badge: 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400',
    pill: 'bg-purple-500/10 border-purple-500/25 text-purple-700 dark:text-purple-300 font-semibold',
    hoverBorder: 'hover:border-purple-400/90 dark:hover:border-purple-500/60',
    hoverBg: 'hover:bg-purple-500/[0.04] dark:hover:bg-purple-500/[0.08]',
    hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    voteIcon: 'text-purple-500',
    eyeBg: 'bg-purple-500 text-white shadow-purple-500/20',
    icon: Sparkles,
  },
  'Robo Race': {
    badge: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
    pill: 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold',
    hoverBorder: 'hover:border-rose-500/80 dark:hover:border-rose-400/70',
    hoverBg: 'hover:bg-rose-500/[0.06] dark:hover:bg-rose-500/[0.08]',
    hoverText: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
    voteIcon: 'text-rose-500',
    eyeBg: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-500/25',
    icon: RaceCarIcon,
  },
  'Robo Soccer': {
    badge: 'bg-teal-500/15 border-teal-500/30 text-teal-600 dark:text-teal-400',
    pill: 'bg-teal-500/15 border-teal-500/30 text-teal-700 dark:text-teal-300 font-semibold',
    hoverBorder: 'hover:border-teal-500/80 dark:hover:border-teal-400/70',
    hoverBg: 'hover:bg-teal-500/[0.06] dark:hover:bg-teal-500/[0.08]',
    hoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    voteIcon: 'text-teal-500',
    eyeBg: 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-teal-500/25',
    icon: SoccerBallIcon,
  },
};

interface ZoneMeta {
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  accentBorder: string;
  accentBg: string;
  badgeText: string;
  description: string;
}

const ZONE_METADATA: Record<string, ZoneMeta> = {
  'zone-3': {
    title: 'Robotics & Arena Wing',
    tagline: 'Autonomous Speed Racing & 2v2 Robotic Soccer',
    icon: Bot,
    accentColor: 'text-rose-500 dark:text-rose-400',
    accentBorder: 'border-rose-500/40',
    accentBg: 'bg-rose-500/10',
    badgeText: 'Speedway & Soccer Arenas',
    description: 'Features high-speed obstacle track with climbing ramps, dynamic robotic soccer pitch, and technical staging concourse.',
  },
  physical: {
    title: 'Physical Computing Wing',
    tagline: 'Booths P01 – P12 • Hardware & IoT',
    icon: Cpu,
    accentColor: 'text-amber-500 dark:text-amber-400',
    accentBorder: 'border-amber-500/40',
    accentBg: 'bg-amber-500/10',
    badgeText: 'Hardware & IoT Systems',
    description: 'Hardware prototypes, Arduino & Raspberry Pi sensor telemetry, microcontrollers, and automation devices.',
  },
  digital: {
    title: 'Digital Solutions Wing',
    tagline: 'Booths D01 – D12 • AI, Web & Mobile',
    icon: Code2,
    accentColor: 'text-sky-500 dark:text-sky-400',
    accentBorder: 'border-sky-500/40',
    accentBg: 'bg-sky-500/10',
    badgeText: 'AI & Cloud Architectures',
    description: 'Full-stack web applications, machine learning computer vision engines, and distributed mobile services.',
  },
  business: {
    title: 'Business Ventures Wing',
    tagline: 'Booths B01 – B07 • Startups & FinTech',
    icon: TrendingUp,
    accentColor: 'text-emerald-500 dark:text-emerald-400',
    accentBorder: 'border-emerald-500/40',
    accentBg: 'bg-emerald-500/10',
    badgeText: 'Startups & FinTech',
    description: 'Student-founded commercial startups, ESG green technologies, and financial analytics platforms.',
  },
  'zone-1': {
    title: 'Show & Tell Pavilion',
    tagline: 'Booths ST01 – ST08 • Junior Innovators',
    icon: Sparkles,
    accentColor: 'text-purple-500 dark:text-purple-400',
    accentBorder: 'border-purple-500/40',
    accentBg: 'bg-purple-500/10',
    badgeText: 'Junior Innovators',
    description: 'Angled innovation hub showcasing creative science exhibits, interactive kiosks, and registration workstations.',
  },
  'zone-2': {
    title: 'Main Exhibition Hall',
    tagline: 'Physical, Digital & Business Innovations',
    icon: Layers,
    accentColor: 'text-indigo-500 dark:text-indigo-400',
    accentBorder: 'border-indigo-500/40',
    accentBg: 'bg-indigo-500/10',
    badgeText: 'All Main Aisles',
    description: 'The central thoroughfare of the expo with 31 exhibition stalls, dual student laptops, and live audience judging.',
  },
};

export default function SegmentInspector() {
  const activeZone = useExhibitionStore((state) => state.activeZone);
  const isSegmentInspectorOpen = useExhibitionStore((state) => state.isSegmentInspectorOpen);
  const setSegmentInspectorOpen = useExhibitionStore((state) => state.setSegmentInspectorOpen);
  const isDrawerOpen = useExhibitionStore((state) => state.isDrawerOpen);
  const projects = useExhibitionStore((state) => state.projects);
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';
  const votedProjectIds = useExhibitionStore((state) => state.votedProjectIds);
  const incrementProjectVote = useExhibitionStore((state) => state.incrementProjectVote);
  const user = useExhibitionStore((state) => state.user);
  const setAuthModalOpen = useExhibitionStore((state) => state.setAuthModalOpen);

  // Filter projects inside this active segment
  const segmentProjects = useMemo(() => {
    if (!activeZone || activeZone === 'overview' || activeZone === 'blueprint') {
      return projects.slice(0, 10);
    }
    if (activeZone === 'zone-1') {
      return projects.filter((p) => p.zone === 'zone-1');
    }
    if (activeZone === 'zone-3') {
      return projects.filter((p) => p.zone === 'zone-3');
    }
    if (activeZone === 'physical') {
      return projects.filter((p) => p.category === 'Physical');
    }
    if (activeZone === 'digital') {
      return projects.filter((p) => p.category === 'Digital');
    }
    if (activeZone === 'business') {
      return projects.filter((p) => p.category === 'Business');
    }
    if (activeZone === 'zone-2') {
      return projects.filter((p) => p.zone === 'zone-2');
    }
    return projects;
  }, [activeZone, projects]);

  // Don't show if project detail drawer is open or if inspector is closed
  if (!isSegmentInspectorOpen || isDrawerOpen) return null;

  const meta = ZONE_METADATA[activeZone] || {
    title: 'Exhibition Hall Segment',
    tagline: 'Interactive Showcase Directory',
    icon: Compass,
    accentColor: 'text-amber-500',
    accentBorder: 'border-amber-500/40',
    accentBg: 'bg-amber-500/10',
    badgeText: 'Expo Directory',
    description: 'Explore live student exhibits, inspect booth hardware in 3D, and cast votes.',
  };

  const IconComponent = meta.icon;

  const handleVote = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (votedProjectIds.includes(project.id)) return;
    incrementProjectVote(project.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 25, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`fixed z-40 bottom-24 sm:bottom-6 right-2.5 sm:right-6 w-[calc(100vw-1.25rem)] sm:w-[460px] max-h-[58vh] sm:max-h-[75vh] flex flex-col rounded-3xl backdrop-blur-2xl border shadow-2xl overflow-hidden pointer-events-auto transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200/90 shadow-slate-300/60 text-slate-900'
            : 'bg-[#0a0f1d]/95 border-slate-700/60 shadow-black/90 text-white'
        }`}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="sm:hidden pt-2 pb-0.5 flex justify-center w-full">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Top Header */}
        <div className={`p-4 sm:p-5 border-b relative ${isLight ? 'border-slate-100 bg-slate-50/70' : 'border-slate-800/80 bg-slate-900/40'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-2xl border shrink-0 ${meta.accentBg} ${meta.accentBorder} ${meta.accentColor}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight shrink-0">
                    {meta.title}
                  </h3>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${meta.accentBg} ${meta.accentBorder} ${meta.accentColor} font-bold whitespace-nowrap shrink-0`}>
                    {meta.badgeText}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {meta.tagline}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSegmentInspectorOpen(false)}
              className={`p-1.5 rounded-xl border transition-all shrink-0 ${
                isLight
                  ? 'hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-900'
                  : 'hover:bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
              title="Close Segment Overview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Arena Telemetry banner for Zone 3 with enhanced high-tech cyber color scheme */}
          {activeZone === 'zone-3' && (
            <div className={`mt-3.5 p-3 rounded-2xl border text-[11px] flex flex-col gap-2 shadow-sm ${
              isLight
                ? 'bg-gradient-to-br from-slate-50 via-white to-slate-50 border-slate-200 text-slate-800'
                : 'bg-gradient-to-br from-slate-900/90 via-[#0b1220]/90 to-slate-900/90 border-slate-700/70 text-slate-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-xs">
                  <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />
                  <span className="tracking-tight font-extrabold">Live Arena Telemetry</span>
                </span>
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 whitespace-nowrap">
                  Dual Arenas Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-0.5 text-[10px]">
                {/* Speed Rover Track Card */}
                <div className={`p-2 rounded-xl border flex flex-col gap-1 transition-all ${
                  isLight
                    ? 'bg-rose-50/70 border-rose-200/90 text-rose-950 shadow-xs'
                    : 'bg-rose-950/25 border-rose-500/30 text-rose-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                      <RaceCarIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Robo Racer Rover</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 font-semibold">
                      Speed Track
                    </span>
                  </div>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[11px]">
                    2.8 m/s • 25° Incline Climb
                  </span>
                </div>

                {/* Robotic Soccer Pitch Card */}
                <div className={`p-2 rounded-xl border flex flex-col gap-1 transition-all ${
                  isLight
                    ? 'bg-teal-50/70 border-teal-200/90 text-teal-950 shadow-xs'
                    : 'bg-teal-950/25 border-teal-500/30 text-teal-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                      <SoccerBallIcon className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>Robo Soccer Match</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-600 dark:text-teal-300 font-semibold">
                      Live Match
                    </span>
                  </div>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-[11px]">
                    Cyan Striker vs Rose Keeper
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* List of Stalls / Projects Inside This Segment */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[36vh] sm:max-h-[48vh] space-y-2.5 no-scrollbar touch-pan-y">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[11px] font-mono font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
              What&apos;s Inside ({segmentProjects.length} Stalls)
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Click to view in 3D
            </span>
          </div>

          {segmentProjects.map((project) => {
            const hasVoted = votedProjectIds.includes(project.id);
            const catStyle = CATEGORY_STYLES[project.category] || CATEGORY_STYLES.Digital;
            const CategoryIcon = catStyle.icon;

            return (
              <div
                key={project.id}
                onClick={() => selectProject(project)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer group flex flex-col gap-2 relative shadow-sm ${
                  isLight
                    ? `bg-slate-50/90 ${catStyle.hoverBg} border-slate-200/80 ${catStyle.hoverBorder}`
                    : `bg-slate-900/60 ${catStyle.hoverBg} border-slate-800/90 ${catStyle.hoverBorder}`
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-lg border font-mono text-[11px] font-bold ${catStyle.badge}`}>
                      {project.booth_code || project.id.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catStyle.pill}`}>
                      <CategoryIcon className="w-3 h-3 shrink-0" />
                      <span>{project.category}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleVote(e, project)}
                      disabled={hasVoted}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                        hasVoted
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : isLight
                            ? 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                      title={hasVoted ? 'You voted for this project' : 'Vote for this project'}
                    >
                      <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'text-emerald-500' : catStyle.voteIcon}`} />
                      <span>{project.vote_count || 0}</span>
                    </button>

                    <div className={`p-1.5 rounded-lg ${catStyle.eyeBg} group-hover:scale-105 transition-transform shadow-xs`}>
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`font-bold text-xs sm:text-sm line-clamp-1 transition-colors ${catStyle.hoverText}`}>
                    {project.title}
                  </h4>
                  <p className={`text-[11px] line-clamp-1 mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {project.members && project.members.length > 0
                      ? `By ${project.members.join(', ')}`
                      : project.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & close */}
        <div className={`p-3 border-t text-center ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/80 bg-slate-900/30'}`}>
          <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            Tip: Click any stall above to fly the 3D camera right into the booth.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
