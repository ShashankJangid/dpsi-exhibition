'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExhibitionStore, NavZoneId } from '@/store/useExhibitionStore';
import { Project } from '@/types';
import {
  X,
  Compass,
  Cpu,
  Code2,
  TrendingUp,
  Bot,
  Sparkles,
  ChevronRight,
  Eye,
  ThumbsUp,
  Activity,
  Layers,
  ArrowRight,
  Radio,
  ExternalLink,
} from 'lucide-react';

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
    badgeText: 'Live Arenas • Obstacle Ramps',
    description: 'Features high-speed obstacle track with climbing ramps, dynamic robotic soccer pitch, and technical staging concourse.',
  },
  physical: {
    title: 'Physical Computing Wing',
    tagline: 'Booths P01 – P12 • Hardware & IoT',
    icon: Cpu,
    accentColor: 'text-amber-500 dark:text-amber-400',
    accentBorder: 'border-amber-500/40',
    accentBg: 'bg-amber-500/10',
    badgeText: 'Hardware • Embedded • Robotics',
    description: 'Hardware prototypes, Arduino & Raspberry Pi sensor telemetry, microcontrollers, and automation devices.',
  },
  digital: {
    title: 'Digital Solutions Wing',
    tagline: 'Booths D01 – D12 • AI, Web & Mobile',
    icon: Code2,
    accentColor: 'text-sky-500 dark:text-sky-400',
    accentBorder: 'border-sky-500/40',
    accentBg: 'bg-sky-500/10',
    badgeText: 'AI • Web3 • Cloud Architectures',
    description: 'Full-stack web applications, machine learning computer vision engines, and distributed mobile services.',
  },
  business: {
    title: 'Business Ventures Wing',
    tagline: 'Booths B01 – B07 • Startups & FinTech',
    icon: TrendingUp,
    accentColor: 'text-emerald-500 dark:text-emerald-400',
    accentBorder: 'border-emerald-500/40',
    accentBg: 'bg-emerald-500/10',
    badgeText: 'Startups • Sustainability • EdTech',
    description: 'Student-founded commercial startups, ESG green technologies, and financial analytics platforms.',
  },
  'zone-1': {
    title: 'Show & Tell Pavilion',
    tagline: 'Booths ST01 – ST08 • Junior Innovators',
    icon: Sparkles,
    accentColor: 'text-purple-500 dark:text-purple-400',
    accentBorder: 'border-purple-500/40',
    accentBg: 'bg-purple-500/10',
    badgeText: 'Junior & Senior Showcase',
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
        className={`fixed z-40 bottom-16 sm:bottom-6 right-3 sm:right-6 w-[calc(100vw-1.5rem)] sm:w-[460px] max-h-[75vh] flex flex-col rounded-3xl backdrop-blur-2xl border shadow-2xl overflow-hidden pointer-events-auto transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200/90 shadow-slate-300/60 text-slate-900'
            : 'bg-[#0a0f1d]/95 border-slate-700/60 shadow-black/90 text-white'
        }`}
      >
        {/* Top Header */}
        <div className={`p-4 sm:p-5 border-b relative ${isLight ? 'border-slate-100 bg-slate-50/70' : 'border-slate-800/80 bg-slate-900/40'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl border ${meta.accentBg} ${meta.accentBorder} ${meta.accentColor}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                    {meta.title}
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${meta.accentBg} ${meta.accentBorder} ${meta.accentColor} font-bold`}>
                    {meta.badgeText}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {meta.tagline}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSegmentInspectorOpen(false)}
              className={`p-1.5 rounded-xl border transition-all ${
                isLight
                  ? 'hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-900'
                  : 'hover:bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
              title="Close Segment Overview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Arena Telemetry banner for Zone 3 */}
          {activeZone === 'zone-3' && (
            <div className={`mt-3.5 p-2.5 rounded-xl border text-[11px] flex flex-col gap-1.5 ${
              isLight ? 'bg-rose-50/80 border-rose-200 text-rose-950' : 'bg-rose-950/30 border-rose-800/40 text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  Live Arena Telemetry
                </span>
                <span className="font-mono text-[10px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-600 dark:text-rose-300">
                  Ramp Obstacle Course Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-0.5 text-[10px]">
                <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-white/80 border-rose-200/60' : 'bg-slate-900/60 border-rose-900/40'}`}>
                  <span className="font-semibold block text-slate-500 dark:text-slate-400">🏎️ Robo Racer Rover</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">2.8 m/s • 25° Incline Climb</span>
                </div>
                <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-white/80 border-rose-200/60' : 'bg-slate-900/60 border-rose-900/40'}`}>
                  <span className="font-semibold block text-slate-500 dark:text-slate-400">⚽ Robo Soccer Match</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">Cyan Striker vs Rose Keeper</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* List of Stalls / Projects Inside This Segment */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[48vh] space-y-2.5 no-scrollbar">
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
            return (
              <div
                key={project.id}
                onClick={() => selectProject(project)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-2 relative ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/80 hover:border-amber-400 shadow-sm'
                    : 'bg-slate-900/50 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700 shadow-inner'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">
                      {project.id.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {project.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleVote(e, project)}
                      disabled={hasVoted}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                        hasVoted
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : isLight
                            ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                      title={hasVoted ? 'You voted for this project' : 'Vote for this project'}
                    >
                      <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'text-emerald-500' : 'text-amber-500'}`} />
                      <span>{project.vote_count || 0}</span>
                    </button>

                    <div className="p-1 rounded-lg bg-amber-500 text-slate-950 group-hover:scale-105 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-amber-500 transition-colors">
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
