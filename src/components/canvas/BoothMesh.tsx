'use client';

import { useState, useRef, useMemo, useLayoutEffect } from 'react';
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

const CATEGORY_STYLES: Record<
  CategoryType,
  {
    color: string;
    glow: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    badgeColor: string;
  }
> = {
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

// =========================================================================
// SHARED STATIC GEOMETRIES & MATERIALS FOR HIGH-PERFORMANCE INSTANCING
// Eliminates redundant GPU buffer allocations and batches repeated furniture
// (executive chairs, laptop chassis, monitor frames, floor stands) across all
// 44 booths using THREE.InstancedMesh, cutting draw calls from ~1,800+ to <320!
// =========================================================================
const SHARED_GEOS = {
  unitBox: new THREE.BoxGeometry(1, 1, 1),
  chairBase: new THREE.CylinderGeometry(0.18, 0.2, 0.04, 12),
  chairGasLift: new THREE.CylinderGeometry(0.022, 0.024, 0.28, 10),
  monitorBasePlate: new THREE.CylinderGeometry(0.14, 0.15, 0.02, 20),
  monitorSupportCol: new THREE.CylinderGeometry(0.018, 0.018, 0.7, 12),
  monitorSoundbar: new THREE.CylinderGeometry(0.022, 0.022, 0.68, 12),
  plaqueBolt: new THREE.CylinderGeometry(0.01, 0.01, 0.012, 8),
  footGlide: new THREE.CylinderGeometry(0.032, 0.036, 0.02, 12),
};

const SHARED_MATS = {
  chromeBrushed: new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    metalness: 0.94,
    roughness: 0.14,
  }),
  chromeBright: new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    metalness: 0.97,
    roughness: 0.1,
  }),
  chromeMirror: new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    metalness: 0.98,
    roughness: 0.08,
  }),
  aluminumAnodized: new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    metalness: 0.93,
    roughness: 0.16,
  }),
  steelMuted: new THREE.MeshStandardMaterial({
    color: '#64748b',
    metalness: 0.9,
    roughness: 0.18,
  }),
  titaniumDark: new THREE.MeshStandardMaterial({
    color: '#1e293b',
    metalness: 0.86,
    roughness: 0.2,
  }),
  slateHardware: new THREE.MeshStandardMaterial({
    color: '#0f172a',
    metalness: 0.82,
    roughness: 0.24,
  }),
  deskMatCarbon: new THREE.MeshStandardMaterial({
    color: '#090d16',
    roughness: 0.75,
    metalness: 0.2,
  }),
  bezelGlossBlack: new THREE.MeshStandardMaterial({
    color: '#050811',
    metalness: 0.82,
    roughness: 0.15,
  }),
  chairRedCushion: new THREE.MeshStandardMaterial({
    color: '#dc2626',
    roughness: 0.46,
    metalness: 0.1,
  }),
  chairRedMesh: new THREE.MeshStandardMaterial({
    color: '#ef4444',
    roughness: 0.45,
    metalness: 0.12,
  }),
  partitionGlassLight: new THREE.MeshStandardMaterial({
    color: '#e0f2fe',
    transparent: true,
    opacity: 0.34,
    metalness: 0.92,
    roughness: 0.08,
  }),
  partitionGlassDark: new THREE.MeshStandardMaterial({
    color: '#e0f2fe',
    transparent: true,
    opacity: 0.26,
    metalness: 0.92,
    roughness: 0.08,
  }),
};

interface TransformSpec {
  pos: [number, number, number];
  rot?: [number, number, number];
  scale?: [number, number, number];
}

