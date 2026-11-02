'use client';

import { useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Project, CategoryType } from '@/types';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getBoothMonitorTexture } from '@/lib/screenTextures';
import { ThumbsUp } from 'lucide-react';

interface BoothMeshProps {
  project: Project;
}

const CATEGORY_STYLES: Record<CategoryType, {
  color: string;
  glow: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  badgeColor: string;
}> = {
  Physical: {
    color: '#f59e0b',
    glow: '#fbbf24',
    badgeBg: 'bg-amber-950/90',
    badgeBorder: 'border-amber-500/70',
    badgeText: 'text-amber-300',
    badgeColor: '#f59e0b',
  },
  Digital: {
    color: '#0284c7',
    glow: '#38bdf8',
    badgeBg: 'bg-sky-950/90',
    badgeBorder: 'border-sky-500/70',
    badgeText: 'text-sky-300',
    badgeColor: '#0284c7',
  },
  Business: {
    color: '#059669',
    glow: '#34d399',
    badgeBg: 'bg-emerald-950/90',
    badgeBorder: 'border-emerald-500/70',
    badgeText: 'text-emerald-300',
    badgeColor: '#059669',
  },
  'Show & Tell': {
    color: '#7c3aed',
    glow: '#a78bfa',
    badgeBg: 'bg-purple-950/90',
    badgeBorder: 'border-purple-500/70',
    badgeText: 'text-purple-300',
    badgeColor: '#7c3aed',
  },
  'Robo Race': {
    color: '#dc2626',
    glow: '#f87171',
    badgeBg: 'bg-rose-950/90',
    badgeBorder: 'border-rose-500/70',
    badgeText: 'text-rose-300',
    badgeColor: '#dc2626',
  },
  'Robo Soccer': {
    color: '#0d9488',
    glow: '#2dd4bf',
    badgeBg: 'bg-teal-950/90',
    badgeBorder: 'border-teal-500/70',
    badgeText: 'text-teal-300',
    badgeColor: '#0d9488',
  },
};

/**
 * High-End Architectural Red Ergonomic Task Chair
 * Contoured red mesh backrest, crimson waterfall seat cushion, dual chrome cantilever armrests,
 * pneumatic lift cylinder with adjustment lever, and a 5-star chrome spider base with caster wheels.
 */
