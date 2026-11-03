'use client';

import { useMemo } from 'react';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getGroundPosterTexture } from '@/lib/screenTextures';
import BoothMesh from './BoothMesh';

export default function Zone1ShowAndTell() {
  const projects = useExhibitionStore((state) => state.projects);
  const zone1Projects = projects.filter((p) => p.zone === 'zone-1');
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';
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
        GROUND POSTER - SHOW & TELL PAVILION
        Placed flat on the entrance walkway into Show & Tell (y = 0.02)
        Ultra-crisp high-contrast canvas decal, zero blur, 100% readable.
      */}
      <group
        position={[-14.5, 0.02, 1.2]}
        rotation={[-Math.PI / 2, 0, -0.38]}
        onClick={handlePavilionClick}
        onPointerOver={() => {
          if (!isMobile) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (!isMobile) document.body.style.cursor = 'auto';
        }}
      >
        <mesh receiveShadow>
          <boxGeometry args={[9.4, 0.015, 2.3]} />
          <meshStandardMaterial color="#0b0814" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[9.48, 0.01, 2.38]} />
          <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[0, 0.016, 0]}>
          <planeGeometry args={[9.2, 2.15]} />
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
        WELCOME & REGISTRATION WORKSTATIONS (Left angled pavilion in blueprint):
        5 Desks with Laptops and 5 Bright RED Chairs
      */}
      <group position={[-16.0, 0, -4.5]} rotation={[0, -0.38, 0]}>
        {/* 5 Workstations in a continuous desk */}
        {[-3.0, -1.5, 0.0, 1.5, 3.0].map((xPos, idx) => (
          <group key={idx} position={[xPos, 0, 0]}>
            {/* Desk Slab */}
            <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.4, 0.05, 0.7]} />
              <meshStandardMaterial color={isLight ? '#c89965' : '#1e2638'} roughness={0.35} metalness={0.1} />
            </mesh>
            {/* Chrome Legs */}
            <mesh position={[-0.65, 0.36, 0]}>
              <boxGeometry args={[0.04, 0.68, 0.65]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.65, 0.36, 0]}>
              <boxGeometry args={[0.04, 0.68, 0.65]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Modesty Panel */}
            <mesh position={[0, 0.42, 0.2]}>
              <boxGeometry args={[1.3, 0.55, 0.02]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            {/* Open Precision Laptop on Desk */}
            <group position={[0, 0.75, 0.05]}>
              <mesh castShadow>
                <boxGeometry args={[0.32, 0.014, 0.22]} />
                <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.1, -0.1]} rotation={[-0.28, 0, 0]}>
                <boxGeometry args={[0.32, 0.22, 0.01]} />
                <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.1, -0.092]} rotation={[-0.28, 0, 0]}>
                <planeGeometry args={[0.29, 0.19]} />
                <meshStandardMaterial color="#8b5cf6" emissive="#7c3aed" emissiveIntensity={1.3} />
              </mesh>
            </group>
            {/* Bright RED Modern Task Chair behind the desk */}
            <group position={[0, 0, -0.65]}>
              {/* Chrome base */}
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.025, 10]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
              </mesh>
              <mesh position={[0, 0.18, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.32, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
              </mesh>
              {/* Crimson Seat Cushion */}
              <mesh position={[0, 0.36, 0]} castShadow>
                <boxGeometry args={[0.40, 0.05, 0.40]} />
                <meshStandardMaterial color="#dc2626" roughness={0.55} />
              </mesh>
              {/* Ergonomic Red Backrest */}
              <mesh position={[0, 0.62, -0.18]} rotation={[0.08, 0, 0]} castShadow>
                <boxGeometry args={[0.40, 0.44, 0.035]} />
                <meshStandardMaterial color="#ef4444" roughness={0.55} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* Show & Tell Interactive Booths */}
      {zone1Projects.map((project) => (
        <BoothMesh key={project.id} project={project} />
      ))}
    </group>
  );
}
