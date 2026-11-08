'use client';

import { useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Project, CategoryType } from '@/types';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getBoothMonitorTexture } from '@/lib/screenTextures';
import { playBlip, triggerHaptic } from '@/lib/sound';
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
 * Features 5-star arched chrome spider base, hooded twin-wheel casters, telescopic gas lift,
 * synchronous tilt mechanism, waterfall crimson cushion with side bolsters, exoskeleton lumbar spine,
 * contoured breathable red backrest, executive headrest, and 3D adjustable chrome armrests.
 */
function ExecutiveRedChair({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* 5-Star Chrome Spider Base & Gas Lift Column */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.18, 0.20, 0.04, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.022, 0.024, 0.28, 10]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.08} />
      </mesh>

      {/* Seat Under-Shell & Mechanism */}
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.36, 0.03, 0.36]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Crimson Red Ergonomic Waterfall Seat Cushion */}
      <mesh position={[0, 0.38, 0.01]}>
        <boxGeometry args={[0.42, 0.05, 0.42]} />
        <meshStandardMaterial color="#dc2626" roughness={0.48} metalness={0.1} />
      </mesh>

      {/* Ergonomic Curved Red Mesh Backrest with Chrome Spine Accent */}
      <group position={[0, 0.65, -0.19]} rotation={[0.08, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.40, 0.46, 0.025]} />
          <meshStandardMaterial color="#ef4444" roughness={0.45} metalness={0.12} />
        </mesh>
        {/* Chrome Spine Accent */}
        <mesh position={[0, -0.06, -0.016]}>
          <boxGeometry args={[0.06, 0.24, 0.01]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.12} />
        </mesh>
        {/* Executive Headrest */}
        <mesh position={[0, 0.28, 0.01]}>
          <boxGeometry args={[0.24, 0.1, 0.035]} />
          <meshStandardMaterial color="#dc2626" roughness={0.45} />
        </mesh>
      </group>

      {/* Dual Chrome Cantilever Armrests with Soft Pads */}
      {[-0.22, 0.22].map((xArm, i) => (
        <group key={i} position={[xArm, 0.46, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.045, 0.18, 0.24]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.14} />
          </mesh>
          <mesh position={[0, 0.10, 0]}>
            <boxGeometry args={[0.055, 0.02, 0.22]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * High-Performance Precision Unibody Student Laptop & Wireless Mouse
 */
function WorkstationLaptop({
  position,
  rotation = [0, 0, 0],
  style,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  style: { color: string; glow: string };
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Dark Microfiber Desk Mat (properly offset above desk inlay) */}
      <mesh position={[0.02, 0.003, 0.01]} receiveShadow>
        <boxGeometry args={[0.48, 0.002, 0.30]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Base Unibody Machined Aluminum Chassis + Keyboard Well */}
      <group position={[0, 0.011, 0]}>
        <mesh>
          <boxGeometry args={[0.34, 0.012, 0.24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.18} />
        </mesh>
        {/* Backlit Keyboard Well */}
        <mesh position={[0, 0.007, -0.02]}>
          <boxGeometry args={[0.29, 0.001, 0.13]} />
          <meshStandardMaterial
            color="#090d16"
            emissive={style.color}
            emissiveIntensity={0.2}
            roughness={0.7}
          />
        </mesh>
        {/* Trackpad */}
        <mesh position={[0, 0.007, 0.07]}>
          <boxGeometry args={[0.11, 0.001, 0.065]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Angled Retina Display Lid */}
      <group position={[0, 0.017, -0.118]} rotation={[-0.26, 0, 0]}>
        {/* Aluminum Shell */}
        <mesh position={[0, 0.112, 0]}>
          <boxGeometry args={[0.34, 0.224, 0.008]} />
          <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Glowing Retina Code/Telemetry Screen Face */}
        <mesh position={[0, 0.112, 0.005]}>
          <planeGeometry args={[0.315, 0.198]} />
          <meshStandardMaterial
            color="#070d1a"
            emissive={style.color}
            emissiveIntensity={1.4}
            roughness={0.15}
          />
        </mesh>
        {/* Subtle Screen Split Pane Accent */}
        <mesh position={[-0.07, 0.112, 0.006]}>
          <planeGeometry args={[0.13, 0.16]} />
          <meshBasicMaterial color={style.glow} transparent opacity={0.65} />
        </mesh>
      </group>

      {/* Sleek Wireless Ergonomic Mouse */}
      <mesh position={[0.22, 0.014, 0.03]} rotation={[0, -0.08, 0]}>
        <boxGeometry args={[0.05, 0.018, 0.085]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Category-Specific Animated 3D Prototype Showcase on the Booth Desk!
 * Gives every booth an eye-catching, living 3D centerpiece right in front of the main screen.
 */
function DeskPrototypeShowcase({
  category,
  style,
  active,
}: {
  category: CategoryType;
  style: { color: string; glow: string };
  active: boolean;
}) {
  const rotorRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.y += delta * (active ? 1.8 : 0.6);
      if (active) {
        rotorRef.current.position.y = 0.08 + Math.sin(clock.getElapsedTime() * 2.4) * 0.012;
      }
    }
    if (ringRef.current && active) {
      ringRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.6) * 0.45;
      ringRef.current.rotation.z += delta * 1.1;
    }
  });

  return (
    <group position={[0, 0.75, 0.17]}>
      {/* Illuminated Turntable Pedestal Base */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.02, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.18} />
      </mesh>
      {/* Glowing Emitter Ring */}
      <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.15, 24]} />
        <meshBasicMaterial color={style.glow} />
      </mesh>
      {/* Frosted Acrylic Display Plinth */}
      <mesh position={[0, 0.026, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.008, 20]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.45} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Rotating 3D Prototype Artifact by Category */}
      <group ref={rotorRef} position={[0, 0.08, 0]}>
        {category === 'Physical' && (
          <group>
            {/* IoT Mechatronic Sensor Rig & Micro-Arm */}
            <mesh position={[0, -0.02, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.07, 0.04, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.03, 0]} rotation={[0, 0, 0.25]} castShadow>
              <boxGeometry args={[0.03, 0.09, 0.03]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Dual Ultrasonic / LiDAR Eyes */}
            <mesh position={[0.02, 0.07, 0]} rotation={[0, 0, -0.2]} castShadow>
              <boxGeometry args={[0.08, 0.04, 0.05]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.062, 0.07, 0.014]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.01, 0.01, 0.01, 10]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
            <mesh position={[0.062, 0.07, -0.014]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.01, 0.01, 0.01, 10]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
          </group>
        )}

        {category === 'Digital' && (
          <group>
            {/* Holographic AI Neural Polyhedron & Orbital Ring */}
            <mesh castShadow>
              <octahedronGeometry args={[0.075, 0]} />
              <meshStandardMaterial
                color={style.color}
                emissive={style.glow}
                emissiveIntensity={1.6}
                wireframe
              />
            </mesh>
            <mesh>
              <octahedronGeometry args={[0.042, 0]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh ref={ringRef}>
              <torusGeometry args={[0.095, 0.005, 8, 24]} />
              <meshBasicMaterial color={style.glow} />
            </mesh>
          </group>
        )}

        {category === 'Business' && (
          <group>
            {/* Rising Smart-Enterprise Emerald Crystal Towers */}
            <mesh position={[-0.045, -0.015, 0]} castShadow>
              <boxGeometry args={[0.028, 0.06, 0.028]} />
              <meshStandardMaterial color="#059669" emissive="#10b981" emissiveIntensity={0.8} metalness={0.8} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0.0, 0]} castShadow>
              <boxGeometry args={[0.028, 0.09, 0.028]} />
              <meshStandardMaterial color="#10b981" emissive="#34d399" emissiveIntensity={1.1} metalness={0.8} roughness={0.15} />
            </mesh>
            <mesh position={[0.045, 0.02, 0]} castShadow>
              <boxGeometry args={[0.028, 0.13, 0.028]} />
              <meshStandardMaterial color="#34d399" emissive="#6ee7b7" emissiveIntensity={1.5} metalness={0.85} roughness={0.1} />
            </mesh>
            <mesh ref={ringRef} position={[0, 0.01, 0]}>
              <torusGeometry args={[0.09, 0.004, 8, 24]} />
              <meshBasicMaterial color="#34d399" />
            </mesh>
          </group>
        )}

        {category === 'Show & Tell' && (
          <group>
            {/* Gyroscopic Atomic Plasma Sphere */}
            <mesh>
              <sphereGeometry args={[0.042, 16, 16]} />
              <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={2.0} />
            </mesh>
            <mesh rotation={[0.6, 0, 0]}>
              <torusGeometry args={[0.08, 0.005, 8, 24]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
            </mesh>
            <mesh ref={ringRef} rotation={[-0.6, 0, 0]}>
              <torusGeometry args={[0.098, 0.005, 8, 24]} />
              <meshBasicMaterial color="#c084fc" />
            </mesh>
          </group>
        )}

        {(category === 'Robo Race' || category === 'Robo Soccer') && (
          <group>
            {/* Miniature Autonomous Bot Prototype */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.075, 0.085, 0.045, 16]} />
              <meshStandardMaterial color={style.color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.032, 0]}>
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh ref={ringRef} position={[0, 0.01, 0]}>
              <torusGeometry args={[0.095, 0.005, 8, 24]} />
              <meshBasicMaterial color={style.glow} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

export default function BoothMesh({ project }: BoothMeshProps) {
  const [hovered, setHovered] = useState(false);
  const meshGroupRef = useRef<THREE.Group>(null);

  const selectedProject = useExhibitionStore((state) => state.selectedProject);
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const isMobile = useExhibitionStore((state) => state.isMobile);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  const isSelected = selectedProject?.id === project.id;
  const style = CATEGORY_STYLES[project.category] || CATEGORY_STYLES['Digital'];

  // Dynamic high-contrast presentation monitor texture
  const monitorTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getBoothMonitorTexture(project);
  }, [project]);

  useFrame((_, delta) => {
    if (meshGroupRef.current) {
      const targetY = isSelected || hovered ? project.position_y + 0.15 : project.position_y;
      const currentY = meshGroupRef.current.position.y;
      if (Math.abs(currentY - targetY) > 0.001) {
        meshGroupRef.current.position.y = THREE.MathUtils.damp(
          currentY,
          targetY,
          7,
          delta
        );
      }
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playBlip(780);
    triggerHaptic(15);
    selectProject(project);
  };

  const activeHighlight = hovered || isSelected;

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
          playBlip(480);
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

      {/* ================================================================ */}
      {/* 2. SCULPTED MULTI-TIER ARCHITECTURAL PODIUM DAIS                 */}
      {/* Fits strictly within [2.3m x 1.7m] footprint to preserve spacing */}
      {/* ================================================================ */}
      {/* Bottom Anodized Metallic Skirt */}
      <mesh position={[0, 0.018, 0]} receiveShadow>
        <boxGeometry args={[2.28, 0.036, 1.68]} />
        <meshStandardMaterial
          color={isLight ? '#475569' : '#060a14'}
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* Recessed Continuous Neon Perimeter Underglow Channel */}
      <mesh position={[0, 0.042, 0]}>
        <boxGeometry args={[2.22, 0.016, 1.62]} />
        <meshStandardMaterial
          color={style.glow}
          emissive={style.color}
          emissiveIntensity={activeHighlight ? 2.4 : 0.95}
        />
      </mesh>

      {/* Upper Brushed Architectural Platform Deck */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[2.16, 0.024, 1.56]} />
        <meshStandardMaterial
          color={
            isSelected
              ? isLight
                ? '#334155'
                : '#1e293b'
              : isLight
                ? '#f8fafc'
                : '#0c1324'
          }
          metalness={isLight ? 0.12 : 0.48}
          roughness={isLight ? 0.45 : 0.3}
        />
      </mesh>

      {/* Front Threshold Metallic Step Strip & Corner Hardware Markers */}
      <mesh position={[0, 0.073, 0.74]}>
        <boxGeometry args={[1.4, 0.004, 0.03]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
      </mesh>
      {[
        [-1.02, 0.073, 0.72],
        [1.02, 0.073, 0.72],
        [-1.02, 0.073, -0.72],
        [1.02, 0.073, -0.72],
      ].map(([cx, cy, cz], idx) => (
        <mesh key={idx} position={[cx, cy, cz]}>
          <boxGeometry args={[0.07, 0.005, 0.07]} />
          <meshStandardMaterial
            color={style.glow}
            emissive={style.color}
            emissiveIntensity={activeHighlight ? 2.0 : 0.8}
          />
        </mesh>
      ))}

      {/* ================================================================ */}
      {/* 3. SYMMETRICAL ARCHITECTURAL GLASS & TITANIUM SIDE PARTITIONS    */}
      {/* ================================================================ */}
      {[-1.09, 1.09].map((xSide, sideIdx) => (
        <group key={sideIdx} position={[xSide, 0.74, 0]}>
          {/* Frosted Acoustic Partition Glass */}
          <mesh>
            <boxGeometry args={[0.018, 1.32, 1.48]} />
            <meshStandardMaterial
              color="#e0f2fe"
              transparent
              opacity={isLight ? 0.34 : 0.26}
              metalness={0.92}
              roughness={0.08}
            />
          </mesh>
          {/* Top & Bottom Anodized Aluminum Rails */}
          <mesh position={[0, 0.67, 0]}>
            <boxGeometry args={[0.036, 0.028, 1.50]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, -0.66, 0]}>
            <boxGeometry args={[0.04, 0.035, 1.50]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Rear Structural Titanium Pillar */}
          <mesh position={[0, 0, -0.73]} castShadow>
            <boxGeometry args={[0.042, 1.36, 0.042]} />
            <meshStandardMaterial color="#1e293b" metalness={0.88} roughness={0.2} />
          </mesh>
          {/* Front Edge Vertical Category Neon Light Tube */}
          <mesh position={[0, 0, 0.73]}>
            <boxGeometry args={[0.026, 1.32, 0.026]} />
            <meshStandardMaterial
              color={style.glow}
              emissive={style.color}
              emissiveIntensity={activeHighlight ? 2.5 : 1.2}
            />
          </mesh>
          {/* Chrome Floor Standoff Clamps */}
          <mesh position={[0, -0.64, -0.48]}>
            <boxGeometry args={[0.05, 0.07, 0.05]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.12} />
          </mesh>
          <mesh position={[0, -0.64, 0.48]}>
            <boxGeometry args={[0.05, 0.07, 0.05]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.12} />
          </mesh>
        </group>
      ))}

      {/* ================================================================ */}
      {/* 4. SCULPTED EXHIBITION COUNTER DESK (ARCHITECTURAL SLATS & LEDS) */}
      {/* ================================================================ */}
      {/* Main Desk Tabletop Slab */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.046, 0.8]} />
        <meshStandardMaterial
          color={isLight ? '#ffffff' : '#1b2436'}
          metalness={isLight ? 0.08 : 0.4}
          roughness={isLight ? 0.32 : 0.25}
        />
      </mesh>

      {/* Brushed Aluminum Beveled Edge Trim Frame around Tabletop */}
      <mesh position={[0, 0.72, -0.402]}>
        <boxGeometry args={[2.02, 0.048, 0.012]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Recessed Matte Carbon-Slate Tech Surface Inlay on Desk */}
      <mesh position={[0, 0.745, 0.02]} receiveShadow>
        <boxGeometry args={[1.84, 0.004, 0.68]} />
        <meshStandardMaterial
          color={isLight ? '#1e293b' : '#090d18'}
          roughness={0.45}
          metalness={0.25}
        />
      </mesh>

      {/* Sculpted Waterfall Side Cowls & Chrome Cantilever Legs */}
      {[-0.94, 0.94].map((xLeg, idx) => (
        <group key={idx} position={[xLeg, 0.39, 0]}>
          {/* Outer Chrome Structural C-Frame Leg */}
          <mesh>
            <boxGeometry args={[0.045, 0.66, 0.74]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.14} />
          </mesh>
          {/* Inner Recessed Dark Titanium Core */}
          <mesh position={[xLeg > 0 ? -0.015 : 0.015, 0, 0]}>
            <boxGeometry args={[0.025, 0.60, 0.64]} />
            <meshStandardMaterial color="#0f172a" metalness={0.75} roughness={0.3} />
          </mesh>
          {/* Chrome Leveling Foot Glides */}
          <mesh position={[0, -0.32, 0.3]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.036, 0.02, 12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.32, -0.3]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.036, 0.02, 12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Front Modesty Facade with Architectural Louver Slats & Edge-Lit Stall Plaque */}
      <group position={[0, 0.41, 0.24]}>
        {/* Main Recessed Modesty Core */}
        <mesh receiveShadow>
          <boxGeometry args={[1.84, 0.56, 0.03]} />
          <meshStandardMaterial
            color={isLight ? '#1e293b' : '#070b14'}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>

        {/* Consolidated Fluted Louver Wings (Saves 280 draw calls across 35 booths) */}
        {[-0.62, 0.62].map((xWing, wIdx) => (
          <mesh key={wIdx} position={[xWing, 0, 0.02]}>
            <boxGeometry args={[0.44, 0.52, 0.02]} />
            <meshStandardMaterial
              color={isLight ? '#334155' : '#1e293b'}
              metalness={isLight ? 0.15 : 0.65}
              roughness={0.3}
            />
          </mesh>
        ))}

        {/* Bottom & Top Horizontal Chrome Trim Bars on Front Facade */}
        <mesh position={[0, 0.26, 0.02]}>
          <boxGeometry args={[1.84, 0.018, 0.025]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.26, 0.02]}>
          <boxGeometry args={[1.84, 0.018, 0.025]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Center Backlit Acrylic & Brushed Steel Stall Emblem Plaque */}
        <mesh position={[0, 0.02, 0.018]}>
          <boxGeometry args={[0.68, 0.28, 0.014]} />
          <meshStandardMaterial
            color={style.glow}
            emissive={style.color}
            emissiveIntensity={activeHighlight ? 2.2 : 1.0}
          />
        </mesh>
        <mesh position={[0, 0.02, 0.028]}>
          <boxGeometry args={[0.64, 0.24, 0.012]} />
          <meshStandardMaterial color="#0b101d" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Inner Glowing Category Bar inside Plaque */}
        <mesh position={[0, 0.02, 0.036]}>
          <boxGeometry args={[0.46, 0.04, 0.006]} />
          <meshStandardMaterial
            color={style.glow}
            emissive={style.glow}
            emissiveIntensity={activeHighlight ? 2.8 : 1.5}
          />
        </mesh>
        {/* 4 Chrome Standoff Bolts on Plaque */}
        {[
          [-0.28, 0.1, 0.036],
          [0.28, 0.1, 0.036],
          [-0.28, -0.06, 0.036],
          [0.28, -0.06, 0.036],
        ].map(([bx, by, bz], bIdx) => (
          <mesh key={bIdx} position={[bx, by, bz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.012, 8]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* Front Edge Glowing Category LED Light Bar along Desk Lip */}
      <mesh position={[0, 0.72, 0.404]}>
        <boxGeometry args={[1.98, 0.026, 0.018]} />
        <meshStandardMaterial
          color={style.glow}
          emissive={style.glow}
          emissiveIntensity={activeHighlight ? 2.8 : 1.4}
        />
      </mesh>

      {/* ================================================================ */}
      {/* 5. DESK HARDWARE: DUAL WORKSTATION LAPTOPS + 3D PROTOTYPE        */}
      {/* ================================================================ */}
      <WorkstationLaptop position={[-0.54, 0.75, 0.06]} rotation={[0, 0.08, 0]} style={style} />
      <WorkstationLaptop position={[0.50, 0.75, 0.06]} rotation={[0, -0.08, 0]} style={style} />

      {/* Center Interactive-Looking 3D Category Prototype Turntable */}
      <DeskPrototypeShowcase
        category={project.category}
        style={style}
        active={activeHighlight}
      />

      {/* ================================================================ */}
      {/* 6. CENTER STUDIO DISPLAY ON ARTICULATED CHROME DUAL-MAST         */}
      {/* ================================================================ */}
      <group position={[0, 0.75, -0.22]}>
        {/* Heavy Machined Base Plate with Glowing Ring */}
        <mesh position={[0, 0.01, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.15, 0.02, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.09, 0.12, 20]} />
          <meshBasicMaterial color={style.glow} />
        </mesh>

        {/* Twin Chrome Support Columns */}
        <mesh position={[-0.045, 0.36, -0.02]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.70, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
        </mesh>
        <mesh position={[0.045, 0.36, -0.02]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.70, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
        </mesh>

        {/* Center Cable Spine */}
        <mesh position={[0, 0.36, -0.025]}>
          <boxGeometry args={[0.03, 0.66, 0.016]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Underslung Studio Soundbar Speaker */}
        <mesh position={[0, 0.31, 0.02]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.68, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.31, 0.043]}>
          <boxGeometry args={[0.18, 0.008, 0.004]} />
          <meshBasicMaterial color={style.glow} />
        </mesh>

        {/* Ultra-Slim Metallic Monitor Housing + Rear Cyber Spine */}
        <group position={[0, 0.65, 0]} rotation={[0.05, 0, 0]}>
          {/* Outer Brushed Titanium Frame */}
          <mesh castShadow>
            <boxGeometry args={[1.08, 0.60, 0.028]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.18} />
          </mesh>
          {/* Inner Glossy Black Bezel */}
          <mesh position={[0, 0, 0.006]}>
            <boxGeometry args={[1.04, 0.56, 0.02]} />
            <meshStandardMaterial color="#050811" metalness={0.8} roughness={0.15} />
          </mesh>
          {/* Rear VESA Hub & Glowing Backlight Ring (visible from angles) */}
          <mesh position={[0, 0, -0.018]}>
            <boxGeometry args={[0.38, 0.24, 0.016]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, -0.016]}>
            <boxGeometry args={[0.88, 0.02, 0.008]} />
            <meshStandardMaterial
              color={style.glow}
              emissive={style.color}
              emissiveIntensity={1.8}
            />
          </mesh>

          {/* Top 4K AI Camera / Telemetry Sensor Bar on Monitor */}
          <mesh position={[0, 0.315, 0.008]}>
            <boxGeometry args={[0.22, 0.028, 0.032]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.315, 0.025]}>
            <circleGeometry args={[0.007, 10]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>

          {/* High-Resolution Screen Face with Project UI Texture */}
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[1.0, 0.535]} />
            {monitorTexture ? (
              <meshStandardMaterial
                map={monitorTexture}
                emissive="#ffffff"
                emissiveMap={monitorTexture}
                emissiveIntensity={activeHighlight ? 1.0 : 0.8}
                roughness={0.15}
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
              />
            ) : (
              <meshStandardMaterial
                color={style.color}
                emissive={style.glow}
                emissiveIntensity={0.85}
              />
            )}
          </mesh>
        </group>
      </group>

      {/* ================================================================ */}
      {/* 7. TWO RED EXECUTIVE CHAIRS (Exact to Blueprint's Red Seating)   */}
      {/* ================================================================ */}
      <group position={[0, 0, -0.72]}>
        <ExecutiveRedChair position={[-0.48, 0, 0]} rotation={[0, -0.06, 0]} />
        <ExecutiveRedChair position={[0.48, 0, 0]} rotation={[0, 0.06, 0]} />
      </group>

      {/* 8. Selection Floor Halo & Spot Illumination */}
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

      {/* 9. Clean 3D Floating Pill on Selection / Hover (UNCHANGED) */}
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
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
