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
      {/* Central Hub Collar */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.036, 0.042, 0.05, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
      </mesh>

      {/* 5-Star Chrome Spider Base with Hooded Dual-Wheel Casters */}
      {[0, 72, 144, 216, 288].map((angleDeg, i) => {
        const rad = (angleDeg * Math.PI) / 180;
        const xLeg = Math.sin(rad) * 0.175;
        const zLeg = Math.cos(rad) * 0.175;
        return (
          <group key={i}>
            {/* Swept Chrome Spoke Arm */}
            <mesh position={[xLeg * 0.52, 0.042, zLeg * 0.52]} rotation={[-0.08, rad, 0]}>
              <boxGeometry args={[0.026, 0.022, 0.19]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.12} />
            </mesh>
            {/* Caster Stem */}
            <mesh position={[xLeg, 0.028, zLeg]}>
              <cylinderGeometry args={[0.008, 0.008, 0.022, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Twin-Wheel Caster Assembly */}
            <mesh position={[xLeg, 0.016, zLeg]} rotation={[0, rad, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, 0.024, 10]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Telescopic Chrome Hydraulic Center Column */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.026, 0.03, 0.14, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.02, 0.022, 0.18, 12]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.08} />
      </mesh>

      {/* Pneumatic Adjustment Paddles & Tension Knob */}
      <mesh position={[0.1, 0.32, 0.02]} rotation={[0, 0, Math.PI / 2.3]}>
        <cylinderGeometry args={[0.006, 0.006, 0.12, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0.15, 0.31, 0.02]}>
        <boxGeometry args={[0.03, 0.012, 0.025]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Seat Under-Shell / Synchro-Tilt Mechanism Box */}
      <mesh position={[0, 0.34, -0.01]}>
        <boxGeometry args={[0.34, 0.038, 0.34]} />
        <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.35} />
      </mesh>

      {/* Crimson Red Ergonomic Waterfall Seat Cushion */}
      <mesh position={[0, 0.38, 0.01]} castShadow>
        <boxGeometry args={[0.42, 0.048, 0.41]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} metalness={0.08} />
      </mesh>
      {/* Subtle Side Seat Bolsters */}
      <mesh position={[-0.195, 0.395, 0.01]}>
        <boxGeometry args={[0.035, 0.03, 0.39]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.55} />
      </mesh>
      <mesh position={[0.195, 0.395, 0.01]}>
        <boxGeometry args={[0.035, 0.03, 0.39]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.55} />
      </mesh>
      {/* Front Waterfall Rolled Edge */}
      <mesh position={[0, 0.376, 0.215]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.024, 0.42, 12]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>

      {/* Rear J-Bar Chrome Spine Connecting Seat to Backrest */}
      <mesh position={[0, 0.44, -0.19]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.06, 0.22, 0.025]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.12} />
      </mesh>

      {/* Ergonomic Curved Red Mesh Backrest & Exoskeleton */}
      <group position={[0, 0.66, -0.19]} rotation={[0.09, 0, 0]}>
        {/* Outer Charcoal Polymer Perimeter Frame */}
        <mesh position={[0, 0, -0.012]} castShadow>
          <boxGeometry args={[0.42, 0.48, 0.022]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.35} />
        </mesh>
        {/* Breathable Crimson Red Mesh Core */}
        <mesh position={[0, 0, 0.004]} castShadow>
          <boxGeometry args={[0.38, 0.44, 0.026]} />
          <meshStandardMaterial color="#ef4444" roughness={0.48} metalness={0.1} />
        </mesh>
        {/* Adjustable Lumbar Support Pad & Horizontal Exoskeleton Ribs */}
        <mesh position={[0, -0.08, -0.026]}>
          <boxGeometry args={[0.36, 0.07, 0.02]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.04, -0.025]}>
          <boxGeometry args={[0.38, 0.022, 0.018]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Chrome Top Accent Handle Bar */}
        <mesh position={[0, 0.25, -0.01]}>
          <boxGeometry args={[0.36, 0.02, 0.032]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.12} />
        </mesh>
        {/* Contoured Executive Headrest */}
        <group position={[0, 0.32, 0.01]} rotation={[-0.12, 0, 0]}>
          <mesh position={[0, -0.04, -0.01]}>
            <boxGeometry args={[0.1, 0.06, 0.02]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.24, 0.1, 0.035]} />
            <meshStandardMaterial color="#dc2626" roughness={0.45} />
          </mesh>
        </group>
      </group>

      {/* Dual Chrome Cantilever Armrests with Contoured PU Pads */}
      {[-0.225, 0.225].map((xArm, i) => (
        <group key={i} position={[xArm, 0.43, -0.01]}>
          {/* Lower Chrome L-Bracket */}
          <mesh position={[xArm > 0 ? -0.02 : 0.02, -0.06, 0]}>
            <boxGeometry args={[0.05, 0.018, 0.04]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
          </mesh>
          {/* Chrome Vertical Post */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.013, 0.015, 0.17, 10]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.12} />
          </mesh>
          {/* Beveled Soft-Touch Black Arm Pad */}
          <mesh position={[0, 0.13, 0.03]}>
            <boxGeometry args={[0.055, 0.022, 0.23]} />
            <meshStandardMaterial color="#090d16" roughness={0.4} metalness={0.15} />
          </mesh>
          {/* Chrome Side Trim on Armrest */}
          <mesh position={[0, 0.12, 0.03]}>
            <boxGeometry args={[0.058, 0.006, 0.22]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Precision Unibody Student Laptop + Wireless Mouse & Desk Accessories
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
      {/* Dark Microfiber Desk Mat under Laptop */}
      <mesh position={[0.03, -0.005, 0.01]} receiveShadow>
        <boxGeometry args={[0.48, 0.003, 0.30]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Base Unibody Machined Aluminum Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.014, 0.24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Recessed Black Keyboard Well */}
      <mesh position={[0, 0.0075, -0.022]}>
        <boxGeometry args={[0.29, 0.002, 0.125]} />
        <meshStandardMaterial color="#090d16" roughness={0.75} />
      </mesh>
      {/* Backlit Keyboard Key Rows */}
      {[-0.06, -0.035, -0.01, 0.015].map((zRow, idx) => (
        <mesh key={idx} position={[0, 0.009, zRow]}>
          <boxGeometry args={[0.27, 0.0015, 0.016]} />
          <meshStandardMaterial
            color="#1e293b"
            emissive={style.glow}
            emissiveIntensity={0.25}
            roughness={0.6}
          />
        </mesh>
      ))}

      {/* Haptic Glass Trackpad */}
      <mesh position={[0, 0.0078, 0.072]}>
        <boxGeometry args={[0.115, 0.002, 0.068]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.22} />
      </mesh>

      {/* Clutch Hinge Barrel */}
      <mesh position={[0, 0.008, -0.115]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, 0.24, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Angled Retina Display Lid */}
      <group position={[0, 0.008, -0.118]} rotation={[-0.26, 0, 0]}>
        {/* Aluminum Outer Shell */}
        <mesh position={[0, 0.112, 0]} castShadow>
          <boxGeometry args={[0.34, 0.224, 0.009]} />
          <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Glowing Logo Emblem on Back of Laptop Lid */}
        <mesh position={[0, 0.112, -0.005]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={style.glow}
            emissiveIntensity={1.6}
          />
        </mesh>
        {/* Glossy Black Bezel Frame */}
        <mesh position={[0, 0.112, 0.005]}>
          <planeGeometry args={[0.33, 0.214]} />
          <meshStandardMaterial color="#020617" roughness={0.15} metalness={0.8} />
        </mesh>
        {/* Glowing Retina Code/Telemetry Screen */}
        <mesh position={[0, 0.112, 0.006]}>
          <planeGeometry args={[0.312, 0.192]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive={style.color}
            emissiveIntensity={1.35}
            roughness={0.15}
          />
        </mesh>
        {/* UI Split Panes on Laptop Screen */}
        <mesh position={[-0.07, 0.112, 0.007]}>
          <planeGeometry args={[0.14, 0.16]} />
          <meshBasicMaterial color={style.glow} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0.075, 0.135, 0.007]}>
          <planeGeometry args={[0.12, 0.07]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
        </mesh>
        <mesh position={[0.075, 0.075, 0.007]}>
          <planeGeometry args={[0.12, 0.035]} />
          <meshBasicMaterial color={style.glow} transparent opacity={0.55} />
        </mesh>
        {/* Green Webcam Indicator LED */}
        <mesh position={[0, 0.213, 0.0065]}>
          <circleGeometry args={[0.003, 8]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>

      {/* Sculpted Wireless Ergonomic Mouse Next to Laptop */}
      <group position={[0.22, 0.006, 0.03]} rotation={[0, -0.08, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.052, 0.018, 0.088]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Scroll Wheel & LED Accent */}
        <mesh position={[0, 0.011, -0.02]}>
          <boxGeometry args={[0.008, 0.006, 0.02]} />
          <meshStandardMaterial color={style.glow} emissive={style.color} emissiveIntensity={1.5} />
        </mesh>
      </group>
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
      rotorRef.current.rotation.y += delta * (active ? 1.8 : 0.75);
      rotorRef.current.position.y = 0.08 + Math.sin(clock.getElapsedTime() * 2.4) * 0.012;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.6) * 0.45;
      ringRef.current.rotation.z += delta * 1.1;
    }
  });

  return (
    <group position={[0, 0.75, 0.17]}>
      {/* Illuminated Turntable Pedestal Base */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
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
      <mesh position={[0, 0.018, 0]} receiveShadow castShadow>
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
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
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
          color={isLight ? '#c89965' : '#1b2436'}
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
          <mesh castShadow>
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
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.84, 0.56, 0.03]} />
          <meshStandardMaterial
            color={isLight ? '#1e293b' : '#070b14'}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>

        {/* Rhythmic Vertical Architectural Timber/Metallic Slats on Left & Right Wings */}
        {[-0.82, -0.72, -0.62, -0.52, -0.42, 0.42, 0.52, 0.62, 0.72, 0.82].map((xSlat, sIdx) => (
          <mesh key={sIdx} position={[xSlat, 0, 0.02]} castShadow>
            <boxGeometry args={[0.032, 0.52, 0.02]} />
            <meshStandardMaterial
              color={isLight ? '#b88652' : '#1e293b'}
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
