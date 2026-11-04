'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getGroundPosterTexture } from '@/lib/screenTextures';
import BoothMesh from './BoothMesh';

function GroundLightBoxPlaque({
  position,
  rotation = [0, 0, 0],
  texture,
  accentColor,
  emissiveColor,
  onClick,
  isMobile,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  texture: THREE.CanvasTexture | null;
  accentColor: string;
  emissiveColor: string;
  onClick: (e: { stopPropagation: () => void }) => void;
  isMobile: boolean;
}) {
  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={() => {
        if (!isMobile) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        if (!isMobile) document.body.style.cursor = 'auto';
      }}
    >
      {/* Outer Beveled Titanium Floor Collar */}
      <mesh receiveShadow>
        <boxGeometry args={[9.08, 0.012, 2.42]} />
        <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.2} />
      </mesh>
      {/* Dark Titanium Inner Base Plaque */}
      <mesh position={[0, 0.004, 0]} receiveShadow>
        <boxGeometry args={[8.8, 0.015, 2.2]} />
        <meshStandardMaterial color="#0b101c" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Glowing Category Neon Perimeter Channel */}
      <mesh position={[0, 0.009, 0]}>
        <boxGeometry args={[8.9, 0.01, 2.3]} />
        <meshStandardMaterial color={accentColor} emissive={emissiveColor} emissiveIntensity={2.0} />
      </mesh>
      {/* 4 Corner Brushed Chrome Bolster Brackets */}
      {[
        [-4.36, 0.015, -1.06],
        [4.36, 0.015, -1.06],
        [-4.36, 0.015, 1.06],
        [4.36, 0.015, 1.06],
      ].map(([cx, cy, cz], idx) => (
        <mesh key={idx} position={[cx, cy, cz]}>
          <boxGeometry args={[0.24, 0.008, 0.24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
        </mesh>
      ))}
      {/* Ultra-Crisp Canvas Ground Poster Face */}
      <mesh position={[0, 0.019, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.6, 2.05]} />
        {texture && (
          <meshStandardMaterial
            map={texture}
            emissive="#ffffff"
            emissiveMap={texture}
            emissiveIntensity={1.2}
            roughness={0.2}
            toneMapped={false}
          />
        )}
      </mesh>
    </group>
  );
}

export default function Zone2InnovationHub() {
  const projects = useExhibitionStore((state) => state.projects);
  const zone2Projects = projects.filter((p) => p.zone === 'zone-2');
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const isMobile = useExhibitionStore((state) => state.isMobile);

  const physicalTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getGroundPosterTexture('physical');
  }, []);

  const digitalTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getGroundPosterTexture('digital');
  }, []);

  const businessTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getGroundPosterTexture('business');
  }, []);

  const verticalTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getGroundPosterTexture('vertical');
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ======================================================== */}
      {/* GROUND POSTERS - ULTRA-CRISP HIGH-CONTRAST LIGHT-BOXES   */}
      {/* Perfectly aligned with aisles, zero blur, 100% readable  */}
      {/* ======================================================== */}

      {/* 1. Physical Solutions Ground Poster (Centered in Aisle 1 between Row 1 & Row 2) */}
      <GroundLightBoxPlaque
        position={[6.4, 0.02, -11.25]}
        texture={physicalTexture}
        accentColor="#f59e0b"
        emissiveColor="#d97706"
        isMobile={isMobile}
        onClick={(e) => {
          e.stopPropagation();
          setActiveZone('physical');
        }}
      />

      {/* 2. Digital Solutions Ground Poster (Centered in Aisle 2 between Row 2 & Row 3) */}
      <GroundLightBoxPlaque
        position={[6.4, 0.02, -6.0]}
        texture={digitalTexture}
        accentColor="#0284c7"
        emissiveColor="#0369a1"
        isMobile={isMobile}
        onClick={(e) => {
          e.stopPropagation();
          setActiveZone('digital');
        }}
      />

      {/* 3. Business Solutions Ground Poster (Centered in Aisle 3 between Row 3 & Row 4) */}
      <GroundLightBoxPlaque
        position={[6.4, 0.02, -0.75]}
        texture={businessTexture}
        accentColor="#059669"
        emissiveColor="#047857"
        isMobile={isMobile}
        onClick={(e) => {
          e.stopPropagation();
          setActiveZone('business');
        }}
      />

      {/* 4. Vertical Tech Gallery Ground Poster (Along Central Promenade in front of the 12 Vertical Stalls) */}
      <GroundLightBoxPlaque
        position={[17.2, 0.02, -2.5]}
        rotation={[0, -Math.PI / 2, 0]}
        texture={verticalTexture}
        accentColor="#10b981"
        emissiveColor="#059669"
        isMobile={isMobile}
        onClick={(e) => {
          e.stopPropagation();
          setActiveZone('business');
        }}
      />

      {/* All Zone 2 Booths (P01-P12, D01-D12, B01-B08: 20 Horizontal + 12 Vertical) */}
      {zone2Projects.map((project) => (
        <BoothMesh key={project.id} project={project} />
      ))}
    </group>
  );
}
