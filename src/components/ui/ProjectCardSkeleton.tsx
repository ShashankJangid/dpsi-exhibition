'use client';

import React from 'react';

export default function ProjectCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="rounded-2xl border border-slate-200/80 dark:border-[#21262d] bg-white/70 dark:bg-[#0d1117] overflow-hidden flex flex-col justify-between shadow-xs animate-pulse"
        >
          <div>
            {/* Image Placeholder */}
            <div className="relative w-full h-36 bg-slate-200 dark:bg-slate-800/80">
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <div className="w-12 h-5 rounded-md bg-slate-300 dark:bg-slate-700/80" />
                <div className="w-16 h-5 rounded-md bg-slate-300 dark:bg-slate-700/80" />
              </div>
              <div className="absolute top-2.5 right-2.5 w-14 h-5 rounded-md bg-slate-300 dark:bg-slate-700/80" />
            </div>

            {/* Content Details */}
            <div className="p-4 space-y-3">
              <div className="space-y-1.5">
                <div className="h-5 w-4/5 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="h-3.5 w-1/2 rounded-md bg-slate-100 dark:bg-slate-800/60" />
              </div>

              {/* Members */}
              <div className="h-3 w-2/3 rounded-md bg-slate-100 dark:bg-slate-800/50" />

              {/* Description */}
              <div className="space-y-1 pt-1">
                <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-850" />
                <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-850" />
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1 pt-2">
                <div className="w-12 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="w-16 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="w-10 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-slate-100 dark:border-[#21262d] flex items-center justify-between">
            <div className="w-16 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-850" />
              <div className="w-16 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
