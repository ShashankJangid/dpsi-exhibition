'use client';

import React, { useState, useMemo } from 'react';
import { useExhibitionStore, NavZoneId } from '@/store/useExhibitionStore';
import { SEED_PROJECTS } from '@/data/seedProjects';
import { Project, CategoryType } from '@/types';
import { playBlip, playClick, isSoundEnabled, toggleSound } from '@/lib/sound';
import {
  Compass,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Radio,
  Eye,
} from 'lucide-react';

// Floor Bounds in World Coordinates
const WORLD_BOUNDS = {
  minX: -32,
  maxX: 28,
  minZ: -36,
  maxZ: 14,
};

const SVG_WIDTH = 260;
const SVG_HEIGHT = 175;
const PADDING_X = 16;
const PADDING_Y = 16;
const MAP_WIDTH = SVG_WIDTH - PADDING_X * 2;
const MAP_HEIGHT = SVG_HEIGHT - PADDING_Y * 2;

function toSvgX(x: number): number {
  const norm = (x - WORLD_BOUNDS.minX) / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX);
  return PADDING_X + Math.max(0, Math.min(1, norm)) * MAP_WIDTH;
}

function toSvgY(z: number): number {
  const norm = (z - WORLD_BOUNDS.minZ) / (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ);
  return PADDING_Y + Math.max(0, Math.min(1, norm)) * MAP_HEIGHT;
}

const CATEGORY_COLORS: Record<CategoryType, string> = {
  Physical: '#f59e0b',
  Digital: '#06b6d4',
  Business: '#10b981',
  'Show & Tell': '#a855f7',
  'Robo Race': '#ef4444',
  'Robo Soccer': '#f43f5e',
};

