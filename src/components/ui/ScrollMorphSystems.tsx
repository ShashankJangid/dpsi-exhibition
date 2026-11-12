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
 * Full-bleed open contour curves (1440x48 viewBox, monotonic X 0->1440)
 * scrubbed by ScrollTrigger across the GradientASCII horizon transition.
 */
export const HORIZON_CONTOUR_PATHS = {
  baseline: 'M 0 42 C 240 42 480 42 720 42 C 960 42 1200 42 1440 42',
  waveform: 'M 0 36 C 240 10 480 44 720 18 C 960 42 1200 12 1440 28',
  elevation:
    'M 0 38 L 180 38 L 240 20 L 520 20 L 580 34 L 780 34 L 840 12 L 1080 12 L 1140 32 L 1320 32 L 1360 22 L 1440 22',
} as const;

export const EXHIBITION_SCROLL_ZONES = [
  { id: 'stage', code: '01 STAGE', morph: SECTION_MORPH_PATHS.stage, color: '#3fb950' },
  { id: 'gallery', code: '02 GALLERY', morph: SECTION_MORPH_PATHS.gallery, color: '#38bdf8' },
  { id: 'arenas', code: '03 ARENAS', morph: SECTION_MORPH_PATHS.arenas, color: '#f0883e' },
  { id: 'projects', code: '04 44 LABS', morph: SECTION_MORPH_PATHS.projects, color: '#a855f7' },
  { id: 'voting', code: '05 VOTING', morph: SECTION_MORPH_PATHS.voting, color: '#3fb950' },
  { id: 'schedule', code: '06 SCHEDULE', morph: SECTION_MORPH_PATHS.schedule, color: '#eab308' },
  { id: 'feedback', code: '07 FEEDBACK', morph: SECTION_MORPH_PATHS.voting, color: '#3fb950' },
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
      className={`hidden xl:flex items-center gap-1.5 px-2.5 border-r font-mono text-[11px] select-none shrink-0 ${
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
        fill="none"
        stroke={isLight ? '#2563eb' : '#38bdf8'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
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
        data-morph-from={initialPath}
        data-morph-target={targetPath}
        d={targetPath}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}
