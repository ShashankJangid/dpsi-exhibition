'use client';

import { useMemo } from 'react';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getGroundPosterTexture } from '@/lib/screenTextures';
import BoothMesh from './BoothMesh';

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
      {/* GROUND POSTERS - ULTRA-CRISP HIGH-CONTRAST CANVAS DECALS */}
      {/* Perfectly aligned with aisles, zero blur, 100% readable  */}
      {/* ======================================================== */}

      {/* 1. Physical Solutions Ground Poster (Centered in Aisle 1 between Row 1 & Row 2) */}
      <group
        position={[6.4, 0.02, -11.25]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveZone('physical');
        }}
        onPointerOver={() => {
          if (!isMobile) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (!isMobile) document.body.style.cursor = 'auto';
        }}
      >
        {/* Dark Titanium Base Plaque */}
        <mesh receiveShadow>
          <boxGeometry args={[8.8, 0.015, 2.2]} />
          <meshStandardMaterial color="#0b101c" metalness={0.9} roughness={0.25} />
        </mesh>
        {/* Glowing Amber Perimeter Inlay Trim */}
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[8.88, 0.01, 2.28]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.8} />
        </mesh>
        {/* Ultra-Crisp Canvas Ground Poster Face */}
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8.6, 2.05]} />
          {physicalTexture && (
            <meshStandardMaterial
              map={physicalTexture}
              emissive="#ffffff"
              emissiveMap={physicalTexture}
              emissiveIntensity={1.2}
              roughness={0.2}
              toneMapped={false}
            />
          )}
        </mesh>
      </group>

      {/* 2. Digital Solutions Ground Poster (Centered in Aisle 2 between Row 2 & Row 3) */}
      <group
        position={[6.4, 0.02, -6.0]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveZone('digital');
        }}
        onPointerOver={() => {
          if (!isMobile) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (!isMobile) document.body.style.cursor = 'auto';
        }}
      >
        <mesh receiveShadow>
          <boxGeometry args={[8.8, 0.015, 2.2]} />
          <meshStandardMaterial color="#0b101c" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[8.88, 0.01, 2.28]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8.6, 2.05]} />
          {digitalTexture && (
            <meshStandardMaterial
              map={digitalTexture}
              emissive="#ffffff"
              emissiveMap={digitalTexture}
              emissiveIntensity={1.2}
              roughness={0.2}
              toneMapped={false}
            />
          )}
        </mesh>
      </group>

      {/* 3. Business Solutions Ground Poster (Centered in Aisle 3 between Row 3 & Row 4) */}
      <group
        position={[6.4, 0.02, -0.75]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveZone('business');
        }}
        onPointerOver={() => {
          if (!isMobile) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (!isMobile) document.body.style.cursor = 'auto';
        }}
      >
        <mesh receiveShadow>
          <boxGeometry args={[8.8, 0.015, 2.2]} />
          <meshStandardMaterial color="#0b101c" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[8.88, 0.01, 2.28]} />
          <meshStandardMaterial color="#059669" emissive="#047857" emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8.6, 2.05]} />
          {businessTexture && (
            <meshStandardMaterial
              map={businessTexture}
              emissive="#ffffff"
              emissiveMap={businessTexture}
              emissiveIntensity={1.2}
              roughness={0.2}
              toneMapped={false}
            />
          )}
        </mesh>
      </group>

      {/* 4. Vertical Tech Gallery Ground Poster (Along Central Promenade in front of the 12 Vertical Stalls) */}
      <group
        position={[17.2, 0.02, -2.5]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveZone('business');
        }}
        onPointerOver={() => {
          if (!isMobile) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (!isMobile) document.body.style.cursor = 'auto';
        }}
      >
        <mesh receiveShadow>
          <boxGeometry args={[8.8, 0.015, 2.2]} />
          <meshStandardMaterial color="#0b101c" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[8.88, 0.01, 2.28]} />
          <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8.6, 2.05]} />
          {verticalTexture && (
            <meshStandardMaterial
              map={verticalTexture}
              emissive="#ffffff"
              emissiveMap={verticalTexture}
              emissiveIntensity={1.2}
              roughness={0.2}
              toneMapped={false}
            />
          )}
        </mesh>
      </group>

      {/* All Zone 2 Booths (P01-P12, D01-D12, B01-B08: 20 Horizontal + 12 Vertical) */}
      {zone2Projects.map((project) => (
        <BoothMesh key={project.id} project={project} />
      ))}
    </group>
  );
}
