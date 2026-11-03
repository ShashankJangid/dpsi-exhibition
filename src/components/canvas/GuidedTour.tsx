'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useExhibitionStore, TOUR_STOPS } from '@/store/useExhibitionStore';
import { playWhoosh, playBlip, playClick } from '@/lib/sound';
import { Play, Pause, ChevronRight, ChevronLeft, X, Compass, Volume2 } from 'lucide-react';

export default function GuidedTour() {
  const isTourActive = useExhibitionStore((state) => state.isTourActive);
  const tourStepIndex = useExhibitionStore((state) => state.tourStepIndex);
  const stopTour = useExhibitionStore((state) => state.stopTour);
  const nextTourStep = useExhibitionStore((state) => state.nextTourStep);
  const prevTourStep = useExhibitionStore((state) => state.prevTourStep);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStop = TOUR_STOPS[tourStepIndex] || TOUR_STOPS[0];

  useEffect(() => {
    if (!isTourActive) {
      setProgress(0);
      return;
    }

    playWhoosh();
    setProgress(0);

    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = 100;
    const totalSteps = currentStop.durationMs / intervalTime;
    let currentStep = 0;

    timerRef.current = setInterval(() => {
      currentStep += 1;
      const pct = Math.min(100, (currentStep / totalSteps) * 100);
      setProgress(pct);

      if (currentStep >= totalSteps) {
        clearInterval(timerRef.current!);
        nextTourStep();
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTourActive, tourStepIndex, isPaused, currentStop.durationMs, nextTourStep]);

  if (!isTourActive) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 md:bottom-8 z-50 pointer-events-auto flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl backdrop-blur-2xl p-4 sm:p-5 transition-colors ${
          isLight
            ? 'bg-white/95 border-amber-500/40 text-slate-900 shadow-amber-500/10'
            : 'bg-[#080d1a]/95 border-amber-500/40 text-white shadow-black/90'
        }`}
      >
        {/* Top Header Row: Badge, Step Counter, Exit Button */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>3D GUIDED TOUR</span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
              Stop {tourStepIndex + 1} of {TOUR_STOPS.length}
            </span>
          </div>

          <button
            onClick={() => {
              playClick();
              stopTour();
            }}
            className={`p-1.5 rounded-xl border transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-rose-50 border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600'
                : 'bg-slate-900 hover:bg-rose-950/40 border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300'
            }`}
            title="Exit Guided Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Section: Stop Title & Subtitle */}
        <div className="mb-3">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{currentStop.title}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
            {currentStop.subtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bottom Control Bar: Prev, Play/Pause, Next */}
        <div className="flex items-center justify-between gap-2">
          {/* Progress indicators dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STOPS.map((stop, idx) => (
              <button
                key={stop.id}
                onClick={() => {
                  playBlip();
                  useExhibitionStore.setState({
                    tourStepIndex: idx,
                    activeZone: stop.zone,
                    cameraConfig: stop.camera,
                  });
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === tourStepIndex
                    ? 'w-6 bg-amber-500'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-amber-400/60'
                }`}
                title={`Jump to ${stop.title}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playBlip();
                prevTourStep();
              }}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="Previous Stop"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                playClick();
                setIsPaused(!isPaused);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isPaused
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={() => {
                playBlip();
                nextTourStep();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              title="Next Stop"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
