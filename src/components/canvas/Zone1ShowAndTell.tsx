'use client';

import { useMemo } from 'react';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getGroundPosterTexture } from '@/lib/screenTextures';
import BoothMesh from './BoothMesh';

export default function Zone1ShowAndTell() {
  const projects = useExhibitionStore((state) => state.projects);
  const zone1Projects = projects.filter((p) => p.zone === 'zone-1');
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const isMobile = useExhibitionStore((state) => state.isMobile);

  const showAndTellTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getGroundPosterTexture('show-and-tell');
  }, []);

  const handlePavilionClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveZone('zone-1');
  };

  return (
    <group position={[0, 0, 0]}>
      {/* 
        GROUND POSTER - SHOW & TELL CENTRAL WALKWAY BANNER
        Centered in the middle of both lines of stalls (Row 1 ST01-ST04 and Row 2 ST05-ST08)
        Ultra-crisp high-contrast canvas decal, zero blur, zero mesh clipping.
      */}
      <group
        position={[-18.5, 0.02, -3.0]}
        rotation={[0, -0.38, 0]}
        onClick={handlePavilionClick}
        onPointerOver={() => {
          if (!isMobile) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (!isMobile) document.body.style.cursor = 'auto';
        }}
      >
        <mesh receiveShadow>
          <boxGeometry args={[7.2, 0.015, 2.0]} />
          <meshStandardMaterial color="#0b0814" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[7.28, 0.01, 2.08]} />
          <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7.1, 1.9]} />
          {showAndTellTexture && (
            <meshStandardMaterial
              map={showAndTellTexture}
              emissive="#ffffff"
              emissiveMap={showAndTellTexture}
              emissiveIntensity={1.2}
              roughness={0.2}
              toneMapped={false}
            />
          )}
        </mesh>
      </group>

      {/* 
        SHOW & TELL INTERACTIVE BOOTHS (ST01 - ST08)
        Cleanly organized into two balanced rows across the pavilion central walkway
        Row 1: ST01 - ST04 (North side)
        Row 2: ST05 - ST08 (South side)
      */}
      {zone1Projects.map((project) => (
        <BoothMesh key={project.id} project={project} />
      ))}
    </group>
  );
}
