'use client';

import { useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useExhibitionStore } from '@/store/useExhibitionStore';

function MilkyWaySphere({ isMobile }: { isMobile: boolean }) {
  const texturePath = isMobile ? '/textures/milkyway_mobile_smooth.jpg' : '/textures/milkyway_smooth.jpg';
  const texture = useTexture(texturePath);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (texture) {
      // eslint-disable-next-line react-hooks/immutability
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = 16;
    }
  }, [texture]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Very gentle cosmic drift
      meshRef.current.rotation.y += delta * 0.0002;
    }
  });

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]} rotation={[0.4, -1.2, 0.1]}>
      {/* 550-unit celestial dome with filtered, noise-free Milky Way (within 700 far-plane) */}
      <sphereGeometry args={[550, 36, 24]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        toneMapped={false}
        fog={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function MilkyWaySky() {
  const isMobile = useExhibitionStore((state) => state.isMobile);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  if (isLight) {
    return (
      <group>
        {/* Modern Architectural Daylight Studio Sky Dome */}
        <mesh scale={[-1, 1, 1]}>
          <sphereGeometry args={[550, 32, 20]} />
          <meshBasicMaterial
            color="#e2e8f0"
            side={THREE.BackSide}
            toneMapped={false}
            fog={false}
            depthWrite={false}
          />
        </mesh>
        <ambientLight intensity={0.35} color="#f8fafc" />
      </group>
    );
  }

  return (
    <group>
      {/* Clean, Noise-Free Celestial Atmosphere */}
      <Suspense fallback={null}>
        <MilkyWaySphere isMobile={isMobile} />
      </Suspense>

      {/* Atmospheric Space Lighting */}
      <ambientLight intensity={0.5} color="#e2e8f0" />
      <directionalLight position={[-50, 70, -30]} intensity={0.4} color="#f8fafc" />
    </group>
  );
}