export default function MinimapHUD() {
  const viewMode = useExhibitionStore((state) => state.viewMode);
  const isDrawerOpen = useExhibitionStore((state) => state.isDrawerOpen);
  const activeZone = useExhibitionStore((state) => state.activeZone);
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const selectedProject = useExhibitionStore((state) => state.selectedProject);
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const isSegmentInspectorOpen = useExhibitionStore((state) => state.isSegmentInspectorOpen);
  const liveCameraPos = useExhibitionStore((state) => state.liveCameraPos);
  const liveCameraTarget = useExhibitionStore((state) => state.liveCameraTarget);
  const isMinimapOpen = useExhibitionStore((state) => state.isMinimapOpen);
  const setIsMinimapOpen = useExhibitionStore((state) => state.setIsMinimapOpen);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [soundActive, setSoundActive] = useState(() => isSoundEnabled());

  // Avoid visual clash when SegmentInspector is taking up the right column
  const isExpanded = isMinimapOpen && !isSegmentInspectorOpen;

  const projects = useExhibitionStore((state) =>
    state.projects.length > 0 ? state.projects : SEED_PROJECTS
  );

  // SVG Coordinates for Live Camera and Target
  const camSvgX = toSvgX(liveCameraPos[0]);
  const camSvgY = toSvgY(liveCameraPos[1]);
  const targetSvgX = toSvgX(liveCameraTarget[0]);
  const targetSvgY = toSvgY(liveCameraTarget[1]);

  // Compute direction angle and FOV vision cone
  const angle = Math.atan2(targetSvgY - camSvgY, targetSvgX - camSvgX);
  const coneLength = 32;
  const fovHalfAngle = Math.PI / 6; // 30 degrees half-FOV
  const coneP1X = camSvgX + Math.cos(angle - fovHalfAngle) * coneLength;
  const coneP1Y = camSvgY + Math.sin(angle - fovHalfAngle) * coneLength;
  const coneP2X = camSvgX + Math.cos(angle + fovHalfAngle) * coneLength;
  const coneP2Y = camSvgY + Math.sin(angle + fovHalfAngle) * coneLength;
  const visionConePath = `M ${camSvgX} ${camSvgY} L ${coneP1X} ${coneP1Y} A ${coneLength} ${coneLength} 0 0 1 ${coneP2X} ${coneP2Y} Z`;

  // Zone Teleport Options
  const ZONE_BUTTONS: { id: NavZoneId; label: string }[] = useMemo(
    () => [
      { id: 'overview', label: 'All' },
      { id: 'zone-1', label: 'Z1 • Show' },
      { id: 'zone-2', label: 'Z2 • Hub' },
      { id: 'zone-3', label: 'Z3 • Robo' },
      { id: 'blueprint', label: 'Top-Down' },
    ],
    []
  );

  if (viewMode !== '3d' || isDrawerOpen) return null;

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundActive(newState);
  };

  return (
    <aside
      aria-label="3D Exhibition Floor Radar Minimap"
      className={`fixed top-16 right-3 sm:top-20 sm:right-6 z-30 transition-all duration-300 font-sans pointer-events-auto ${
        isExpanded ? 'w-64 sm:w-72' : 'w-auto'
      }`}
    >
      {/* Collapsed Radar Beacon Trigger */}
      {!isExpanded ? (
        <button
          onClick={() => {
            playClick();
            setIsMinimapOpen(true);
            if (isSegmentInspectorOpen) {
              useExhibitionStore.getState().setSegmentInspectorOpen(false);
            }
          }}
          className={`group flex items-center gap-2.5 px-3 py-2 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-200 active:scale-95 ${
            isLight
              ? 'bg-white/95 border-slate-200/90 text-slate-800 shadow-slate-300/40 hover:border-amber-400'
              : 'bg-[#090e1a]/90 border-slate-700/60 text-white shadow-black/80 hover:border-amber-500/50'
          }`}
          title="Open Floor Radar Minimap"
          aria-label="Expand Minimap"
        >
          <div className="relative flex items-center justify-center w-5 h-5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
            <Radio className="w-4 h-4 text-emerald-500 relative z-10" />
          </div>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
            Radar
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
        </button>
      ) : (
        /* Expanded Tactical Minimap Surface */
        <div
          className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border shadow-2xl transition-colors duration-300 ${
            isLight
              ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-300/50'
              : 'bg-[#090e1a]/90 border-slate-700/60 text-white shadow-black/80'
          }`}
        >
          {/* Header Bar */}
          <div
            className={`flex items-center justify-between px-3.5 py-2.5 border-b ${
              isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/80 bg-slate-900/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-3.5 h-3.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 relative" />
              </div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-700 dark:text-slate-200">
                Floor Radar
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md uppercase font-semibold ${
                  isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {activeZone.replace('-', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Soundscape Ambient Audio Toggle */}
              <button
                onClick={handleToggleSound}
                className={`p-1.5 rounded-lg transition-colors ${
                  soundActive
                    ? isLight
                      ? 'text-blue-600 hover:bg-blue-50'
                      : 'text-blue-400 hover:bg-blue-950/60'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title={soundActive ? 'Ambient Soundscape: ON' : 'Ambient Soundscape: MUTED'}
                aria-label="Toggle Arena Audio"
              >
                {soundActive ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Minimize Minimap Button */}
              <button
                onClick={() => {
                  playClick();
                  setIsMinimapOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                title="Collapse Minimap"
                aria-label="Collapse Minimap"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Radar Map Viewport */}
          <div className="relative p-2 flex items-center justify-center select-none">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="w-full h-auto max-h-[160px] rounded-xl overflow-hidden"
              style={{
                background: isLight ? '#f8fafc' : '#050811',
              }}
            >
              <defs>
                {/* Vision Cone Gradient */}
                <radialGradient id="visionConeGrad" cx="0%" cy="0%" r="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </radialGradient>

                {/* Radar Grid Pattern */}
                <pattern
                  id="radarGrid"
                  width="16"
                  height="16"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 16 0 L 0 0 0 16"
                    fill="none"
                    stroke={isLight ? '#e2e8f0' : '#1e293b'}
                    strokeWidth="0.6"
                    strokeOpacity="0.6"
                  />
                </pattern>
              </defs>

              {/* Background Grid */}
              <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#radarGrid)" />

              {/* Outer Hall Boundary */}
              <rect
                x={PADDING_X}
                y={PADDING_Y}
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                fill="none"
                stroke={isLight ? '#cbd5e1' : '#334155'}
                strokeWidth="1.2"
                strokeDasharray="4 2"
                rx="6"
              />

              {/* Zone 3: Robotics Arena North Boundary */}
              <g id="zone3-boundary">
                <rect
                  x={toSvgX(-18)}
                  y={toSvgY(-34)}
                  width={toSvgX(18) - toSvgX(-18)}
                  height={toSvgY(-18) - toSvgY(-34)}
                  fill={isLight ? '#fee2e2' : '#450a0a'}
                  fillOpacity={isLight ? 0.35 : 0.25}
                  stroke={isLight ? '#fca5a5' : '#7f1d1d'}
                  strokeWidth="0.8"
                  rx="4"
                />
                <text
                  x={toSvgX(0)}
                  y={toSvgY(-26)}
                  textAnchor="middle"
                  fill={isLight ? '#b91c1c' : '#f87171'}
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  opacity="0.85"
                >
                  ZONE 3 • ROBOTICS
                </text>
              </g>

              {/* Zone 1: Show & Tell West Pavilion Boundary */}
              <g id="zone1-boundary">
                <rect
                  x={toSvgX(-28)}
                  y={toSvgY(-12)}
                  width={toSvgX(-10) - toSvgX(-28)}
                  height={toSvgY(6) - toSvgY(-12)}
                  fill={isLight ? '#f3e8ff' : '#3b0764'}
                  fillOpacity={isLight ? 0.35 : 0.25}
                  stroke={isLight ? '#d8b4fe' : '#6b21a8'}
                  strokeWidth="0.8"
                  rx="4"
                />
                <text
                  x={toSvgX(-19)}
                  y={toSvgY(-3)}
                  textAnchor="middle"
                  fill={isLight ? '#7e22ce' : '#c084fc'}
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  opacity="0.85"
                >
                  ZONE 1 • SHOW & TELL
                </text>
              </g>

              {/* Zone 2: Innovation Hub Boundary */}
              <g id="zone2-boundary">
                <rect
                  x={toSvgX(-4)}
                  y={toSvgY(-17)}
                  width={toSvgX(24) - toSvgX(-4)}
                  height={toSvgY(6) - toSvgY(-17)}
                  fill={isLight ? '#e0f2fe' : '#082f49'}
                  fillOpacity={isLight ? 0.35 : 0.25}
                  stroke={isLight ? '#7dd3fc' : '#0369a1'}
                  strokeWidth="0.8"
                  rx="4"
                />
                <text
                  x={toSvgX(10)}
                  y={toSvgY(-12.5)}
                  textAnchor="middle"
                  fill={isLight ? '#0369a1' : '#38bdf8'}
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  opacity="0.85"
                >
                  ZONE 2 • INNOVATION HUB
                </text>
              </g>

              {/* Keynote Presentation Stage */}
              <g id="keynote-stage">
                <rect
                  x={toSvgX(-9)}
                  y={toSvgY(-22)}
                  width={toSvgX(9) - toSvgX(-9)}
                  height={toSvgY(-18) - toSvgY(-22)}
                  fill={isLight ? '#fef3c7' : '#451a03'}
                  fillOpacity={0.6}
                  stroke="#f59e0b"
                  strokeWidth="0.8"
                  rx="2"
                />
                <text
                  x={toSvgX(0)}
                  y={toSvgY(-20) + 2.5}
                  textAnchor="middle"
                  fill="#f59e0b"
                  fontSize="6.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  KEYNOTE STAGE
                </text>
              </g>

              {/* South Entrance Grand Concourse */}
              <line
                x1={toSvgX(-12)}
                y1={toSvgY(10)}
                x2={toSvgX(12)}
                y2={toSvgY(10)}
                stroke={isLight ? '#94a3b8' : '#475569'}
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <text
                x={toSvgX(0)}
                y={toSvgY(13)}
                textAnchor="middle"
                fill={isLight ? '#64748b' : '#94a3b8'}
                fontSize="6"
                fontFamily="monospace"
              >
                ▼ ENTRANCE CONCOURSE ▼
              </text>

              {/* Interactive Booth Dots */}
              {projects.map((p) => {
                const bx = toSvgX(p.position_x);
                const by = toSvgY(p.position_z);
                const isSelected = selectedProject?.id === p.id;
                const dotColor = CATEGORY_COLORS[p.category] || '#38bdf8';

                return (
                  <g
                    key={p.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      playBlip(720);
                      selectProject(p);
                    }}
                    onMouseEnter={() => setHoveredProject(p)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    {isSelected && (
                      <circle
                        cx={bx}
                        cy={by}
                        r="6"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={bx}
                      cy={by}
                      r={isSelected ? 4 : 2.6}
                      fill={dotColor}
                      stroke={isLight ? '#ffffff' : '#050811'}
                      strokeWidth={isSelected ? 1.2 : 0.8}
                    />
                  </g>
                );
              })}

              {/* Live Camera View Vision Cone */}
              <path
                d={visionConePath}
                fill="url(#visionConeGrad)"
                stroke="#38bdf8"
                strokeWidth="0.5"
                strokeOpacity="0.6"
              />

              {/* Live Camera Position Beacon */}
              <circle
                cx={camSvgX}
                cy={camSvgY}
                r="4.5"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="1.2"
              />
              <circle
                cx={camSvgX}
                cy={camSvgY}
                r="2"
                fill="#ffffff"
              />
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredProject && (
              <div
                className={`absolute bottom-3 left-4 right-4 px-2 py-1.5 rounded-lg border text-[10px] backdrop-blur-md shadow-lg pointer-events-none transition-opacity ${
                  isLight
                    ? 'bg-white/95 border-slate-200 text-slate-800'
                    : 'bg-[#0f172a]/95 border-slate-700 text-white'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold">
                  <span
                    style={{
                      color: CATEGORY_COLORS[hoveredProject.category] || '#38bdf8',
                    }}
                  >
                    {hoveredProject.booth_code}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {hoveredProject.category}
                  </span>
                </div>
                <div className="truncate font-sans font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                  {hoveredProject.title.replace(/^[^•]+•\s*/, '')}
                </div>
              </div>
            )}
          </div>

          {/* Quick Zone Teleport Bar */}
          <div
            className={`p-2 border-t flex items-center justify-between gap-1 ${
              isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/80 bg-slate-900/40'
            }`}
          >
            {ZONE_BUTTONS.map((zb) => {
              const isActive = activeZone === zb.id;
              return (
                <button
                  key={zb.id}
                  onClick={() => {
                    playClick();
                    setActiveZone(zb.id);
                  }}
                  className={`flex-1 py-1 px-1 text-[10px] font-mono font-medium rounded-lg transition-all text-center ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : isLight
                      ? 'hover:bg-slate-200 text-slate-600'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                  title={`Navigate Camera to ${zb.label}`}
                >
                  {zb.label}
                </button>
              );
            })}
          </div>

          {/* Footer Legend */}
          <div
            className={`px-3 py-1.5 border-t text-[9px] font-mono flex items-center justify-between text-slate-400 ${
              isLight ? 'border-slate-100 bg-white' : 'border-slate-800 bg-[#070b14]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-sky-400" />
              <span>Click booth to teleport</span>
            </div>
            <div className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Orientation Cone</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
