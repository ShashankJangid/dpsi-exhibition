'use client';

import { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import FloorAndEnvironment from './FloorAndEnvironment';
import Zone1ShowAndTell from './Zone1ShowAndTell';
import Zone2InnovationHub from './Zone2InnovationHub';
import Zone3RoboticsArena from './Zone3RoboticsArena';
import CameraSystem from './CameraSystem';
import MilkyWaySky from './MilkyWaySky';
import WebGLErrorBoundary from './WebGLErrorBoundary';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { Loader2, AlertTriangle, RefreshCw, LayoutGrid, Zap } from 'lucide-react';

function CanvasLoader() {
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';
  return (
    <div
      data-testid="canvas-loader"
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md transition-colors ${
        isLight ? 'bg-slate-100/90 text-slate-800' : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        <Loader2 className="w-5 h-5 text-amber-500 animate-pulse absolute" />
      </div>
      <p className="mt-4 text-xs font-mono tracking-widest text-amber-600 dark:text-amber-300 uppercase font-bold">
        Rendering Clean Floor Plan...
      </p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
        DPS Indirapuram Tech &amp; Innovation
      </p>
    </div>
  );
}

function SceneSetup() {
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';
  return <color attach="background" args={[isLight ? '#f1f5f9' : '#060913']} />;
}

/**
 * Dynamic FPS Monitor & Battery-Saver Downgrade
 * Detects sustained low frame rate (<25 FPS for >3s) and automatically disables
 * dynamic shadows/point lights while offering a quick toggle to the 2D view.
 */
function DynamicFpsMonitor() {
  const isLowPerformanceMode = useExhibitionStore((state) => state.isLowPerformanceMode);
  const setLowPerformanceMode = useExhibitionStore((state) => state.setLowPerformanceMode);

  const frameCountRef = useRef(0);
  const elapsedRef = useRef(0);
  const lowFpsDurationRef = useRef(0);

  useFrame((_, delta) => {
    if (isLowPerformanceMode) return;

    // Ignore tab-switch spikes where delta > 0.5s
    if (delta > 0.5) return;

    frameCountRef.current += 1;
    elapsedRef.current += delta;

    // Sample average FPS every 1.0 second window
    if (elapsedRef.current >= 1.0) {
      const avgFps = frameCountRef.current / elapsedRef.current;
      if (avgFps < 25) {
        lowFpsDurationRef.current += elapsedRef.current;
        if (lowFpsDurationRef.current >= 3.0) {
          setLowPerformanceMode(true);
        }
      } else {
        lowFpsDurationRef.current = 0;
      }
      frameCountRef.current = 0;
      elapsedRef.current = 0;
    }
  });

  return null;
}

export default function ExhibitionCanvas() {
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const isMobile = useExhibitionStore((state) => state.isMobile);
  const isLowPerformanceMode = useExhibitionStore((state) => state.isLowPerformanceMode);
  const setViewMode = useExhibitionStore((state) => state.setViewMode);
  const setWebglFallbackNotice = useExhibitionStore((state) => state.setWebglFallbackNotice);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  const [isContextLost, setIsContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [dismissedPerfBanner, setDismissedPerfBanner] = useState(false);
  const cleanupListenersRef = useRef<(() => void) | null>(null);

  // Pre-flight WebGL support check (detects disabled WebGL or headless context failures cleanly)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl =
        probeCanvas.getContext('webgl2') ||
        probeCanvas.getContext('webgl') ||
        probeCanvas.getContext('experimental-webgl');
      if (!gl) {
        const notice =
          '3D hardware acceleration is unavailable on this device or browser (THREE.WebGLRenderer: A WebGL context could not be created). Automatically switched to the 2D Floor Plan Directory.';
        setWebglFallbackNotice(notice);
        setViewMode('2d');
      } else {
        const loseExt = (gl as WebGLRenderingContext).getExtension?.('WEBGL_lose_context');
        loseExt?.loseContext();
      }
    } catch {
      const notice =
        '3D hardware acceleration is unavailable on this device or browser (THREE.WebGLRenderer: A WebGL context could not be created). Automatically switched to the 2D Floor Plan Directory.';
      setWebglFallbackNotice(notice);
      setViewMode('2d');
    }

    return () => {
      if (cleanupListenersRef.current) {
        cleanupListenersRef.current();
      }
    };
  }, [setViewMode, setWebglFallbackNotice]);

  const handleCanvasCreated = useCallback(
    ({ gl }: { gl: { domElement: HTMLCanvasElement } }) => {
      if (cleanupListenersRef.current) {
        cleanupListenersRef.current();
      }

      const canvasEl = gl.domElement;

      const onContextLost = (event: Event) => {
        event.preventDefault();
        console.warn('[ExhibitionCanvas] WebGL context lost. Waiting for restoration...');
        setIsContextLost(true);
      };

      const onContextRestored = () => {
        console.info('[ExhibitionCanvas] WebGL context restored.');
        setIsContextLost(false);
      };

      canvasEl.addEventListener('webglcontextlost', onContextLost, false);
      canvasEl.addEventListener('webglcontextrestored', onContextRestored, false);

      cleanupListenersRef.current = () => {
        canvasEl.removeEventListener('webglcontextlost', onContextLost, false);
        canvasEl.removeEventListener('webglcontextrestored', onContextRestored, false);
      };
    },
    []
  );

  const handleManualRestore = useCallback(() => {
    setIsContextLost(false);
    setCanvasKey((prev) => prev + 1);
  }, []);

  return (
    <div
      data-testid="exhibition-canvas-wrapper"
      className={`expo-canvas relative isolate w-full h-[100dvh] select-none touch-none transition-colors duration-500 ${
        isLight ? 'bg-[#f1f5f9]' : 'bg-[#060913]'
      }`}
    >
      <WebGLErrorBoundary>
        <Suspense fallback={<CanvasLoader />}>
          <Canvas
            key={canvasKey}
            shadows={!isMobile && !isLowPerformanceMode}
            camera={{
              position: isMobile ? [0.8, 10.5, 23.5] : [0.8, 7.5, 18.5],
              fov: isMobile ? 46 : 42,
              near: 0.6,
              far: 700,
            }}
            dpr={isLowPerformanceMode ? [1, 1] : isMobile ? [1, 1.25] : [1, 1.5]}
            gl={{
              powerPreference: 'high-performance',
              antialias: !isMobile && !isLowPerformanceMode,
              alpha: false,
              stencil: false,
              depth: true,
            }}
            onCreated={handleCanvasCreated}
            onPointerMissed={() => {
              selectProject(null);
            }}
          >
            {/* Dynamic FPS & Battery-Saver Monitor */}
            <DynamicFpsMonitor />

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
          </Canvas>
        </Suspense>
      </WebGLErrorBoundary>

      {/* WebGL Context Lost Recovery Overlay */}
      {isContextLost && (
        <div
          role="alert"
          data-testid="webgl-context-lost-banner"
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg"
        >
          <div className="max-w-md w-full p-6 rounded-3xl border border-amber-500/40 bg-slate-900 text-white shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold tracking-tight">
                3D Graphics Context Paused
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your device paused the WebGL 3D hardware context to conserve memory. You can restore the 3D scene immediately or switch to the 2D Floor Plan Grid.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleManualRestore}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restore 3D Scene</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch to 2D View</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Battery-Saver / Low FPS Downgrade Suggestion Toast */}
      {isLowPerformanceMode && !dismissedPerfBanner && !isContextLost && (
        <div
          role="status"
          data-testid="low-fps-banner"
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] px-4 py-2.5 rounded-2xl border backdrop-blur-xl shadow-xl flex items-center justify-between gap-3 text-xs transition-all ${
            isLight
              ? 'bg-white/95 border-amber-400/60 text-slate-800'
              : 'bg-slate-900/95 border-amber-500/40 text-slate-100'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate font-medium">
              Battery-Saver active (shadows reduced). Prefer 2D grid?
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-[11px] transition-colors"
            >
              2D Grid
            </button>
            <button
              type="button"
              onClick={() => setDismissedPerfBanner(true)}
              className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px]"
              aria-label="Dismiss performance notice"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