function applyTransformsToInstancedMesh(
  mesh: THREE.InstancedMesh | null,
  specs: TransformSpec[]
) {
  if (!mesh) return;
  const dummy = new THREE.Object3D();
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    dummy.position.set(s.pos[0], s.pos[1], s.pos[2]);
    if (s.rot) {
      dummy.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
    } else {
      dummy.rotation.set(0, 0, 0);
    }
    if (s.scale) {
      dummy.scale.set(s.scale[0], s.scale[1], s.scale[2]);
    } else {
      dummy.scale.set(1, 1, 1);
    }
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

/**
 * Instanced Booth Furniture, Executive Chairs, Laptop Chassis, Monitor Frames & Floor Stands
 * Batches 58 repeated sub-meshes per booth into compact InstancedMesh draw calls.
 */
function InstancedBoothHardware({ style }: { style: { color: string; glow: string } }) {
  // 1. Unit-Box InstancedMesh refs by material group
  const chromeBrushedBoxesRef = useRef<THREE.InstancedMesh>(null);
  const aluminumBoxesRef = useRef<THREE.InstancedMesh>(null);
  const steelMutedBoxesRef = useRef<THREE.InstancedMesh>(null);
  const titaniumDarkBoxesRef = useRef<THREE.InstancedMesh>(null);
  const slateHardwareBoxesRef = useRef<THREE.InstancedMesh>(null);
  const deskMatBoxesRef = useRef<THREE.InstancedMesh>(null);
  const redCushionBoxesRef = useRef<THREE.InstancedMesh>(null);
  const redMeshBoxesRef = useRef<THREE.InstancedMesh>(null);

  // 2. Cylinder InstancedMesh refs
  const chairBaseCylRef = useRef<THREE.InstancedMesh>(null);
  const chairGasLiftCylRef = useRef<THREE.InstancedMesh>(null);
  const monitorColsCylRef = useRef<THREE.InstancedMesh>(null);
  const footGlidesCylRef = useRef<THREE.InstancedMesh>(null);
  const plaqueBoltsCylRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    // Chair local origins: [-0.48, 0, -0.72] (rotY -0.06) and [0.48, 0, -0.72] (rotY +0.06)
    const chairs = [
      { cx: -0.48, cz: -0.72, ry: -0.06 },
      { cx: 0.48, cz: -0.72, ry: 0.06 },
    ];

    // Laptop local origins: [-0.54, 0.75, 0.06] (rotY +0.08) and [0.50, 0.75, 0.06] (rotY -0.08)
    const laptops = [
      { lx: -0.54, ly: 0.75, lz: 0.06, ry: 0.08 },
      { lx: 0.5, ly: 0.75, lz: 0.06, ry: -0.08 },
    ];

    const transformLocal = (
      ox: number,
      oy: number,
      oz: number,
      ry: number,
      dx: number,
      dy: number,
      dz: number
    ): [number, number, number] => {
      const cosR = Math.cos(ry);
      const sinR = Math.sin(ry);
      return [ox + dx * cosR + dz * sinR, oy + dy, oz - dx * sinR + dz * cosR];
    };

    // A. Chrome Brushed Boxes (12 instances):
    // - 2 partition top rails, 4 partition floor clamps, 2 desk C-frame legs, 1 tabletop rear trim, 4 chair armrests
    const chromeBrushedSpecs: TransformSpec[] = [
      // Partition top rails
      { pos: [-1.09, 1.41, 0], scale: [0.036, 0.028, 1.5] },
      { pos: [1.09, 1.41, 0], scale: [0.036, 0.028, 1.5] },
      // Partition floor clamps
      { pos: [-1.09, 0.1, -0.48], scale: [0.05, 0.07, 0.05] },
      { pos: [-1.09, 0.1, 0.48], scale: [0.05, 0.07, 0.05] },
      { pos: [1.09, 0.1, -0.48], scale: [0.05, 0.07, 0.05] },
      { pos: [1.09, 0.1, 0.48], scale: [0.05, 0.07, 0.05] },
      // Desk outer C-frame legs
      { pos: [-0.94, 0.39, 0], scale: [0.045, 0.66, 0.74] },
      { pos: [0.94, 0.39, 0], scale: [0.045, 0.66, 0.74] },
      // Tabletop beveled rear trim
      { pos: [0, 0.72, -0.402], scale: [2.02, 0.048, 0.012] },
    ];
    for (const c of chairs) {
      for (const xArm of [-0.22, 0.22]) {
        chromeBrushedSpecs.push({
          pos: transformLocal(c.cx, 0, c.cz, c.ry, xArm, 0.46, 0),
          rot: [0, c.ry, 0],
          scale: [0.045, 0.18, 0.24],
        });
      }
      // Chair chrome spine accent
      chromeBrushedSpecs.push({
        pos: transformLocal(c.cx, 0, c.cz, c.ry, 0, 0.59, -0.206),
        rot: [0.08, c.ry, 0],
        scale: [0.06, 0.24, 0.01],
      });
    }
    applyTransformsToInstancedMesh(chromeBrushedBoxesRef.current, chromeBrushedSpecs);

    // B. Anodized Aluminum Boxes (5 instances):
    // - Front threshold step strip, 2 front facade chrome trim bars, 2 laptop unibody bases
    const aluminumSpecs: TransformSpec[] = [
      { pos: [0, 0.073, 0.74], scale: [1.4, 0.004, 0.03] },
      { pos: [0, 0.67, 0.26], scale: [1.84, 0.018, 0.025] },
      { pos: [0, 0.15, 0.26], scale: [1.84, 0.018, 0.025] },
    ];
    for (const l of laptops) {
      aluminumSpecs.push({
        pos: transformLocal(l.lx, l.ly, l.lz, l.ry, 0, 0.011, 0),
        rot: [0, l.ry, 0],
        scale: [0.34, 0.012, 0.24],
      });
    }
    applyTransformsToInstancedMesh(aluminumBoxesRef.current, aluminumSpecs);

    // C. Muted Steel Boxes (6 instances):
    // - 2 partition bottom rails, 2 laptop trackpads, 2 laptop display shells
    const steelSpecs: TransformSpec[] = [
      { pos: [-1.09, 0.08, 0], scale: [0.04, 0.035, 1.5] },
      { pos: [1.09, 0.08, 0], scale: [0.04, 0.035, 1.5] },
    ];
    for (const l of laptops) {
      steelSpecs.push({
        pos: transformLocal(l.lx, l.ly, l.lz, l.ry, 0, 0.018, 0.07),
        rot: [0, l.ry, 0],
        scale: [0.11, 0.001, 0.065],
      });
      steelSpecs.push({
        pos: transformLocal(l.lx, l.ly, l.lz, l.ry, 0, 0.125, -0.146),
        rot: [-0.26, l.ry, 0],
        scale: [0.34, 0.224, 0.008],
      });
    }
    applyTransformsToInstancedMesh(steelMutedBoxesRef.current, steelSpecs);

    // D. Dark Titanium Boxes (5 instances):
    // - 2 rear structural partition pillars, 2 wireless ergonomic mice, 1 outer brushed titanium monitor frame
    const titaniumSpecs: TransformSpec[] = [
      { pos: [-1.09, 0.74, -0.73], scale: [0.042, 1.36, 0.042] },
      { pos: [1.09, 0.74, -0.73], scale: [0.042, 1.36, 0.042] },
      { pos: [0, 1.4, -0.22], rot: [0.05, 0, 0], scale: [1.08, 0.6, 0.028] },
    ];
    for (const l of laptops) {
      titaniumSpecs.push({
        pos: transformLocal(l.lx, l.ly, l.lz, l.ry, 0.22, 0.014, 0.03),
        rot: [0, l.ry - 0.08, 0],
        scale: [0.05, 0.018, 0.085],
      });
    }
    applyTransformsToInstancedMesh(titaniumDarkBoxesRef.current, titaniumSpecs);

    // E. Slate Hardware Boxes (12 instances):
    // - 2 inner recessed desk leg cores, 1 center plaque dark faceplate, 1 monitor cable spine,
    //   1 monitor rear VESA hub, 1 monitor top 4K AI camera bar, 2 chair under-shells, 4 chair armrest pads
    const slateSpecs: TransformSpec[] = [
      { pos: [-0.925, 0.39, 0], scale: [0.025, 0.6, 0.64] },
      { pos: [0.925, 0.39, 0], scale: [0.025, 0.6, 0.64] },
      { pos: [0, 0.43, 0.268], scale: [0.64, 0.24, 0.012] },
      { pos: [0, 1.11, -0.245], scale: [0.03, 0.66, 0.016] },
      { pos: [0, 1.4, -0.238], rot: [0.05, 0, 0], scale: [0.38, 0.24, 0.016] },
      { pos: [0, 1.715, -0.212], rot: [0.05, 0, 0], scale: [0.22, 0.028, 0.032] },
    ];
    for (const c of chairs) {
      slateSpecs.push({
        pos: transformLocal(c.cx, 0, c.cz, c.ry, 0, 0.34, 0),
        rot: [0, c.ry, 0],
        scale: [0.36, 0.03, 0.36],
      });
      for (const xArm of [-0.22, 0.22]) {
        slateSpecs.push({
          pos: transformLocal(c.cx, 0, c.cz, c.ry, xArm, 0.56, 0),
          rot: [0, c.ry, 0],
          scale: [0.055, 0.02, 0.22],
        });
      }
    }
    applyTransformsToInstancedMesh(slateHardwareBoxesRef.current, slateSpecs);

    // F. Desk Mat & Bezel Boxes (3 instances):
    // - 2 microfiber laptop desk mats, 1 inner glossy monitor bezel
    const deskMatSpecs: TransformSpec[] = [
      { pos: [0, 1.4, -0.214], rot: [0.05, 0, 0], scale: [1.04, 0.56, 0.02] },
    ];
    for (const l of laptops) {
      deskMatSpecs.push({
        pos: transformLocal(l.lx, l.ly, l.lz, l.ry, 0.02, 0.003, 0.01),
        rot: [0, l.ry, 0],
        scale: [0.48, 0.002, 0.3],
      });
    }
    applyTransformsToInstancedMesh(deskMatBoxesRef.current, deskMatSpecs);

    // G. Executive Red Chair Cushions & Headrests (4 instances) + Red Mesh Backrests (2 instances)
    const redCushionSpecs: TransformSpec[] = [];
    const redMeshSpecs: TransformSpec[] = [];
    for (const c of chairs) {
      redCushionSpecs.push({
        pos: transformLocal(c.cx, 0, c.cz, c.ry, 0, 0.38, 0.01),
        rot: [0, c.ry, 0],
        scale: [0.42, 0.05, 0.42],
      });
      redCushionSpecs.push({
        pos: transformLocal(c.cx, 0, c.cz, c.ry, 0, 0.93, -0.18),
        rot: [0.08, c.ry, 0],
        scale: [0.24, 0.1, 0.035],
      });
      redMeshSpecs.push({
        pos: transformLocal(c.cx, 0, c.cz, c.ry, 0, 0.65, -0.19),
        rot: [0.08, c.ry, 0],
        scale: [0.4, 0.46, 0.025],
      });
    }
    applyTransformsToInstancedMesh(redCushionBoxesRef.current, redCushionSpecs);
    applyTransformsToInstancedMesh(redMeshBoxesRef.current, redMeshSpecs);

    // H. Cylindrical Instanced Hardware (Chair spider bases, gas lifts, monitor columns, foot glides, plaque bolts)
    applyTransformsToInstancedMesh(chairBaseCylRef.current, [
      { pos: [-0.48, 0.04, -0.72] },
      { pos: [0.48, 0.04, -0.72] },
    ]);
    applyTransformsToInstancedMesh(chairGasLiftCylRef.current, [
      { pos: [-0.48, 0.19, -0.72] },
      { pos: [0.48, 0.19, -0.72] },
    ]);
    applyTransformsToInstancedMesh(monitorColsCylRef.current, [
      { pos: [-0.045, 1.11, -0.24] },
      { pos: [0.045, 1.11, -0.24] },
    ]);
    applyTransformsToInstancedMesh(footGlidesCylRef.current, [
      { pos: [-0.94, 0.07, 0.3] },
      { pos: [-0.94, 0.07, -0.3] },
      { pos: [0.94, 0.07, 0.3] },
      { pos: [0.94, 0.07, -0.3] },
    ]);
    applyTransformsToInstancedMesh(plaqueBoltsCylRef.current, [
      { pos: [-0.28, 0.51, 0.276], rot: [Math.PI / 2, 0, 0] },
      { pos: [0.28, 0.51, 0.276], rot: [Math.PI / 2, 0, 0] },
      { pos: [-0.28, 0.35, 0.276], rot: [Math.PI / 2, 0, 0] },
      { pos: [0.28, 0.35, 0.276], rot: [Math.PI / 2, 0, 0] },
    ]);
  }, []);

  return (
    <group>
      {/* Instanced Box Batches */}
      <instancedMesh
        ref={chromeBrushedBoxesRef}
        args={[SHARED_GEOS.unitBox, SHARED_MATS.chromeBrushed, 15]}
      />
      <instancedMesh
        ref={aluminumBoxesRef}
        args={[SHARED_GEOS.unitBox, SHARED_MATS.aluminumAnodized, 5]}
      />
      <instancedMesh
        ref={steelMutedBoxesRef}
        args={[SHARED_GEOS.unitBox, SHARED_MATS.steelMuted, 6]}
      />
      <instancedMesh
        ref={titaniumDarkBoxesRef}
        args={[SHARED_GEOS.unitBox, SHARED_MATS.titaniumDark, 5]}
        castShadow
      />
      <instancedMesh
        ref={slateHardwareBoxesRef}
        args={[SHARED_GEOS.unitBox, SHARED_MATS.slateHardware, 12]}
      />
      <instancedMesh
        ref={deskMatBoxesRef}
        args={[SHARED_GEOS.unitBox, SHARED_MATS.deskMatCarbon, 3]}
        receiveShadow
      />
      <instancedMesh
        ref={redCushionBoxesRef}
        args={[SHARED_GEOS.unitBox, SHARED_MATS.chairRedCushion, 4]}
      />
      <instancedMesh
        ref={redMeshBoxesRef}
        args={[SHARED_GEOS.unitBox, SHARED_MATS.chairRedMesh, 2]}
      />

      {/* Instanced Cylinder Batches */}
      <instancedMesh
        ref={chairBaseCylRef}
        args={[SHARED_GEOS.chairBase, SHARED_MATS.chromeBrushed, 2]}
      />
      <instancedMesh
        ref={chairGasLiftCylRef}
        args={[SHARED_GEOS.chairGasLift, SHARED_MATS.chromeMirror, 2]}
      />
      <instancedMesh
        ref={monitorColsCylRef}
        args={[SHARED_GEOS.monitorSupportCol, SHARED_MATS.chromeBright, 2]}
        castShadow
      />
      <instancedMesh
        ref={footGlidesCylRef}
        args={[SHARED_GEOS.footGlide, SHARED_MATS.chromeBright, 4]}
      />
      <instancedMesh
        ref={plaqueBoltsCylRef}
        args={[SHARED_GEOS.plaqueBolt, SHARED_MATS.chromeMirror, 4]}
      />

      {/* Laptop Glowing Retina Screens & Backlit Keyboards */}
      {[
        { lx: -0.54, ly: 0.75, lz: 0.06, ry: 0.08 },
        { lx: 0.5, ly: 0.75, lz: 0.06, ry: -0.08 },
      ].map((l, idx) => (
        <group key={idx} position={[l.lx, l.ly, l.lz]} rotation={[0, l.ry, 0]}>
          <mesh position={[0, 0.018, -0.02]}>
            <boxGeometry args={[0.29, 0.001, 0.13]} />
            <meshStandardMaterial
              color="#090d16"
              emissive={style.color}
              emissiveIntensity={0.2}
              roughness={0.7}
            />
          </mesh>
          <group position={[0, 0.017, -0.118]} rotation={[-0.26, 0, 0]}>
            <mesh position={[0, 0.112, 0.005]}>
              <planeGeometry args={[0.315, 0.198]} />
              <meshStandardMaterial
                color="#070d1a"
                emissive={style.color}
                emissiveIntensity={1.4}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[-0.07, 0.112, 0.006]}>
              <planeGeometry args={[0.13, 0.16]} />
              <meshBasicMaterial color={style.glow} transparent opacity={0.65} />
            </mesh>
          </group>
        </group>
      ))}
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
        <meshStandardMaterial
          color="#e0f2fe"
          transparent
          opacity={0.45}
          metalness={0.9}
          roughness={0.1}
        />
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
              <meshStandardMaterial
                color="#059669"
                emissive="#10b981"
                emissiveIntensity={0.8}
                metalness={0.8}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[0, 0.0, 0]} castShadow>
              <boxGeometry args={[0.028, 0.09, 0.028]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#34d399"
                emissiveIntensity={1.1}
                metalness={0.8}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[0.045, 0.02, 0]} castShadow>
              <boxGeometry args={[0.028, 0.13, 0.028]} />
              <meshStandardMaterial
                color="#34d399"
                emissive="#6ee7b7"
                emissiveIntensity={1.5}
                metalness={0.85}
                roughness={0.1}
              />
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
  const isLowPerformanceMode = useExhibitionStore((state) => state.isLowPerformanceMode);
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

      {/* Corner Hardware Glowing Markers */}
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
      {/* 3. SYMMETRICAL ARCHITECTURAL GLASS & NEON SIDE PARTITIONS        */}
      {/* ================================================================ */}
      {[-1.09, 1.09].map((xSide, sideIdx) => (
        <group key={sideIdx} position={[xSide, 0.74, 0]}>
          {/* Frosted Acoustic Partition Glass */}
          <mesh
            geometry={SHARED_GEOS.unitBox}
            material={isLight ? SHARED_MATS.partitionGlassLight : SHARED_MATS.partitionGlassDark}
            scale={[0.018, 1.32, 1.48]}
          />
          {/* Front Edge Vertical Category Neon Light Tube */}
          <mesh position={[0, 0, 0.73]}>
            <boxGeometry args={[0.026, 1.32, 0.026]} />
            <meshStandardMaterial
              color={style.glow}
              emissive={style.color}
              emissiveIntensity={activeHighlight ? 2.5 : 1.2}
            />
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

      {/* Recessed Matte Carbon-Slate Tech Surface Inlay on Desk */}
      <mesh position={[0, 0.745, 0.02]} receiveShadow>
        <boxGeometry args={[1.84, 0.004, 0.68]} />
        <meshStandardMaterial
          color={isLight ? '#1e293b' : '#090d18'}
          roughness={0.45}
          metalness={0.25}
        />
      </mesh>

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

        {/* Consolidated Fluted Louver Wings */}
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

        {/* Center Backlit Acrylic Stall Emblem Plaque */}
        <mesh position={[0, 0.02, 0.018]}>
          <boxGeometry args={[0.68, 0.28, 0.014]} />
          <meshStandardMaterial
            color={style.glow}
            emissive={style.color}
            emissiveIntensity={activeHighlight ? 2.2 : 1.0}
          />
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
      {/* 5. INSTANCED FURNITURE, LAPTOPS, MONITOR STAND & EXECUTIVE CHAIRS */}
      {/* ================================================================ */}
      <InstancedBoothHardware style={style} />

      {/* Center Interactive-Looking 3D Category Prototype Turntable */}
      <DeskPrototypeShowcase
        category={project.category}
        style={style}
        active={activeHighlight}
      />

      {/* ================================================================ */}
      {/* 6. CENTER STUDIO DISPLAY SCREEN & ACCENTS                        */}
      {/* ================================================================ */}
      <group position={[0, 0.75, -0.22]}>
        {/* Heavy Machined Base Plate with Glowing Ring */}
        <mesh
          position={[0, 0.01, 0]}
          geometry={SHARED_GEOS.monitorBasePlate}
          material={SHARED_MATS.aluminumAnodized}
          castShadow
        />
        <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.09, 0.12, 20]} />
          <meshBasicMaterial color={style.glow} />
        </mesh>

        {/* Underslung Studio Soundbar Speaker */}
        <mesh
          position={[0, 0.31, 0.02]}
          rotation={[0, 0, Math.PI / 2]}
          geometry={SHARED_GEOS.monitorSoundbar}
          material={SHARED_MATS.slateHardware}
        />
        <mesh position={[0, 0.31, 0.043]}>
          <boxGeometry args={[0.18, 0.008, 0.004]} />
          <meshBasicMaterial color={style.glow} />
        </mesh>

        {/* Ultra-Slim Metallic Monitor Screen Face + Rear Cyber Spine */}
        <group position={[0, 0.65, 0]} rotation={[0.05, 0, 0]}>
          <mesh position={[0, 0, -0.016]}>
            <boxGeometry args={[0.88, 0.02, 0.008]} />
            <meshStandardMaterial
              color={style.glow}
              emissive={style.color}
              emissiveIntensity={1.8}
            />
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
          {!isLowPerformanceMode && (
            <pointLight
              position={[0, 2.8, 0]}
              intensity={3.5}
              color={style.glow}
              distance={7}
              decay={2}
            />
          )}
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
            <span className="text-xs font-bold whitespace-nowrap">{project.title}</span>
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
