import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center border border-slate-200">
          <Image
            src="/dps_shield.png"
            alt="DPS Indirapuram Emblem"
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
          404 • Coordinate Out of Bounds
        </span>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans uppercase">
          Exhibition Coordinate Not Found
        </h1>

        <p className="mt-3 text-xs sm:text-sm font-mono text-slate-400 leading-relaxed max-w-md mx-auto">
          The booth, pass, or exhibition sector you are attempting to locate does not exist on the DPS Indirapuram 2026 floor blueprint.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs font-bold">
          <Link
            href="/expo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Launch 3D Floor Plan</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Summit Home</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-center gap-2">
          <span>Delhi Public School Indirapuram</span>
          <span>•</span>
          <span>Tech &amp; Innovation Expo 2026</span>
        </div>
      </div>
    </main>
  );
}
