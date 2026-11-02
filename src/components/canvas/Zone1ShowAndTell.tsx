'use client';

import { Float, Text } from '@react-three/drei';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import BoothMesh from './BoothMesh';

export default function Zone1ShowAndTell() {
  const projects = useExhibitionStore((state) => state.projects);
  const zone1Projects = projects.filter((p) => p.zone === 'zone-1');
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';
  const isMobile = useExhibitionStore((state) => state.isMobile);

  const handlePavilionClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveZone('zone-1');
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Overhead Angled Pavilion Signage (Clickable) */}
      <Float speed={1.0} rotationIntensity={0.01} floatIntensity={0.1}>
        <group
          position={[-18.5, 6.2, -3.0]}
          rotation={[0, -0.38, 0]}
          onClick={handlePavilionClick}
          onPointerOver={() => {
            if (!isMobile) document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            if (!isMobile) document.body.style.cursor = 'auto';
          }}
        >
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[16, 1.8, 0.15]} />
            <meshStandardMaterial color="#0f1422" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[16.2, 1.95, 0.05]} />
            <meshStandardMaterial color="#8b5cf6" emissive="#7c3aed" emissiveIntensity={0.9} />
          </mesh>
          <Text
            position={[0, 0.3, 0.08]}
            fontSize={0.65}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            SHOW & TELL PAVILION
          </Text>
          <Text
            position={[0, -0.35, 0.08]}
            fontSize={0.3}
            color="#c084fc"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.15}
          >
            • JUNIOR & SENIOR INNOVATION SHOWCASE (ST01 - ST08) •
          </Text>
        </group>
      </Float>

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
