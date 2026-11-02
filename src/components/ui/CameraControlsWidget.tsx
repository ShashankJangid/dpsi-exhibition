'use client';

import { useExhibitionStore } from '@/store/useExhibitionStore';
import { ZoomIn, ZoomOut, RotateCcw, Compass, Map } from 'lucide-react';

export default function CameraControlsWidget() {
  const viewMode = useExhibitionStore((state) => state.viewMode);
  const zoomIn = useExhibitionStore((state) => state.zoomIn);
  const zoomOut = useExhibitionStore((state) => state.zoomOut);
  const resetToOverview = useExhibitionStore((state) => state.resetToOverview);
  const activeZone = useExhibitionStore((state) => state.activeZone);
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const isDrawerOpen = useExhibitionStore((state) => state.isDrawerOpen);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  if (viewMode !== '3d' || isDrawerOpen) return null;

  const isBlueprint = activeZone === 'blueprint';

  return (
    <div className={`fixed bottom-28 right-3.5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-center gap-1.5 p-1.5 rounded-2xl backdrop-blur-xl border transition-colors duration-300 shadow-2xl pointer-events-auto ${
      isLight
        ? 'bg-white/90 border-slate-200 shadow-slate-300/40 text-slate-800'
        : 'bg-[#090e1a]/85 border-slate-700/60 shadow-black/80 text-white'
    }`}>
      {/* Blueprint Top-Down Floor Plan Toggle */}
      <button
        onClick={() => setActiveZone(isBlueprint ? 'overview' : 'blueprint')}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 border ${
          isBlueprint
            ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/40'
            : isLight
            ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
            : 'bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border-blue-700/50'
        }`}
        title={isBlueprint ? "Switch to 3D Perspective" : "Top-Down Blueprint Floor Plan"}
        aria-label="Blueprint Floor Plan View"
      >
        {isBlueprint ? <Compass className="w-4 h-4" /> : <Map className="w-4 h-4" />}
      </button>

      <div className={`w-5 h-px my-0.5 ${isLight ? 'bg-slate-200' : 'bg-slate-700/60'}`} />

      {/* Zoom In Button */}
      <button
        onClick={zoomIn}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
          isLight
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950'
            : 'bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white'
        }`}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={zoomOut}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
          isLight
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950'
            : 'bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white'
        }`}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className={`w-5 h-px my-0.5 ${isLight ? 'bg-slate-200' : 'bg-slate-700/60'}`} />

      {/* Reset Overview Camera */}
      <button
        onClick={resetToOverview}
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${
          isLight
            ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-800'
            : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300'
        }`}
        title="Reset to Full Floor Overview"
        aria-label="Reset Overview"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}
