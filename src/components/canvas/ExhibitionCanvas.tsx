'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import FloorAndEnvironment from './FloorAndEnvironment';
import Zone1ShowAndTell from './Zone1ShowAndTell';
import Zone2InnovationHub from './Zone2InnovationHub';
import Zone3RoboticsArena from './Zone3RoboticsArena';
import CameraSystem from './CameraSystem';
import MilkyWaySky from './MilkyWaySky';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { Loader2 } from 'lucide-react';

function CanvasLoader() {
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';
  return (
    <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md transition-colors ${
      isLight ? 'bg-slate-100/90 text-slate-800' : 'bg-[#070b14]/90 text-slate-100'
    }`}>
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        <Loader2 className="w-5 h-5 text-amber-500 animate-pulse absolute" />
      </div>
      <p className="mt-4 text-xs font-mono tracking-widest text-amber-600 dark:text-amber-300 uppercase font-bold">
        Rendering Clean Floor Plan...
      </p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">DPS Indirapuram Tech & Innovation</p>
    </div>
  );
}

function SceneSetup() {
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';
  return (
    <color attach="background" args={[isLight ? '#748596' : '#060913']} />
  );
}

export default function ExhibitionCanvas() {
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const isMobile = useExhibitionStore((state) => state.isMobile);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  return (
    <div className={`expo-canvas relative isolate w-full h-[100dvh] select-none touch-none transition-colors duration-500 ${isLight ? 'bg-[#748596]' : 'bg-[#060913]'}`}>
      <Suspense fallback={<CanvasLoader />}>
        <Canvas
          shadows={!isMobile}
          camera={{
            position: isMobile ? [0.8, 10.5, 23.5] : [0.8, 7.5, 18.5],
            fov: isMobile ? 48 : 38,
            near: 0.1,
            far: 2200,
          }}
          dpr={isMobile ? [1, 1.25] : [1, 1.5]}
          gl={{
            powerPreference: 'high-performance',
            antialias: true,
            alpha: false,
          }}
          onPointerMissed={() => {
            selectProject(null);
          }}
        >
          {/* Dynamic Scene Background */}
          <SceneSetup />

          {/* Photorealistic Denoised Milky Way / Sky Atmosphere */}
          <MilkyWaySky />

          {/* Architectural Solid PBR Floor & Environment (Zero Noise, Zero Banding) */}
          <FloorAndEnvironment />

          {/* Smooth Touch / Mouse Camera Controls */}
          <CameraSystem />

          {/* Blueprint Exhibition Zones */}
          <Zone1ShowAndTell />
          <Zone2InnovationHub />
          <Zone3RoboticsArena />

          {/* Clean Post Processing (Subtle Bloom Only on Emissive LEDs, never on light floor) */}
          <EffectComposer multisampling={isMobile ? 0 : 4}>
            <Bloom
              luminanceThreshold={1.3}
              mipmapBlur
              intensity={isLight ? 0.08 : 0.22}
              radius={0.3}
            />
            <Vignette eskil={false} offset={0.06} darkness={isLight ? 0.12 : 0.28} />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
