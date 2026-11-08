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
      {/* ================================================================= */}
      {/* ARCHITECTURAL SHOW & TELL PAVILION PERIMETER                      */}
      {/* Corner Light Totems & Sculpted Central Floor Light-Box Plaque     */}
      {/* ================================================================= */}
      <group position={[-18.5, 0, -3.0]} rotation={[0, -0.38, 0]}>
        {/* 4 Corner Architectural Light Totem Bollards Framing the Pavilion */}
        {[
          [-10.5, 0, -6.3],
          [10.5, 0, -6.3],
          [-10.5, 0, 6.3],
          [10.5, 0, 6.3],
        ].map(([bx, by, bz], idx) => (
          <group key={idx} position={[bx, by, bz]}>
            {/* Heavy Anodized Base Plinth */}
            <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.22, 0.26, 0.1, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Sleek Vertical Titanium Totem Column */}
            <mesh position={[0, 0.68, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.12, 1.2, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.88} roughness={0.2} />
            </mesh>
            {/* Glowing Neon Purple Light Core & Top Beacon Cap */}
            <mesh position={[0, 0.72, 0]}>
              <cylinderGeometry args={[0.106, 0.106, 0.75, 16]} />
              <meshStandardMaterial color="#c084fc" emissive="#9333ea" emissiveIntensity={2.0} />
            </mesh>
            <mesh position={[0, 1.32, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.08, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
            </mesh>
          </group>
        ))}

        {/* 
          GROUND POSTER - SHOW & TELL CENTRAL WALKWAY LIGHT-BOX
          Centered in the middle of both lines of stalls (Row 1 ST01-ST04 and Row 2 ST05-ST08)
          Ultra-crisp high-contrast canvas decal, zero blur, zero mesh clipping.
        */}
        <group
          position={[0, 0.02, 0]}
          onClick={handlePavilionClick}
          onPointerOver={() => {
            if (!isMobile) document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            if (!isMobile) document.body.style.cursor = 'auto';
          }}
        >
          {/* Outer Beveled Titanium Floor Frame */}
          <mesh receiveShadow>
            <boxGeometry args={[7.45, 0.012, 2.22]} />
            <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.2} />
          </mesh>
          {/* Dark Titanium Inner Plaque */}
          <mesh position={[0, 0.004, 0]} receiveShadow>
            <boxGeometry args={[7.22, 0.014, 2.02]} />
            <meshStandardMaterial color="#0b0814" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Glowing Neon Purple Perimeter Channel */}
          <mesh position={[0, 0.009, 0]}>
            <boxGeometry args={[7.3, 0.01, 2.1]} />
            <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={2.0} />
          </mesh>
          {/* 4 Corner Chrome Bolster Plates */}
          {[
            [-3.58, 0.014, -0.98],
            [3.58, 0.014, -0.98],
            [-3.58, 0.014, 0.98],
            [3.58, 0.014, 0.98],
          ].map(([cx, cy, cz], cIdx) => (
            <mesh key={cIdx} position={[cx, cy, cz]}>
              <boxGeometry args={[0.22, 0.008, 0.22]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
            </mesh>
          ))}
          {/* High-Contrast Ground Poster Face */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.1, 1.9]} />
            {showAndTellTexture && (
              <meshStandardMaterial
                map={showAndTellTexture}
                emissive="#ffffff"
                emissiveMap={showAndTellTexture}
                emissiveIntensity={1.2}
                roughness={0.2}
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
              />
            )}
          </mesh>
        </group>
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
