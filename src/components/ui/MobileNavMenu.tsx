'use client';

import Link from 'next/link';
import { useExhibitionStore, NavZoneId } from '@/store/useExhibitionStore';
import { signOutFromFirebase } from '@/lib/firebase';
import {
  X,
  Search,
  Trophy,
  Box,
  LayoutGrid,
  User,
  LogOut,
  ChevronRight,
  Compass,
  Cpu,
  Code2,
  TrendingUp,
  Bot,
  Sparkles,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react';

export default function MobileNavMenu() {
  const theme = useExhibitionStore((state) => state.theme);
  const setTheme = useExhibitionStore((state) => state.setTheme);
  const isMobileMenuOpen = useExhibitionStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useExhibitionStore((state) => state.setMobileMenuOpen);
  const activeZone = useExhibitionStore((state) => state.activeZone);
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const viewMode = useExhibitionStore((state) => state.viewMode);
  const setViewMode = useExhibitionStore((state) => state.setViewMode);
  const setSearchOpen = useExhibitionStore((state) => state.setSearchOpen);
  const setLeaderboardOpen = useExhibitionStore((state) => state.setLeaderboardOpen);
  const setAuthModalOpen = useExhibitionStore((state) => state.setAuthModalOpen);
  const user = useExhibitionStore((state) => state.user);
  const setUser = useExhibitionStore((state) => state.setUser);

  if (!isMobileMenuOpen) return null;

  const zoneNavItems: {
    id: NavZoneId;
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      id: 'overview',
      title: 'Full Floor Overview',
      subtitle: theme === 'light' ? 'Daylight Aerial View' : 'Zoom out into Milky Way',
      badge: 'All 35',
      icon: Compass,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    },
    {
      id: 'zone-1',
      title: 'Show & Tell Pavilion',
      subtitle: 'Junior & Senior innovators',
      badge: 'ST01–08',
      icon: Sparkles,
      color: 'from-purple-500/20 to-purple-600/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
    },
    {
      id: 'physical',
      title: 'Physical Solutions',
      subtitle: 'Hardware, IoT & Automation',
      badge: 'P01–12',
      icon: Cpu,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'digital',
      title: 'Digital Solutions',
      subtitle: 'AI, Web3 & Cloud Systems',
      badge: 'D01–12',
      icon: Code2,
      color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'business',
      title: 'Business Ventures',
      subtitle: 'Fintech, Startups & Marketplaces',
      badge: 'B01–07',
      icon: TrendingUp,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    },
    {
      id: 'zone-3',
      title: 'Robotics Arenas',
      subtitle: 'Soccer & Obstacle race fields',
      badge: 'Arenas',
      icon: Bot,
      color: 'from-rose-500/20 to-rose-600/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    },
  ];

  const handleZoneClick = (zoneId: NavZoneId) => {
    setViewMode('3d');
    setActiveZone(zoneId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-[#f8fafc]/98 dark:bg-[#050811]/98 backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-200 overflow-y-auto text-slate-800 dark:text-slate-100">
      {/* Top Bar with brand and Close Button */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[#f8fafc]/95 dark:bg-[#050811]/90 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/80 pt-safe">
        <div className="flex items-center gap-3">
          <div className="h-8 px-2 py-0.5 rounded-lg bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dps_shield.png" alt="DPSI" className="h-full w-auto object-contain" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Navigation Menu</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">DPSI Tech & Innovation Expo</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close mobile navigation"
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-950 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white dark:border-slate-700/60 flex items-center justify-center active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Body */}
      <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full pb-12">
        {/* Quick Search Bar Button */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            setSearchOpen(true);
          }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-100/90 hover:bg-slate-100 border border-slate-200 text-left text-slate-500 hover:text-slate-900 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white transition-all shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-medium">Search student, booth or topic...</span>
          </div>
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            Find
          </kbd>
        </button>

        {/* View Mode Switching Pill */}
        <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-1 shadow-inner">
          <button
            onClick={() => {
              setViewMode('3d');
              setMobileMenuOpen(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              viewMode === '3d'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>3D Interactive Floor</span>
          </button>
          <button
            onClick={() => {
              setViewMode('2d');
              setMobileMenuOpen(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              viewMode === '2d'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>2D Directory</span>
          </button>
        </div>

        {/* Theme Mode Switching Pill */}
        <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              theme === 'light'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            <span>Light Mode</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              theme === 'dark'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            <span>Dark Mode</span>
          </button>
        </div>

        {/* Back to Event Info & Overview Link */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 transition-all font-semibold text-xs"
        >
          <div className="flex items-center gap-2.5">
            <ArrowLeft className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Event Info & Timetable Overview</span>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-500/70 shrink-0" />
        </Link>

        {/* Exhibition Zones Navigation Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              Exhibition Arenas
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Tap to Fly Camera</span>
          </div>

          <div className="space-y-1.5">
            {zoneNavItems.map((item) => {
              const isActive = activeZone === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleZoneClick(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200/90 dark:bg-slate-900/70 dark:border-slate-800/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br border flex items-center justify-center ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Leaderboard Link */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            setLeaderboardOpen(true);
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-100/90 via-amber-50/60 to-transparent dark:from-amber-500/20 dark:via-amber-500/10 dark:to-amber-600/5 border border-amber-300 dark:border-amber-500/40 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  Live Voting Leaderboard
                </h4>
                <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70">Inspect real-time student standings</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </button>

        {/* User Account / Sign In */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
          {user ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    await signOutFromFirebase();
                    setUser(null);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-all shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <User className="w-4 h-4" />
              <span>Sign In to Vote (Google / Email)</span>
            </button>
          )}
        </div>

        <div className="pt-2 pb-4 text-center text-[10px] font-mono text-slate-400 dark:text-slate-500">
          Co-Engineered by Ojas Singh dpsi&apos;&apos;30
        </div>
      </div>
    </div>
  );
}
