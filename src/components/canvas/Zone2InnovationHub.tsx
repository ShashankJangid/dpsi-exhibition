'use client';

import { Text } from '@react-three/drei';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import BoothMesh from './BoothMesh';

export default function Zone2InnovationHub() {
  const projects = useExhibitionStore((state) => state.projects);
  const zone2Projects = projects.filter((p) => p.zone === 'zone-2');
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const isMobile = useExhibitionStore((state) => state.isMobile);

  return (
    <group position={[0, 0, 0]}>
      {/* Overhead Aisle Indicator Plates - Sleek Hanging Signage with Clickable Nav */}

      {/* Aisle 1: Physical Computing (P01 - P12) */}
      <group
        position={[8.5, 5.8, -10.75]}
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
        {/* Suspension Steel Cables */}
        {[-5.0, 5.0].map((cableX, i) => (
          <mesh key={i} position={[cableX, 2.2, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 4.4, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
          </mesh>
        ))}
        <mesh castShadow>
          <boxGeometry args={[12, 0.72, 0.08]} />
          <meshStandardMaterial color="#0b101c" metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.37, 0]}>
          <boxGeometry args={[12.1, 0.05, 0.1]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.8} />
        </mesh>
        <Text position={[0, 0, 0.05]} fontSize={0.32} color="#fbbf24" anchorX="center" anchorY="middle" letterSpacing={0.08}>
          PHYSICAL COMPUTING • BOOTHS P01 - P12
        </Text>
      </group>

      {/* Aisle 2: Digital Innovations (D01 - D12) */}
      <group
        position={[8.5, 5.8, -5.5]}
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
        {[-5.0, 5.0].map((cableX, i) => (
          <mesh key={i} position={[cableX, 2.2, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 4.4, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
          </mesh>
        ))}
        <mesh castShadow>
          <boxGeometry args={[12, 0.72, 0.08]} />
          <meshStandardMaterial color="#0b101c" metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.37, 0]}>
          <boxGeometry args={[12.1, 0.05, 0.1]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={1.8} />
        </mesh>
        <Text position={[0, 0, 0.05]} fontSize={0.32} color="#38bdf8" anchorX="center" anchorY="middle" letterSpacing={0.08}>
          DIGITAL SOLUTIONS • BOOTHS D01 - D12
        </Text>
      </group>

      {/* Aisle 3: Business & Startups (B01 - B07) */}
      <group
        position={[8.5, 5.8, 0.5]}
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
        {[-5.0, 5.0].map((cableX, i) => (
          <mesh key={i} position={[cableX, 2.2, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 4.4, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
          </mesh>
        ))}
        <mesh castShadow>
          <boxGeometry args={[12, 0.72, 0.08]} />
          <meshStandardMaterial color="#0b101c" metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.37, 0]}>
          <boxGeometry args={[12.1, 0.05, 0.1]} />
          <meshStandardMaterial color="#059669" emissive="#047857" emissiveIntensity={1.8} />
        </mesh>
        <Text position={[0, 0, 0.05]} fontSize={0.32} color="#34d399" anchorX="center" anchorY="middle" letterSpacing={0.08}>
          BUSINESS VENTURES • BOOTHS B01 - B07
        </Text>
      </group>

      {/* All Zone 2 Booths (P01-P12, D01-D12, B01-B07) */}
      {zone2Projects.map((project) => (
        <BoothMesh key={project.id} project={project} />
      ))}
    </group>
  );
}
