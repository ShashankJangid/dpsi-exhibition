'use client';

import React from 'react';

/**
 * Closed single-segment geometric paths (24x24 viewBox, centered at 12,12)
 * tuned for glitch-free MorphSVGPlugin transitions across exhibition sections.
 */
export const SECTION_MORPH_PATHS = {
  stage: 'M 12 3 L 19.8 7.5 L 19.8 16.5 L 12 21 L 4.2 16.5 L 4.2 7.5 Z',
  gallery: 'M 12 3 C 17 3 21 7 21 12 C 21 17 17 21 12 21 C 7 21 3 17 3 12 C 3 7 7 3 12 3 Z',
  arenas: 'M 12 3.5 L 21 19.5 L 15.5 19.5 L 12 13 L 8.5 19.5 L 3 19.5 Z',
  projects: 'M 7 3 L 17 3 L 21 7 L 21 17 L 17 21 L 7 21 L 3 17 L 3 7 Z',
  voting: 'M 12 3 L 20 6.5 L 19 13.5 C 18.2 17.5 15.2 19.8 12 21.5 C 8.8 19.8 5.8 17.5 5 13.5 L 4 6.5 Z',
  schedule: 'M 12 2.5 L 14.8 9.2 L 21.5 12 L 14.8 14.8 L 12 21.5 L 9.2 14.8 L 2.5 12 L 9.2 9.2 Z',
} as const;

/**
 * Full-bleed contour paths (1440x48 viewBox) scrubbed by ScrollTrigger across the
 * GradientASCII horizon transition.
 */
export const HORIZON_CONTOUR_PATHS = {
  baseline: 'M 0 46 L 240 46 L 480 44 L 720 42 L 960 44 L 1200 46 L 1440 46 L 1440 48 L 0 48 Z',
  waveform: 'M 0 40 Q 180 12 360 32 T 720 18 T 1080 30 T 1440 18 L 1440 48 L 0 48 Z',
  elevation:
    'M 0 40 L 160 40 L 210 20 L 420 20 L 470 36 L 680 36 L 730 12 L 980 12 L 1030 34 L 1240 34 L 1290 22 L 1440 22 L 1440 48 L 0 48 Z',
} as const;

export const EXHIBITION_SCROLL_ZONES = [
  { id: 'stage', code: '01 STAGE', morph: SECTION_MORPH_PATHS.stage, color: '#3fb950' },
  { id: 'gallery', code: '02 GALLERY', morph: SECTION_MORPH_PATHS.gallery, color: '#38bdf8' },
  { id: 'arenas', code: '03 ARENAS', morph: SECTION_MORPH_PATHS.arenas, color: '#f0883e' },
  { id: 'projects', code: '04 44 LABS', morph: SECTION_MORPH_PATHS.projects, color: '#a855f7' },
  { id: 'voting', code: '05 VOTING', morph: SECTION_MORPH_PATHS.voting, color: '#3fb950' },
  { id: 'schedule', code: '06 SCHEDULE', morph: SECTION_MORPH_PATHS.schedule, color: '#eab308' },
] as const;

interface TelemetryBadgeProps {
  isLight: boolean;
  morphPathRef: React.RefObject<SVGPathElement | null>;
  zoneCodeRef: React.RefObject<HTMLSpanElement | null>;
  progressPctRef: React.RefObject<HTMLSpanElement | null>;
}

/**
 * Compact header telemetry cell housing a MorphSVG CAD icon and live scroll percentage.
 */
export function HeaderScrollTelemetry({
  isLight,
  morphPathRef,
  zoneCodeRef,
  progressPctRef,
}: TelemetryBadgeProps) {
  return (
    <div
      aria-hidden="true"
      className={`hidden xl:flex items-center gap-2 px-3 border-r font-mono text-[11px] select-none ${
        isLight
          ? 'border-slate-200/80 text-slate-600'
          : 'border-[#30363d] text-[#8b949e]'
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 overflow-visible">
        <path
          ref={morphPathRef}
          d={SECTION_MORPH_PATHS.stage}
          fill="none"
          stroke={isLight ? '#1d4ed8' : '#38bdf8'}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>
      <span ref={zoneCodeRef} className="font-bold tracking-tight w-[84px] truncate">
        01 STAGE
      </span>
      <span
        ref={progressPctRef}
        className={`tabular-nums px-1.5 py-0.5 rounded text-[10px] font-bold ${
          isLight ? 'bg-slate-200/70 text-slate-800' : 'bg-[#161b22] text-[#3fb950]'
        }`}
      >
        00%
      </span>
    </div>
  );
}

interface HeroReticleProps {
  isLight: boolean;
  reticleRingRef: React.RefObject<SVGCircleElement | null>;
  reticleCoreRef: React.RefObject<SVGPathElement | null>;
}

/**
 * Architectural CAD emblem beside the hero EXPO'26 display headline that morphs as the page scrolls.
 */
export function HeroBlueprintReticle({
  isLight,
  reticleRingRef,
  reticleCoreRef,
}: HeroReticleProps) {
  return (
    <div
      aria-hidden="true"
      className={`hidden md:flex items-center justify-center w-20 h-20 rounded-2xl border shrink-0 relative ${
        isLight
          ? 'border-slate-300/80 bg-white/70 shadow-xs'
          : 'border-[#30363d] bg-[#0d1117]/80'
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-12 h-12 overflow-visible">
        <circle
          ref={reticleRingRef}
          cx="12"
          cy="12"
          r="10.2"
          fill="none"
          stroke={isLight ? '#94a3b8' : '#30363d'}
          strokeWidth={0.75}
          strokeDasharray="2 2"
        />
        <path
          ref={reticleCoreRef}
          d={SECTION_MORPH_PATHS.stage}
          fill={isLight ? 'rgba(29, 78, 216, 0.08)' : 'rgba(56, 189, 248, 0.1)'}
          stroke={isLight ? '#1d4ed8' : '#38bdf8'}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute bottom-1 right-1.5 text-[8px] font-mono tracking-wider text-slate-400">
        CAD
      </span>
    </div>
  );
}

interface HorizonMorphDividerProps {
  isLight: boolean;
  contourPathRef: React.RefObject<SVGPathElement | null>;
}

/**
 * Scrubbed blueprint contour wave overlaid along the bottom boundary of the ASCII horizon.
 */
export function HorizonMorphDivider({ isLight, contourPathRef }: HorizonMorphDividerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 w-full h-11 z-20 pointer-events-none"
    >
      <path
        ref={contourPathRef}
        d={HORIZON_CONTOUR_PATHS.baseline}
        fill={isLight ? 'rgba(29, 78, 216, 0.08)' : 'rgba(56, 189, 248, 0.10)'}
        stroke={isLight ? '#3b82f6' : '#38bdf8'}
        strokeWidth={1.5}
      />
    </svg>
  );
}

interface ArenaMorphIconProps {
  initialPath: string;
  targetPath: string;
  colorClass: string;
}

/**
 * Corner blueprint icon on Arena cards that morphs on ScrollTrigger reveal.
 */
export function ArenaMorphIcon({ initialPath, targetPath, colorClass }: ArenaMorphIconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`w-5 h-5 shrink-0 ${colorClass}`}>
      <path
        data-arena-morph-path
        data-morph-target={targetPath}
        d={initialPath}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}
