'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Vote,
  Sun,
  Moon,
} from 'lucide-react';
import { SEED_PROJECTS } from '@/data/seedProjects';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import ProjectDetailDrawer from '@/components/ui/ProjectDetailDrawer';
import AuthModal from '@/components/ui/AuthModal';
import { subscribeToProjects, onFirebaseAuthStateChange } from '@/lib/firebase';
import { getDeviceFingerprint } from '@/lib/fingerprint';

// React Bits Components loaded dynamically for SSR safety
const GradientASCII = dynamic(() => import('@/components/reactbits/GradientASCII'), {
  ssr: false,
});

const TechText = dynamic(() => import('@/components/reactbits/TechText'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[300px]">
      <span className="text-4xl md:text-6xl font-black tracking-widest text-[#2a75d3] font-mono">
        DPSI TECH EXPO
      </span>
    </div>
  ),
});

const BellToggle = dynamic(() => import('@/components/reactbits/BellToggle'), {
  ssr: false,
});

const TextLoop = dynamic(() => import('@/components/reactbits/TextLoop'), {
  ssr: false,
});

export default function LandingPage() {
  const theme = useExhibitionStore((state) => state.theme);
  const toggleTheme = useExhibitionStore((state) => state.toggleTheme);
  const isLight = theme === 'light';
  const isMobile = useExhibitionStore((state) => state.isMobile);
  const setIsMobile = useExhibitionStore((state) => state.setIsMobile);
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const storeProjects = useExhibitionStore((state) => state.projects);
  const setProjects = useExhibitionStore((state) => state.setProjects);
  const setUser = useExhibitionStore((state) => state.setUser);
  const setDeviceFingerprint = useExhibitionStore((state) => state.setDeviceFingerprint);

  const [selectedZone, setSelectedZone] = useState<'all' | 'Physical' | 'Digital' | 'Business'>('all');
  const [selectedDay, setSelectedDay] = useState<'day1' | 'day2'>('day1');
  const [email, setEmail] = useState('');
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    getDeviceFingerprint().then((fp) => {
      setDeviceFingerprint(fp);
    });

    const unsubAuth = onFirebaseAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || 'user@dpsi.in',
          name: firebaseUser.displayName || 'Visitor',
        });
      } else {
        setUser(null);
      }
    });

    const unsubProjects = subscribeToProjects((liveProjects) => {
      if (liveProjects && liveProjects.length > 0) {
        setProjects(liveProjects);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubAuth();
      unsubProjects();
    };
  }, [setIsMobile, setDeviceFingerprint, setUser, setProjects]);

  const allProjects = storeProjects.length > 0 ? storeProjects : SEED_PROJECTS;
  const filteredProjects = allProjects.filter((p) => {
    if (selectedZone === 'all') return true;
    return p.category === selectedZone;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setRegistered(true);
      setTimeout(() => setRegistered(false), 5000);
      setEmail('');
    }
  };

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen bg-transparent transition-colors duration-300 font-sans selection:bg-[#2ea043] selection:text-black overflow-x-clip ${
        isLight ? 'text-slate-900' : 'text-[#f0f6fc]'
      }`}
    >
      {/* ─── GITHUB UNIVERSE TOP ANNOUNCEMENT TICKER ─── */}
      <div className={`w-full border-b px-4 py-2 flex items-center justify-between text-[11px] font-mono transition-colors duration-300 ${
        isLight
          ? 'bg-[#dfe3e8]/90 border-slate-300/80 backdrop-blur-md text-slate-700'
          : 'bg-[#0d1117] border-[#21262d] text-[#8b949e]'
      }`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
            <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-[#f0f6fc]'}`}>
              ANNUAL TECH &amp; INNOVATION SUMMIT 2026
            </span>
            <span className={`hidden sm:inline ${isLight ? 'text-slate-500' : 'text-[#8b949e]'}`}>
              {'// NOVEMBER 14–15 • MAIN AUDITORIUM'}
            </span>
          </div>
          <Link
            href="/expo"
            className={`flex items-center gap-1 font-semibold hover:underline ${
              isLight ? 'text-blue-600 hover:text-blue-700' : 'text-[#58a6ff] hover:text-[#79c0ff]'
            }`}
          >
            <span>Launch 3D Exhibition</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── GITHUB UNIVERSE GRID NAVBAR ─── */}
      <header className={`sticky top-0 z-50 w-full backdrop-blur-md border-b transition-colors duration-300 ${
        isLight
          ? 'bg-[#dfe3e8]/90 border-slate-300/80 shadow-xs'
          : 'bg-[#000000]/95 border-[#30363d]'
      }`}>
        <div className="max-w-7xl mx-auto flex items-stretch h-14">
          {/* Brand Cell */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 border-r transition-colors shrink-0 ${
              isLight
                ? 'border-slate-200/80 hover:bg-slate-200/50'
                : 'border-[#30363d] hover:bg-[#161b22]'
            }`}
          >
            <div className="h-8 px-2 py-0.5 rounded bg-white flex items-center justify-center border border-slate-200 shadow-xs">
              <img src="/dps_shield.png" alt="DPS Indirapuram" className="h-full w-auto object-contain" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className={`text-[12px] font-black tracking-tight uppercase font-mono ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}>
                DPSI EXPO &apos;26
              </span>
              <span className={`text-[9px] font-mono tracking-widest ${
                isLight ? 'text-slate-500' : 'text-[#8b949e]'
              }`}>
                INDIRAPURAM
              </span>
            </div>
          </Link>

          {/* Navigation Cells */}
          <nav className="hidden lg:flex items-stretch text-xs font-mono">
            {[
              { href: '#stage', label: '[ 01 // STAGE ]' },
              { href: '#projects', label: '[ 02 // 35 INVENTIONS ]' },
              { href: '#arenas', label: '[ 03 // 3 ARENAS ]' },
              { href: '#voting', label: '[ 04 // ANTI-CHEAT BALLOT ]' },
              { href: '#schedule', label: '[ 05 // ITINERARY ]' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 border-r transition-colors ${
                  isLight
                    ? 'border-slate-200/80 text-slate-700 hover:text-slate-900 hover:bg-slate-200/50'
                    : 'border-[#30363d] text-[#c9d1d9] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action: Launch 3D Hall & Theme Toggle */}
          <div className="ml-auto flex items-stretch">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3.5 border-r font-mono text-xs transition-colors ${
                isLight
                  ? 'border-slate-200/80 hover:bg-slate-200/50 text-amber-600'
                  : 'border-[#30363d] hover:bg-[#161b22] text-amber-400'
              }`}
              title="Toggle Light / Dark Mode"
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="hidden sm:inline font-bold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline font-bold">Dark</span>
                </>
              )}
            </button>

            <Link
              href="/expo"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-mono font-black text-[11px] sm:text-xs uppercase tracking-wider transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enter 3D Hall ↗</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── GITHUB UNIVERSE STYLE HERO SECTION ─── */}
      <section className={`border-b transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-transparent' : 'border-[#30363d] bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Giant UNIVERSE-Style Headline */}
          <div className={`px-4 sm:px-8 pt-8 sm:pt-10 pb-5 sm:pb-6 border-b ${
            isLight ? 'border-slate-200/80' : 'border-[#30363d]'
          }`}>
            <div className={`flex items-center justify-between font-mono text-[11px] sm:text-xs mb-3 ${
              isLight ? 'text-slate-500' : 'text-[#8b949e]'
            }`}>
              <span className="flex items-center gap-2 text-[#3fb950]">
                <span>november 14–15_2026{"}"}</span>
                <span className="inline-block w-2.5 h-2.5 bg-[#3fb950]" />
              </span>
              <span className="hidden sm:inline">
                in-person &amp; 3d-hall % |35-booths
              </span>
            </div>

            {/* Massive Conference Title with Neon Block Accent */}
            <div className="flex items-start justify-between gap-4">
              <h1 className={`text-4xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase font-sans leading-none ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}>
                EXPO&apos;26<span className="inline-block w-5 h-5 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#2ea043] ml-1.5 sm:ml-2 -mb-1 align-baseline" /><span className="inline-block w-5 h-5 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#db61a2] -mb-1 align-baseline" />
              </h1>
            </div>
          </div>

          {/* Element 2: <TechText /> */}
          <div id="stage" className={`relative border-b transition-colors overflow-hidden ${
            isLight
              ? 'border-slate-200/80 bg-white/30 backdrop-blur-[2px]'
              : 'border-[#30363d] bg-[#050811]/40'
          }`}>
            {/* Engineering Blueprint Background Grid */}
            <div
              className={`absolute inset-0 pointer-events-none ${
                isLight
                  ? 'bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:32px_32px]'
                  : 'bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]'
              }`}
            />

            {/* Technical Sub-Header with Telemetry */}
            <div className={`relative z-10 px-4 py-2 border-b flex items-center justify-between text-[10px] sm:text-[11px] font-mono ${
              isLight ? 'border-slate-200/80 text-slate-600' : 'border-[#21262d] text-[#8b949e]'
            }`}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <span className="truncate">{'[ ELEMENT 02 ] :: INTERACTIVE PHYSICS WORDMARK'}</span>
              </div>
              <span className="hidden md:inline text-[10px] text-slate-400 font-mono tracking-widest">
                COORDINATES: 28.6479° N, 77.3764° E // AUDITORIUM MAIN
              </span>
              <span className={`shrink-0 ${isLight ? 'text-blue-600 font-semibold' : 'text-[#58a6ff]'}`}>
                SPRING DYNAMICS
              </span>
            </div>

            {/* Canvas Container with Balanced Proportions */}
            <div className="relative z-10" style={{ width: '100%', height: isMobile ? '150px' : '190px' }}>
              {/* Corner Blueprint Crosshairs */}
              <span className="absolute top-2 left-3 text-[10px] font-mono text-slate-400 select-none pointer-events-none">＋</span>
              <span className="absolute top-2 right-3 text-[10px] font-mono text-slate-400 select-none pointer-events-none">＋</span>
              <span className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400 select-none pointer-events-none">＋</span>
              <span className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400 select-none pointer-events-none">＋</span>

              <TechText
                text="DPSI TECH EXPO"
                color={isLight ? '#1d4ed8' : '#38bdf8'}
                accentColor={isLight ? '#3b82f6' : '#60a5fa'}
                fontFamily='"Space Grotesk", sans-serif'
                fontSize={isMobile ? 36 : 74}
                fontWeight={800}
                letterSpacing={0}
                guides={true}
                specks={isMobile ? 8 : 16}
                reach={isMobile ? 120 : 180}
                bounce={0.4}
              />
            </div>

            {/* Blueprint Micro-instruction Footer */}
            <div className={`relative z-10 px-4 py-1.5 border-t flex items-center justify-between text-[10px] font-mono ${
              isLight ? 'border-slate-200/60 bg-slate-100/50 text-slate-500' : 'border-[#21262d] bg-[#0d1117]/50 text-[#8b949e]'
            }`}>
              <span>{'// INTERACTION GUIDE: DRAG CHARACTERS • HOVER TO DISASSEMBLE VECTORS'}</span>
              <span className="hidden sm:inline">{'PHYSICS ENGINE: VERLET-SPRING'}</span>
            </div>
          </div>

          {/* GitHub Universe 2-Column Bento Split */}
          <div className={`grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x ${
            isLight ? 'divide-slate-200/80' : 'divide-[#30363d]'
          }`}>
            {/* Left Column: Terminal Slug & Categories */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between bg-transparent">
              <div>
                <span className={`text-xs font-mono uppercase tracking-widest block mb-2 ${
                  isLight ? 'text-slate-500' : 'text-[#8b949e]'
                }`}>
                  {'// THE SUMMIT ARCHITECTURE'}
                </span>
                <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${
                  isLight ? 'text-slate-800' : 'text-white'
                }`}>
                  innovate-build-deploy/
                </h2>
                <p className={`mt-4 text-sm leading-relaxed font-mono ${
                  isLight ? 'text-slate-600' : 'text-[#8b949e]'
                }`}>
                  35 student research teams across Physical Computing, Artificial Intelligence,
                  Sustainable Enterprise, and Combat Robotics.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 font-mono text-xs">
                <div className={`p-3 border rounded transition-colors ${
                  isLight ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs' : 'border-[#21262d] bg-[#0d1117]'
                }`}>
                  <span className="text-[#3fb950] font-bold block">[ 12 BOOTHS ]</span>
                  <span className={`mt-1 block ${isLight ? 'text-slate-800 font-semibold' : 'text-white'}`}>
                    Physical Computing (P)
                  </span>
                </div>
                <div className={`p-3 border rounded transition-colors ${
                  isLight ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs' : 'border-[#21262d] bg-[#0d1117]'
                }`}>
                  <span className="text-[#58a6ff] font-bold block">[ 12 BOOTHS ]</span>
                  <span className={`mt-1 block ${isLight ? 'text-slate-800 font-semibold' : 'text-white'}`}>
                    Digital &amp; AI Software (D)
                  </span>
                </div>
                <div className={`p-3 border rounded transition-colors ${
                  isLight ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs' : 'border-[#21262d] bg-[#0d1117]'
                }`}>
                  <span className="text-[#d2a8ff] font-bold block">[ 07 BOOTHS ]</span>
                  <span className={`mt-1 block ${isLight ? 'text-slate-800 font-semibold' : 'text-white'}`}>
                    Business Ventures (B)
                  </span>
                </div>
                <div className={`p-3 border rounded transition-colors ${
                  isLight ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs' : 'border-[#21262d] bg-[#0d1117]'
                }`}>
                  <span className="text-[#f0883e] font-bold block">[ 04 HEATS ]</span>
                  <span className={`mt-1 block ${isLight ? 'text-slate-800 font-semibold' : 'text-white'}`}>
                    Robotics Battle Arena
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Mission statement and Primary Action */}
            <div className={`lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between ${
              isLight ? 'bg-white/30 backdrop-blur-[2px]' : 'bg-[#040711]/60'
            }`}>
              <div>
                <span className={`text-xs font-mono uppercase tracking-widest block mb-2 ${
                  isLight ? 'text-slate-500' : 'text-[#8b949e]'
                }`}>
                  {'// PURPOSE & INVITATION'}
                </span>
                <p className={`text-base sm:text-lg leading-relaxed font-sans ${
                  isLight ? 'text-slate-800' : 'text-[#c9d1d9]'
                }`}>
                  From deep-learning soil fertility scanners to hardware ADAS driver assistance and
                  autonomous maze rovers, experience the next generation of engineers delivering live at
                  Delhi Public School Indirapuram.
                </p>
                <p className={`mt-3 text-xs sm:text-sm font-mono ${
                  isLight ? 'text-slate-600' : 'text-[#8b949e]'
                }`}>
                  Inspect blueprints in 3D WebGL, evaluate technical schematics, and submit your verified
                  ballot through our multi-factor anti-cheat voting portal.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/expo"
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch 3D Hall ({isLight ? 'Light Showroom' : 'Cosmic Dark'})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#projects"
                  className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-4 border font-mono font-bold text-xs uppercase tracking-wider transition-all ${
                    isLight
                      ? 'bg-[#eef2f6]/95 hover:bg-[#e2e8f0] border-slate-300 text-slate-900 shadow-xs'
                      : 'bg-[#161b22] hover:bg-[#21262d] border-[#30363d] text-white'
                  }`}
                >
                  <span>Browse 35 Projects [ ⌘K ]</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ELEMENT 5: <TextLoop /> ─── */}
      <section className={`border-b transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-white/35 backdrop-blur-sm' : 'border-[#30363d] bg-[#040711]'
      }`}>
        <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono max-w-7xl mx-auto ${
          isLight ? 'border-slate-200 text-slate-600' : 'border-[#21262d] text-[#8b949e]'
        }`}>
          <span>{'[ ELEMENT 05 ] :: SVG CURVED LOOP RIBBON'}</span>
          <span className="text-[#a855f7] font-semibold">LIVE STREAM MARQUEE</span>
        </div>
        <div className="py-2 overflow-hidden">
          <TextLoop
            text="DPSI TECH & INNOVATION EXPO 2026 ✦ 35 STUDENT INVENTIONS ✦ PHYSICAL PROTOTYPES ✦ AI & COMPUTER VISION ✦ BUSINESS SUSTAINABILITY ✦ COMBAT ROBOTICS ✦ ANTI-CHEAT COMMUNITY BALLOT"
            shape="wave"
            speed={90}
            direction="forward"
            separator="✦"
            curviness={90}
            tilt={0}
            fontSize={isMobile ? 26 : 46}
            fontWeight={800}
            letterSpacing={2}
            uppercase
            ribbon
            ribbonColor={isLight ? '#4338ca' : '#5227FF'}
            ribbonWidth={isMobile ? 54 : 86}
            edgeFade={0}
            cross={false}
            crossAngle={16}
            draggable={false}
            scrollBoost={0}
            outline={false}
            pauseOnHover
          />
        </div>
      </section>

      {/* ─── ELEMENT 1: <GradientASCII /> ─── */}
      <section className={`relative overflow-hidden transition-colors duration-300 ${isLight ? 'bg-transparent' : 'bg-[#000000]'}`}>
        <div className="max-w-7xl mx-auto">
          <div
            style={{
              width: '100%',
              height: isMobile ? '380px' : '600px',
              position: 'relative',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)'
            }}
          >
            <GradientASCII
              colors={
                isLight
                  ? ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd']
                  : ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8']
              }
              shape="horizon"
              characters=" =+xX0S8#@"
              cellSize={isMobile ? 14 : 18}
              density={isMobile ? 0.65 : 0.8}
              softness={0.7}
              gradientOpacity={0.85}
              lightMode={isLight}
            />

            {/* Seamless Top Gradient dissolve into background */}
            <div className={`absolute inset-x-0 top-0 h-24 pointer-events-none z-10 bg-gradient-to-t ${
              isLight
                ? 'from-transparent to-[#dfe3e8]'
                : 'from-transparent to-[#000000]'
            }`} />

            {/* Seamless Bottom Gradient dissolve into background */}
            <div className={`absolute inset-x-0 bottom-0 h-48 pointer-events-none z-10 bg-gradient-to-b ${
              isLight
                ? 'from-transparent via-[#dfe3e8]/70 to-[#dfe3e8]'
                : 'from-transparent via-[#000000]/60 to-[#000000]'
            }`} />

            {/* GitHub Universe Terminal Overlay in Center */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
              <span className={`px-3 py-1 rounded font-mono text-xs mb-4 backdrop-blur-sm ${
                isLight
                  ? 'bg-white/80 border border-slate-300/80 text-blue-700 shadow-xs'
                  : 'bg-black/80 border border-slate-700 text-[#38bdf8]'
              }`}>
                {'STAGE_A // COMPUTATIONAL ASCII CANVAS'}
              </span>
              <h2 className={`text-3xl sm:text-5xl font-black font-sans uppercase tracking-tight max-w-2xl ${
                isLight ? 'text-slate-800 drop-shadow-xs' : 'text-white drop-shadow-md'
              }`}>
                Where Young Visionaries Shape Tomorrow
              </h2>
              <p className={`mt-3 text-xs sm:text-sm font-mono max-w-lg ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}>
                Move your cursor to warp the ASCII matrix field. Real-time dual-pass fragment shader
                computing character density.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GITHUB UNIVERSE STYLE 35 INVENTIONS DIRECTORY ─── */}
      <section id="projects" className={`border-b pt-6 pb-12 transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-transparent' : 'border-[#30363d] bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b ${
            isLight ? 'border-slate-200/80' : 'border-[#30363d]'
          }`}>
            <div>
              <span className="text-xs font-mono text-[#3fb950] font-bold block mb-1">
                {'// COMPETING BOOTHS DIRECTORY'}
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black uppercase font-sans tracking-tight ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}>
                All 35 Inventions
              </h2>
            </div>

            {/* Filter Cells */}
            <div className={`flex items-center border rounded text-xs font-mono p-0.5 overflow-x-auto max-w-full ${
              isLight ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs' : 'border-[#30363d] bg-[#0d1117]'
            }`}>
              {(['all', 'Physical', 'Digital', 'Business'] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setSelectedZone(z)}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    selectedZone === z
                      ? 'bg-[#238636] text-white font-bold shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  {z === 'all' ? 'All (35)' : z}
                </button>
              ))}
            </div>
          </div>

          {/* High-Density Session Cards Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => selectProject(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectProject(p);
                  }
                }}
                className={`p-5 border rounded-xl transition-all flex flex-col justify-between group cursor-pointer hover:-translate-y-1 ${
                  isLight
                    ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs hover:shadow-md hover:border-blue-400 hover:bg-[#e2e8f0]'
                    : 'border-[#30363d] bg-[#0d1117] hover:border-[#58a6ff] hover:shadow-xl hover:bg-[#161b22]/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-xs mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded font-bold border ${
                        isLight
                          ? 'bg-amber-50/80 border-amber-200 text-amber-700'
                          : 'bg-[#161b22] border-[#30363d] text-[#f0883e]'
                      }`}>
                        {p.booth_code}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-600'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400'
                      }`}>
                        {p.category}
                      </span>
                    </div>
                    <span className="text-[#3fb950] font-bold flex items-center gap-1 font-mono">
                      <Vote className="w-3.5 h-3.5" />
                      <span>{p.vote_count} votes</span>
                    </span>
                  </div>

                  <h3 className={`text-base font-bold transition-colors line-clamp-1 ${
                    isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-[#58a6ff]'
                  }`}>
                    {p.title.replace(/^.+•\s*/, '')}
                  </h3>
                  <p className={`mt-2 text-xs line-clamp-2 leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-[#8b949e]'
                  }`}>
                    {p.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1 font-mono text-[10px]">
                    {p.tech_stack?.slice(0, 3).map((tech, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 rounded border ${
                          isLight
                            ? 'bg-slate-100/80 text-slate-700 border-slate-200'
                            : 'bg-[#161b22] text-[#c9d1d9] border-[#21262d]'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`mt-6 pt-3 border-t flex items-center justify-between text-xs font-mono ${
                  isLight ? 'border-slate-100/90' : 'border-[#21262d]'
                }`}>
                  <span className={`truncate max-w-[140px] ${isLight ? 'text-slate-500' : 'text-[#8b949e]'}`}>
                    {p.members?.join(', ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold flex items-center gap-0.5 transition-colors ${
                      isLight
                        ? 'text-slate-500 group-hover:text-blue-600'
                        : 'text-slate-400 group-hover:text-[#58a6ff]'
                    }`}>
                      <span>Expand</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                    <Link
                      href="/expo"
                      onClick={(e) => e.stopPropagation()}
                      className={`flex items-center gap-1 font-bold transition-transform hover:scale-105 ${
                        isLight ? 'text-blue-600 hover:text-blue-700' : 'text-[#58a6ff] hover:text-[#79c0ff]'
                      }`}
                    >
                      <span>3D</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/expo"
              className={`inline-flex items-center gap-2 px-6 py-3 border font-mono text-xs font-bold uppercase transition-colors rounded ${
                isLight
                  ? 'bg-[#eef2f6]/95 hover:bg-[#e2e8f0] border-slate-300 text-slate-900 shadow-xs'
                  : 'bg-[#161b22] hover:bg-[#21262d] border-[#30363d] text-white'
              }`}
            >
              <span>Explore Full 3D Interactive Floor Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── THE THREE EXHIBITION ARENAS ─── */}
      <section id="arenas" className={`border-b py-12 transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-transparent' : 'border-[#30363d] bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className={`pb-6 border-b ${isLight ? 'border-slate-200/80' : 'border-[#30363d]'}`}>
            <span className="text-xs font-mono text-[#3fb950] font-bold block mb-1">
              {'// PHYSICAL BLUEPRINT'}
            </span>
            <h2 className={`text-3xl sm:text-4xl font-black uppercase font-sans tracking-tight ${
              isLight ? 'text-slate-800' : 'text-white'
            }`}>
              The Three Arenas
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Arena 1 */}
            <div className={`p-6 border rounded-lg flex flex-col justify-between ${
              isLight
                ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs hover:bg-[#e2e8f0]'
                : 'border-[#30363d] bg-[#0d1117]'
            }`}>
              <div>
                <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                  isLight ? 'bg-sky-50/80 border-sky-200 text-sky-700' : 'bg-[#161b22] border-[#30363d] text-[#38bdf8]'
                }`}>
                  {'ZONE_01 // ST01-ST08'}
                </span>
                <h3 className={`text-xl font-bold mt-3 font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Show &amp; Tell Prototypes
                </h3>
                <p className={`mt-2 text-xs leading-relaxed font-mono ${isLight ? 'text-slate-600' : 'text-[#8b949e]'}`}>
                  Hands-on working prototypes, renewable energy micro-harvesters, clean water filtration,
                  and bio-materials engineered by junior innovators.
                </p>
              </div>
              <div className={`mt-6 pt-4 border-t ${isLight ? 'border-slate-100/90' : 'border-[#21262d]'}`}>
                <Link
                  href="/expo"
                  className={`flex items-center gap-1.5 text-xs font-mono font-bold hover:underline ${
                    isLight ? 'text-blue-600' : 'text-[#58a6ff]'
                  }`}
                >
                  <span>Enter Zone 1 in 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Arena 2 */}
            <div className={`p-6 border rounded-lg flex flex-col justify-between ${
              isLight
                ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs hover:bg-[#e2e8f0]'
                : 'border-[#30363d] bg-[#0d1117]'
            }`}>
              <div>
                <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                  isLight ? 'bg-amber-50/80 border-amber-200 text-amber-700' : 'bg-[#161b22] border-[#30363d] text-[#f0883e]'
                }`}>
                  {'ZONE_02 // P, D & B PODS'}
                </span>
                <h3 className={`text-xl font-bold mt-3 font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  The Innovation Hub
                </h3>
                <p className={`mt-2 text-xs leading-relaxed font-mono ${isLight ? 'text-slate-600' : 'text-[#8b949e]'}`}>
                  The flagship hall housing Physical computing (P01-12), Digital AI algorithms (D01-12), and
                  sustainable Business enterprises (B01-07).
                </p>
              </div>
              <div className={`mt-6 pt-4 border-t ${isLight ? 'border-slate-100/90' : 'border-[#21262d]'}`}>
                <Link
                  href="/expo"
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#f0883e] hover:underline"
                >
                  <span>Enter Zone 2 in 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Arena 3 */}
            <div className={`p-6 border rounded-lg flex flex-col justify-between ${
              isLight
                ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs hover:bg-[#e2e8f0]'
                : 'border-[#30363d] bg-[#0d1117]'
            }`}>
              <div>
                <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                  isLight ? 'bg-pink-50/80 border-pink-200 text-pink-700' : 'bg-[#161b22] border-[#30363d] text-[#db61a2]'
                }`}>
                  {'ZONE_03 // BATTLE PITS'}
                </span>
                <h3 className={`text-xl font-bold mt-3 font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Robotics Arena &amp; Drone Pit
                </h3>
                <p className={`mt-2 text-xs leading-relaxed font-mono ${isLight ? 'text-slate-600' : 'text-[#8b949e]'}`}>
                  Autonomous obstacle-navigating rovers, maze solvers, combat battle-bots, and drone telemetry
                  stations battling in live heats.
                </p>
              </div>
              <div className={`mt-6 pt-4 border-t ${isLight ? 'border-slate-100/90' : 'border-[#21262d]'}`}>
                <Link
                  href="/expo"
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#db61a2] hover:underline"
                >
                  <span>Enter Zone 3 in 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GUARANTEED FAIR PLAY: ANTI-CHEAT VOTING ─── */}
      <section id="voting" className={`border-b py-12 transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-white/30 backdrop-blur-sm' : 'border-[#30363d] bg-[#040711]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-mono text-[#3fb950] font-bold block mb-1">
                {'// CRYPTOGRAPHIC INTEGRITY'}
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black uppercase font-sans tracking-tight ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}>
                Anti-Cheat Verified Voting
              </h2>
              <p className={`mt-3 text-sm font-mono leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-[#8b949e]'
              }`}>
                To safeguard the awards, our custom-engineered voting pipeline eliminates duplicate ballots
                and ballot-stuffing using hardware-accelerated device fingerprinting and Cloud Firestore
                atomic transactions.
              </p>

              <div className="mt-6 space-y-3 font-mono text-xs">
                <div className={`p-3 border rounded flex items-center justify-between ${
                  isLight ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md text-slate-900 shadow-xs' : 'border-[#21262d] bg-[#0d1117] text-white'
                }`}>
                  <span className="font-semibold">Multi-Factor Hardware Fingerprint</span>
                  <span className="text-[#3fb950] font-bold">[ ACTIVE ]</span>
                </div>
                <div className={`p-3 border rounded flex items-center justify-between ${
                  isLight ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md text-slate-900 shadow-xs' : 'border-[#21262d] bg-[#0d1117] text-white'
                }`}>
                  <span className="font-semibold">Weighted Ballots: Faculty (3x) • Community (1x)</span>
                  <span className="text-[#58a6ff] font-bold">[ VERIFIED ]</span>
                </div>
                <div className={`p-3 border rounded flex items-center justify-between ${
                  isLight ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md text-slate-900 shadow-xs' : 'border-[#21262d] bg-[#0d1117] text-white'
                }`}>
                  <span className="font-semibold">Live Leaderboard Real-Time Streaming</span>
                  <span className="text-[#d2a8ff] font-bold">[ SYNCED ]</span>
                </div>
              </div>
            </div>

            <div className={`lg:col-span-5 p-6 border rounded-md font-mono ${
              isLight ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs' : 'border-[#30363d] bg-[#0d1117]'
            }`}>
              <span className={`text-xs block mb-3 font-bold ${isLight ? 'text-slate-600' : 'text-[#8b949e]'}`}>
                {'// HOW TO CAST BALLOT'}
              </span>
              <ol className={`space-y-3 text-xs ${isLight ? 'text-slate-700' : 'text-[#c9d1d9]'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-[#3fb950] font-bold">01.</span>
                  <span>Enter the 3D floor plan and select any booth.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3fb950] font-bold">02.</span>
                  <span>Review the pitch deck, schematics, and live demo video.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3fb950] font-bold">03.</span>
                  <span>Click &quot;Cast Vote&quot; (authenticated via Google OAuth).</span>
                </li>
              </ol>

              <Link
                href="/expo"
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold uppercase transition-colors rounded shadow-xs"
              >
                <span>Go To Voting Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ELEMENT 3: <BellToggle /> IN VIP PASS & ALERTS ─── */}
      <section className={`border-b py-14 transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-[#f1f5f9]/50 backdrop-blur-sm' : 'border-[#30363d] bg-[#000000]'
      }`}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="text-xs font-mono text-[#3fb950] font-bold block mb-2">
            {'// ELEMENT 03 // REAL-TIME ALERTS'}
          </span>
          <h2 className={`text-2xl sm:text-4xl font-black uppercase font-sans tracking-tight ${
            isLight ? 'text-slate-800' : 'text-white'
          }`}>
            Live Round Notifications &amp; Digital Pass
          </h2>
          <p className={`mt-2 text-xs sm:text-sm font-mono ${isLight ? 'text-slate-600' : 'text-[#8b949e]'}`}>
            Toggle the notification bell below to enable audio chime alerts when round evaluations close.
          </p>

          {/* Element 3: <BellToggle /> in exact previous format */}
          <div className="flex justify-center my-6">
            <BellToggle
              offLabel="Notify me"
              onLabel="You'll be notified"
              color={isLight ? '#334155' : '#f5f5f5'}
              background={isLight ? '#e2e8f0' : '#27272a'}
              onColor="#ffffff"
              onBackground="#238636"
              size="md"
              count={3}
              onChange={(active: boolean) => console.log('active: ', active)}
            />
          </div>

          <form onSubmit={handleRegister} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto font-mono text-xs">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="visitor@dpsi.in"
              required
              className={`flex-1 px-4 py-3 border rounded focus:outline-none focus:border-blue-500 ${
                isLight
                  ? 'bg-[#eef2f6]/95 border-slate-300 text-slate-900 placeholder-slate-500 shadow-xs'
                  : 'bg-[#0d1117] border-[#30363d] text-white placeholder-[#8b949e]'
              }`}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white font-bold uppercase transition-colors rounded shadow-xs"
            >
              Get Entry Pass
            </button>
          </form>

          {registered && (
            <p className="mt-3 text-xs font-mono text-[#3fb950] font-bold">
              ✓ Entry pass registered! You will receive live round alerts.
            </p>
          )}
        </div>
      </section>

      {/* ─── GITHUB UNIVERSE ITINERARY TABLE ─── */}
      <section id="schedule" className={`py-12 border-b transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-transparent' : 'border-[#30363d] bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className={`flex items-center justify-between pb-6 border-b ${
            isLight ? 'border-slate-200/80' : 'border-[#30363d]'
          }`}>
            <div>
              <span className="text-xs font-mono text-[#3fb950] font-bold block mb-1">
                {'// CONFERENCE TIMETABLE'}
              </span>
              <h2 className={`text-3xl font-black uppercase font-sans tracking-tight ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}>
                Two-Day Schedule
              </h2>
            </div>

            <div className={`flex items-center border rounded text-xs font-mono p-0.5 ${
              isLight ? 'border-slate-300/80 bg-[#eef2f6]/90 backdrop-blur-md shadow-xs' : 'border-[#30363d] bg-[#0d1117]'
            }`}>
              <button
                onClick={() => setSelectedDay('day1')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  selectedDay === 'day1'
                    ? 'bg-[#238636] text-white font-bold shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-[#8b949e]'
                }`}
              >
                Day 1 (Nov 14)
              </button>
              <button
                onClick={() => setSelectedDay('day2')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  selectedDay === 'day2'
                    ? 'bg-[#238636] text-white font-bold shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-[#8b949e]'
                }`}
              >
                Day 2 (Nov 15)
              </button>
            </div>
          </div>

          <div className={`mt-6 divide-y font-mono text-xs ${
            isLight ? 'divide-slate-200/80' : 'divide-[#21262d]'
          }`}>
            {selectedDay === 'day1' ? (
              <>
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[#3fb950] font-bold w-28 shrink-0">09:00 - 10:30</span>
                  <span className={`font-bold flex-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Student Booth Setup &amp; Electrical Safety Check
                  </span>
                  <span className={isLight ? 'text-slate-500' : 'text-[#8b949e]'}>Main Auditorium</span>
                </div>
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[#3fb950] font-bold w-28 shrink-0">10:30 - 11:30</span>
                  <span className={`font-bold flex-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Opening Keynote: Next-Gen Autonomous AI
                  </span>
                  <span className={isLight ? 'text-slate-500' : 'text-[#8b949e]'}>Stage A</span>
                </div>
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[#3fb950] font-bold w-28 shrink-0">11:30 - 14:00</span>
                  <span className={`font-bold flex-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Round 1: Faculty &amp; Jury Technical Scoring
                  </span>
                  <span className={isLight ? 'text-slate-500' : 'text-[#8b949e]'}>Zones 1 &amp; 2</span>
                </div>
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[#3fb950] font-bold w-28 shrink-0">14:30 - 16:30</span>
                  <span className={`font-bold flex-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Robotics Combat &amp; Obstacle Course Qualifying Heats
                  </span>
                  <span className={isLight ? 'text-slate-500' : 'text-[#8b949e]'}>Zone 3 Battle Pit</span>
                </div>
              </>
            ) : (
              <>
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[#3fb950] font-bold w-28 shrink-0">09:30 - 12:30</span>
                  <span className={`font-bold flex-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Public Exhibition &amp; Community Ballot Voting Opens
                  </span>
                  <span className={isLight ? 'text-slate-500' : 'text-[#8b949e]'}>Full Floor</span>
                </div>
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[#3fb950] font-bold w-28 shrink-0">13:00 - 14:30</span>
                  <span className={`font-bold flex-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Student Shark Tank: Finalist Venture Pitches
                  </span>
                  <span className={isLight ? 'text-slate-500' : 'text-[#8b949e]'}>Main Stage</span>
                </div>
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[#3fb950] font-bold w-28 shrink-0">15:30</span>
                  <span className="text-[#f0883e] font-bold flex-1">Live Voting Closes • Final Firestore Tally</span>
                  <span className={isLight ? 'text-slate-500' : 'text-[#8b949e]'}>Online Portal</span>
                </div>
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[#3fb950] font-bold w-28 shrink-0">16:00 - 17:00</span>
                  <span className={`font-bold flex-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Grand Awards Ceremony &amp; Incubation Grants
                  </span>
                  <span className={isLight ? 'text-slate-500' : 'text-[#8b949e]'}>Auditorium</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── GITHUB UNIVERSE STYLE MINIMALIST FOOTER ─── */}
      <footer className={`py-10 font-mono text-xs border-t transition-colors duration-300 ${
        isLight
          ? 'bg-[#dfe3e8]/90 border-slate-300/80 backdrop-blur-md text-slate-700'
          : 'bg-[#000000] border-[#21262d] text-[#8b949e]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-3">
              <div className="h-6 px-1.5 py-0.5 rounded bg-white flex items-center justify-center border border-slate-200">
                <img src="/dps_shield.png" alt="DPS Indirapuram" className="h-full w-auto object-contain" />
              </div>
              <span className={isLight ? 'text-slate-700' : 'text-[#8b949e]'}>
                © 2026 Delhi Public School Indirapuram.
              </span>
            </div>
            <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              • Co-Engineered by Ojas Singh dpsi&apos;&apos;30
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/expo" className={`hover:underline ${isLight ? 'text-blue-600 font-semibold' : 'text-white'}`}>
              [ 3D Floor Plan ]
            </Link>
            <a href="#projects" className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              [ 35 Inventions ]
            </a>
            <a href="#voting" className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              [ Fair-Play Voting ]
            </a>
            <a href="#schedule" className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              [ Itinerary ]
            </a>
          </div>
        </div>
      </footer>

      {/* Centered Modals for Project Expansion and Anti-Cheat Voting */}
      <ProjectDetailDrawer />
      <AuthModal />
    </div>
  );
}
