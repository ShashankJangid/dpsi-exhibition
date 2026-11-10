'use client';

import { useExhibitionStore, NavZoneId } from '@/store/useExhibitionStore';
import { signOutFromFirebase } from '@/lib/firebase';
import { playClick } from '@/lib/sound';
import {
  Trophy,
  Box,
  LayoutGrid,
  User,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
} from 'lucide-react';

export default function MobileBottomDock() {
  const activeZone = useExhibitionStore((state) => state.activeZone);
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const viewMode = useExhibitionStore((state) => state.viewMode);
  const setViewMode = useExhibitionStore((state) => state.setViewMode);
  const isLeaderboardOpen = useExhibitionStore((state) => state.isLeaderboardOpen);
  const setLeaderboardOpen = useExhibitionStore((state) => state.setLeaderboardOpen);
  const isSegmentInspectorOpen = useExhibitionStore((state) => state.isSegmentInspectorOpen);
  const setSegmentInspectorOpen = useExhibitionStore((state) => state.setSegmentInspectorOpen);
  const setAuthModalOpen = useExhibitionStore((state) => state.setAuthModalOpen);
  const setSearchOpen = useExhibitionStore((state) => state.setSearchOpen);
  const isDrawerOpen = useExhibitionStore((state) => state.isDrawerOpen);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';
  const user = useExhibitionStore((state) => state.user);
  const setUser = useExhibitionStore((state) => state.setUser);
  const selectedProject = useExhibitionStore((state) => state.selectedProject);
  const selectNextProject = useExhibitionStore((state) => state.selectNextProject);
  const selectPrevProject = useExhibitionStore((state) => state.selectPrevProject);
  const isTourActive = useExhibitionStore((state) => state.isTourActive);
  const startTour = useExhibitionStore((state) => state.startTour);
  const stopTour = useExhibitionStore((state) => state.stopTour);

  const zones: { id: NavZoneId; short: string; title: string }[] = [
    { id: 'overview', short: 'Hall', title: '3D Hall Entrance' },
    { id: 'blueprint', short: 'Plan', title: 'Blueprint Floor Plan' },
    { id: 'zone-1', short: 'ST', title: 'Show & Tell' },
    { id: 'physical', short: 'P', title: 'Physical Solutions' },
    { id: 'digital', short: 'D', title: 'Digital Solutions' },
    { id: 'business', short: 'B', title: 'Business Ventures' },
    { id: 'zone-3', short: 'Robo', title: 'Robotics Arenas' },
  ];

  if (isDrawerOpen) return null;

  return (
    <div className="md:hidden fixed bottom-3 inset-x-2.5 sm:inset-x-3 z-[100] pointer-events-auto pb-safe flex flex-col gap-1.5 items-center">
      {/* Quick Booth Stepper Pill for 3D navigation on mobile */}
      {viewMode === '3d' && (
        <div className="flex items-center gap-1.5 max-w-full">
          <div className={`flex items-center justify-between gap-1 px-2.5 py-1 rounded-full backdrop-blur-xl border text-[11px] font-mono shadow-md transition-all ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/40'
              : 'bg-[#0b101c]/90 border-slate-700/60 text-white shadow-black/80'
          }`}>
            <button
              onClick={selectPrevProject}
              className="flex items-center gap-0.5 px-2 py-1 rounded hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold active:scale-95 touch-manipulation"
              aria-label="Previous Booth"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            
            <button
              onClick={() => {
                playClick();
                if (selectedProject) {
                  useExhibitionStore.getState().setDrawerOpen(true);
                } else if (isTourActive) {
                  stopTour();
                } else {
                  startTour();
                }
              }}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all touch-manipulation active:scale-95 ${
                isTourActive
                  ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-500 font-semibold truncate max-w-[170px]'
              }`}
              title={selectedProject ? `View Booth ${selectedProject.booth_code} Details` : 'Start 3D Guided Tour'}
            >
              <Compass className={`w-3 h-3 ${isTourActive ? 'animate-spin' : 'text-amber-500'}`} />
              <span>{isTourActive ? 'Tour Active' : selectedProject ? `Booth ${selectedProject.booth_code} • View` : '✦ Guided Tour'}</span>
            </button>

            <button
              onClick={selectNextProject}
              className="flex items-center gap-0.5 px-2 py-1 rounded hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold active:scale-95 touch-manipulation"
              aria-label="Next Booth"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeZone !== 'overview' && activeZone !== 'blueprint' && (
            <button
              onClick={() => {
                const nextState = !isSegmentInspectorOpen;
                setSegmentInspectorOpen(nextState);
                if (nextState) {
                  useExhibitionStore.getState().setIsMinimapOpen(false);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full backdrop-blur-xl border text-[11px] font-mono font-bold shadow-md transition-all active:scale-95 shrink-0 touch-manipulation ${
                isSegmentInspectorOpen
                  ? 'bg-slate-800 text-white border-slate-600'
                  : 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{isSegmentInspectorOpen ? 'Hide' : 'Projects'}</span>
            </button>
          )}
        </div>
      )}

      <div className={`w-full flex items-center justify-between p-1.5 rounded-2xl backdrop-blur-2xl border transition-colors duration-300 shadow-2xl ${
        isLight
          ? 'bg-white/95 border-slate-200/90 shadow-slate-300/50 text-slate-900'
          : 'bg-[#070b14]/95 border-slate-700/60 shadow-black text-white'
      }`}>
        
        {/* Quick Zone Navigation in 3D Mode with Smooth Horizontal Swipe */}
        {viewMode === '3d' ? (
          <div className={`flex items-center gap-1 p-0.5 rounded-xl border flex-1 min-w-0 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x mr-1.5 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            {zones.map((zone) => {
              const isActive = activeZone === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => setActiveZone(zone.id)}
                  title={zone.title}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all shrink-0 touch-manipulation active:scale-95 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-950'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {zone.short}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-3 py-1.5 text-xs font-mono font-bold text-amber-500 flex items-center gap-1.5 shrink-0">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>2D DIRECTORY</span>
          </div>
        )}

        {/* Action Controls: 2D/3D toggle, Leaderboard, Auth */}
        <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-slate-200/80 dark:border-slate-800">
          {/* Quick Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`p-2 rounded-xl border transition-all touch-manipulation active:scale-95 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
            title="Search Projects"
          >
            <Search className="w-3.5 h-3.5 text-amber-500" />
          </button>

          {/* 3D / 2D Toggle */}
          <button
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className={`p-2 rounded-xl text-xs font-bold border transition-all touch-manipulation active:scale-95 ${
              viewMode === '2d'
                ? 'bg-amber-500/20 text-amber-600 border-amber-500/40'
                : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
            title="Toggle View Mode"
          >
            {viewMode === '3d' ? <LayoutGrid className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5 text-amber-500" />}
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={() => setLeaderboardOpen(!isLeaderboardOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all font-mono touch-manipulation"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Ranks</span>
          </button>

          {/* Auth Button & Mobile Sign-Out */}
          {user ? (
            <div className="flex items-center gap-1">
              <div
                className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center font-bold text-[10px]"
                title={user.name}
              >
                {user.name.charAt(0)}
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
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 touch-manipulation"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className={`p-1.5 px-2 rounded-xl border font-bold text-[10px] flex items-center gap-1 touch-manipulation active:scale-95 ${
                isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-800 border-slate-700 text-amber-400'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