function ExecutiveRedChair({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 5-Star Chrome Spider Base */}
      {[0, 72, 144, 216, 288].map((angleDeg, i) => {
        const rad = (angleDeg * Math.PI) / 180;
        const xLeg = Math.sin(rad) * 0.16;
        const zLeg = Math.cos(rad) * 0.16;
        return (
          <group key={i}>
            {/* Chrome Spoke Arm */}
            <mesh position={[xLeg * 0.5, 0.035, zLeg * 0.5]} rotation={[0, rad, 0]}>
              <boxGeometry args={[0.025, 0.02, 0.18]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Black Caster Wheel */}
            <mesh position={[xLeg, 0.02, zLeg]}>
              <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
          </group>
        );
      })}

      {/* Chrome Hydraulic Center Column */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.022, 0.025, 0.28, 12]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
      </mesh>
      {/* Pneumatic adjustment knob under seat */}
      <mesh position={[0.09, 0.31, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.008, 0.008, 0.1, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>

      {/* Seat Under-shell / Mechanism */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.38, 0.03, 0.38]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Crimson Red Ergonomic Waterfall Seat Cushion */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.42, 0.05, 0.42]} />
        <meshStandardMaterial color="#dc2626" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Front waterfall rolled edge */}
      <mesh position={[0, 0.365, 0.21]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.42, 10]} />
        <meshStandardMaterial color="#dc2626" roughness={0.55} />
      </mesh>

      {/* Ergonomic Curved Red Mesh Backrest */}
      <group position={[0, 0.65, -0.19]} rotation={[0.08, 0, 0]}>
        {/* Dark Lumbar Support Spine */}
        <mesh position={[0, -0.05, -0.03]}>
          <boxGeometry args={[0.12, 0.32, 0.02]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Curved Red Mesh Cushion */}
        <mesh castShadow>
          <boxGeometry args={[0.40, 0.46, 0.035]} />
          <meshStandardMaterial color="#ef4444" roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Chrome Back Trim Ring */}
        <mesh position={[0, 0.24, -0.01]}>
          <boxGeometry args={[0.42, 0.02, 0.04]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
      </group>

      {/* Dual Chrome Cantilever Armrests with Black Padded Tops */}
      {[-0.22, 0.22].map((xArm, i) => (
        <group key={i} position={[xArm, 0.44, -0.02]}>
          {/* Chrome Vertical Support */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Black Arm Pad */}
          <mesh position={[0, 0.14, 0.03]}>
            <boxGeometry args={[0.05, 0.02, 0.22]} />
            <meshStandardMaterial color="#090d16" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function BoothMesh({ project }: BoothMeshProps) {
  const [hovered, setHovered] = useState(false);
  const meshGroupRef = useRef<THREE.Group>(null);

  const selectedProject = useExhibitionStore((state) => state.selectedProject);
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const votedProjectIds = useExhibitionStore((state) => state.votedProjectIds);
  const isMobile = useExhibitionStore((state) => state.isMobile);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  const isSelected = selectedProject?.id === project.id;
  const hasVoted = votedProjectIds.includes(project.id);
  const style = CATEGORY_STYLES[project.category] || CATEGORY_STYLES['Digital'];

  // Dynamic high-contrast presentation monitor texture
  const monitorTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getBoothMonitorTexture(project);
  }, [project]);

  useFrame((_, delta) => {
    if (meshGroupRef.current) {
      const targetY = isSelected || hovered ? project.position_y + 0.15 : project.position_y;
      meshGroupRef.current.position.y = THREE.MathUtils.damp(
        meshGroupRef.current.position.y,
        targetY,
        7,
        delta
      );
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    selectProject(project);
  };

  return (
    <group
      ref={meshGroupRef}
      position={[project.position_x, project.position_y, project.position_z]}
      rotation={[0, project.rotation_y || 0, 0]}
      onClick={handleClick}
      onPointerOver={(e) => {
        if (!isMobile) {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        if (!isMobile) {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }
      }}
    >
      {/* 1. Raycastable Touch & Click Hit-box */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 2.8, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 2. Base Platform Dais (Brushed dark slate with glowing category perimeter) */}
      <mesh position={[0, 0.03, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.3, 0.06, 1.7]} />
        <meshStandardMaterial
          color={
            isSelected
              ? (isLight ? '#334155' : '#1e293b')
              : (isLight ? '#f8fafc' : '#0a0f1d')
          }
          metalness={isLight ? 0.08 : 0.45}
          roughness={isLight ? 0.55 : 0.35}
        />
      </mesh>

      {/* Glowing Category Perimeter Accent Inlay */}
      <mesh position={[0, 0.065, 0]}>
        <boxGeometry args={[2.22, 0.015, 1.62]} />
        <meshStandardMaterial
          color={style.glow}
          emissive={style.color}
          emissiveIntensity={hovered || isSelected ? 2.2 : 0.85}
        />
      </mesh>

      {/* Frosted Acrylic Partition Glass on Left Edge */}
      <group position={[-1.12, 0.75, 0]}>
        <mesh>
          <boxGeometry args={[0.02, 1.35, 1.55]} />
          <meshStandardMaterial
            color="#e0f2fe"
            transparent
            opacity={0.32}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Metal Standoff Posts */}
        <mesh position={[0, -0.65, -0.6]}>
          <boxGeometry args={[0.04, 0.08, 0.04]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} />
        </mesh>
        <mesh position={[0, -0.65, 0.6]}>
          <boxGeometry args={[0.04, 0.08, 0.04]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} />
        </mesh>
      </group>

      {/* 3. Exhibition Desk (Dual-Tone Architectural Wood & Chrome) */}
      {/* Desk Top Slab with beveled chamfer feel */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.05, 0.8]} />
        <meshStandardMaterial
          color={isLight ? '#c89965' : '#1c2434'}
          metalness={isLight ? 0.05 : 0.35}
          roughness={isLight ? 0.35 : 0.28}
        />
      </mesh>

      {/* Modesty Panel with Edge-Lit Stall ID Plaque */}
      <group position={[0, 0.42, 0.22]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.86, 0.55, 0.03]} />
          <meshStandardMaterial
            color={isLight ? '#334155' : '#080c16'}
            roughness={0.35}
            metalness={0.3}
          />
        </mesh>
        {/* Edge-Lit Acrylic Plate */}
        <mesh position={[0, 0.05, 0.02]}>
          <boxGeometry args={[0.6, 0.22, 0.015]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive={style.color}
            emissiveIntensity={hovered || isSelected ? 1.4 : 0.6}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Chrome Metal Cantilever Legs (Left & Right) */}
      <mesh position={[-0.92, 0.36, 0]} castShadow>
        <boxGeometry args={[0.04, 0.68, 0.72]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>
      <mesh position={[0.92, 0.36, 0]} castShadow>
        <boxGeometry args={[0.04, 0.68, 0.72]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* Front Edge Glowing Category LED Strip */}
      <mesh position={[0, 0.71, 0.40]}>
        <boxGeometry args={[1.98, 0.025, 0.02]} />
        <meshStandardMaterial
          color={style.glow}
          emissive={style.glow}
          emissiveIntensity={hovered || isSelected ? 2.6 : 1.3}
        />
      </mesh>

      {/* 4. Desk Hardware: Two Precision Laptops */}
      {/* Left Student Laptop (open display facing front) */}
      <group position={[-0.48, 0.75, 0.06]}>
        {/* Base Unibody Aluminum */}
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.014, 0.24]} />
          <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.18} />
        </mesh>
        {/* Black Keyboard Inset */}
        <mesh position={[0, 0.008, -0.02]}>
          <boxGeometry args={[0.28, 0.002, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Trackpad */}
        <mesh position={[0, 0.008, 0.06]}>
          <boxGeometry args={[0.11, 0.002, 0.07]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Angled Display Lid */}
        <group position={[0, 0.007, -0.12]} rotation={[-0.28, 0, 0]}>
          <mesh position={[0, 0.11, 0]} castShadow>
            <boxGeometry args={[0.34, 0.22, 0.01]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Glowing Retina Screen */}
          <mesh position={[0, 0.11, 0.006]}>
            <planeGeometry args={[0.31, 0.19]} />
            <meshStandardMaterial
              color={style.color}
              emissive={style.glow}
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      </group>

      {/* Right Student Laptop */}
      <group position={[0.48, 0.75, 0.06]}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.014, 0.24]} />
          <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, 0.008, -0.02]}>
          <boxGeometry args={[0.28, 0.002, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.008, 0.06]}>
          <boxGeometry args={[0.11, 0.002, 0.07]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>
        <group position={[0, 0.007, -0.12]} rotation={[-0.28, 0, 0]}>
          <mesh position={[0, 0.11, 0]} castShadow>
            <boxGeometry args={[0.34, 0.22, 0.01]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.11, 0.006]}>
            <planeGeometry args={[0.31, 0.19]} />
            <meshStandardMaterial
              color={style.color}
              emissive={style.glow}
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      </group>

      {/* 5. Center Presentation Display on Chrome Mast with DYNAMIC Canvas UI Texture! */}
      <group position={[0, 0.75, -0.22]}>
        {/* Chrome Support Pole & Round Heavy Base */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.015, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.76, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
        </mesh>
        {/* Ultra-Slim Monitor Housing */}
        <mesh position={[0, 0.65, 0]} rotation={[0.06, 0, 0]} castShadow>
          <boxGeometry args={[1.05, 0.58, 0.025]} />
          <meshStandardMaterial color="#0b101c" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* High-Resolution Screen Face with Project UI texture */}
        <mesh position={[0, 0.65, 0.014]} rotation={[0.06, 0, 0]}>
          <planeGeometry args={[1.0, 0.54]} />
          {monitorTexture ? (
            <meshStandardMaterial
              map={monitorTexture}
              emissive="#ffffff"
              emissiveMap={monitorTexture}
              emissiveIntensity={hovered || isSelected ? 0.95 : 0.75}
              roughness={0.2}
            />
          ) : (
            <meshStandardMaterial
              color={style.color}
              emissive={style.glow}
              emissiveIntensity={0.8}
            />
          )}
        </mesh>
      </group>

      {/* 6. TWO RED EXECUTIVE CHAIRS (Exact to Blueprint's Bright Red Seating) */}
      <group position={[0, 0, -0.72]}>
        <ExecutiveRedChair position={[-0.48, 0, 0]} rotation={[0, -0.06, 0]} />
        <ExecutiveRedChair position={[0.48, 0, 0]} rotation={[0, 0.06, 0]} />
      </group>

      {/* 7. Selection Floor Halo & Spot Illumination */}
      {isSelected && (
        <group position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.6, 1.85, 32]} />
            <meshBasicMaterial color={style.glow} transparent opacity={0.9} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.6, 32]} />
            <meshBasicMaterial color={style.glow} transparent opacity={0.16} />
          </mesh>
          <pointLight position={[0, 2.8, 0]} intensity={3.5} color={style.glow} distance={7} decay={2} />
        </group>
      )}

      {/* 8. Clean 3D Floating Pill on Selection */}
      {isSelected ? (
        <Html
          position={[0, 2.2, 0]}
          distanceFactor={20}
          zIndexRange={[15, 0]}
          center
          className="pointer-events-none select-none font-sans"
        >
          <div
            className={`px-3.5 py-1.5 rounded-full border shadow-2xl flex items-center gap-2 backdrop-blur-xl ${
              isLight
                ? 'bg-white/95 border-amber-500 text-slate-900 shadow-slate-300'
                : `${style.badgeBg} ${style.badgeBorder} text-white`
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold tracking-tight">
              {project.id.toUpperCase()}
            </span>
            <span className="text-xs font-bold whitespace-nowrap">
              {project.title}
            </span>
            <span className="text-[10px] font-mono opacity-80 flex items-center gap-0.5 ml-1">
              <ThumbsUp className="w-3 h-3 text-amber-500" />
              {project.vote_count || 0}
            </span>
          </div>
        </Html>
      ) : hovered ? (
        <Html
          position={[0, 1.9, 0]}
          distanceFactor={22}
          zIndexRange={[10, 0]}
          center
          className="pointer-events-none select-none font-sans"
        >
          <div
            className={`px-2.5 py-1 rounded-full border shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-all ${
              isLight
                ? 'bg-white/95 border-slate-300 text-slate-800'
                : 'bg-slate-900/95 border-slate-700 text-slate-100'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-amber-500">
              {project.id.toUpperCase()}
            </span>
            <span className="text-[10px] font-medium truncate max-w-[130px]">
              {project.title}
            </span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}
