'use client';

import React, { memo, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useExhibitionStore, NavZoneId } from '@/store/useExhibitionStore';
import { signOutFromFirebase } from '@/lib/firebase';
import { isSoundEnabled, toggleSound, playClick } from '@/lib/sound';
import {
  Trophy,
  Box,
  LayoutGrid,
  User,
  LogOut,
  Search,
  Menu,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles,
  Compass,
  Volume2,
  VolumeX,
} from 'lucide-react';

const ZONES: { id: NavZoneId; label: string }[] = [
  { id: 'overview', label: '3D Hall' },
  { id: 'blueprint', label: 'Blueprint' },
  { id: 'zone-1', label: 'Show & Tell' },
  { id: 'physical', label: 'Physical' },
  { id: 'digital', label: 'Digital' },
  { id: 'business', label: 'Business' },
  { id: 'zone-3', label: 'Robotics' },
];

function TopNavHUD() {
  const theme = useExhibitionStore((state) => state.theme);
  const toggleTheme = useExhibitionStore((state) => state.toggleTheme);
  const isLight = theme === 'light';

  const activeZone = useExhibitionStore((state) => state.activeZone);
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const viewMode = useExhibitionStore((state) => state.viewMode);
  const setViewMode = useExhibitionStore((state) => state.setViewMode);
  const isLeaderboardOpen = useExhibitionStore((state) => state.isLeaderboardOpen);
  const setLeaderboardOpen = useExhibitionStore((state) => state.setLeaderboardOpen);
  const setAuthModalOpen = useExhibitionStore((state) => state.setAuthModalOpen);
  const setSearchOpen = useExhibitionStore((state) => state.setSearchOpen);
  const isMobileMenuOpen = useExhibitionStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useExhibitionStore((state) => state.setMobileMenuOpen);
  const user = useExhibitionStore((state) => state.user);
  const setUser = useExhibitionStore((state) => state.setUser);
  const isTourActive = useExhibitionStore((state) => state.isTourActive);
  const startTour = useExhibitionStore((state) => state.startTour);
  const stopTour = useExhibitionStore((state) => state.stopTour);

  const [isSoundOn, setIsSoundOn] = useState(true);

  useEffect(() => {
    const animId = requestAnimationFrame(() => {
      setIsSoundOn(isSoundEnabled());
    });
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutFromFirebase();
      setUser(null);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
  }, [setUser]);

  const handleLogoClick = useCallback(() => {
    setViewMode('3d');
    setActiveZone('overview');
  }, [setViewMode, setActiveZone]);

  return (
    <header className="fixed top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-4 md:inset-x-6 z-[100] pointer-events-auto pt-safe">
      <nav
        aria-label="Main Navigation"
        className={`mx-auto w-full max-w-[1580px] h-12 sm:h-13 md:h-14 px-2.5 sm:px-3 md:px-4 rounded-2xl backdrop-blur-2xl border transition-all duration-300 shadow-xl flex items-center justify-between gap-2 ${
          isLight
            ? 'bg-white/95 border-slate-200/90 shadow-slate-300/50 text-slate-900'
            : 'bg-[#080d1a]/95 border-slate-700/60 shadow-black/80 text-white'
        }`}
      >
        {/* ========================================================= */}
        {/* LEFT: Branding & Return Action                            */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Exit / Back to Event Landing Page */}
          <Link
            href="/"
            className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all shrink-0 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-950'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Return to Event Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline text-[11px] font-bold">Overview</span>
          </Link>

          {/* DPS Indirapuram Identity Emblem */}
          <button
            onClick={handleLogoClick}
            className="h-8 sm:h-9 px-2 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-slate-200 hover:opacity-95 transition-opacity"
            title="Reset to 3D Overview"
          >
            <img
              src="/dps_shield.png"
              alt="DPS Indirapuram Shield"
              className="h-6 w-auto object-contain block sm:hidden"
            />
            <img
              src="/dps_indirapuram_logo.png"
              alt="DPS Indirapuram"
              className="h-6 w-auto max-w-[100px] sm:max-w-[130px] md:max-w-[145px] object-contain hidden sm:block"
            />
          </button>

          {/* Exhibition Title & Live Badge */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-300/60 dark:border-slate-800">
            <span className={`text-xs font-extrabold tracking-tight whitespace-nowrap ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Innovation Fest
            </span>
            <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER: Sanitized Segment Navigation & Quick Search       */}
        {/* ========================================================= */}
        <div className="hidden lg:flex items-center gap-1.5 min-w-0 flex-1 justify-center px-2">
          {/* Global Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`h-8 sm:h-8.5 flex items-center gap-2 px-2.5 rounded-xl border text-xs transition-all shadow-inner group shrink-0 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200/90 border-slate-200 text-slate-700 hover:text-slate-950'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Search Projects (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="hidden 2xl:inline text-[11px] font-medium">Search 35 booths...</span>
            <span className="hidden xl:inline 2xl:hidden text-[11px]">Search...</span>
            <kbd className={`text-[9px] font-mono px-1 py-0.5 rounded border ml-0.5 ${
              isLight ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              ⌘K
            </kbd>
          </button>

          {/* Clean Segment Navigation Pills */}
          {viewMode === '3d' && (
            <div
              role="tablist"
              className={`flex items-center gap-0.5 p-0.5 rounded-xl border h-8 sm:h-8.5 shadow-inner overflow-x-auto no-scrollbar max-w-full ${
                isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/90 border-slate-800/90'
              }`}
            >
              {ZONES.map((zone) => {
                const isActive = activeZone === zone.id;
                return (
                  <button
                    key={zone.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveZone(zone.id)}
                    className={`h-6 sm:h-7 flex items-center gap-1 px-2.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-bold scale-[1.02]'
                        : isLight
                          ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/70'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isActive ? 'bg-slate-950' : isLight ? 'bg-slate-400' : 'bg-slate-600'
                      }`}
                    />
                    <span>{zone.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT: Controls, Leaderboard & Authentication             */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
          {/* Tablet Search Icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`hidden sm:flex lg:hidden w-8 h-8 rounded-xl border items-center justify-center transition-all ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Search Projects"
          >
            <Search className="w-3.5 h-3.5 text-amber-500" />
          </button>

          {/* 3D / 2D Segmented Control */}
          <div className={`hidden md:flex items-center p-0.5 rounded-xl border h-8 sm:h-8.5 shadow-inner shrink-0 ${
            isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/90 border-slate-800/90'
          }`}>
            <button
              onClick={() => setViewMode('3d')}
              className={`h-6 sm:h-7 flex items-center gap-1 px-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '3d'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs font-bold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
              }`}
              title="3D Spatial Floor Plan"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`h-6 sm:h-7 flex items-center gap-1 px-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '2d'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs font-bold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
              }`}
              title="2D Bento Directory"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>2D</span>
            </button>
          </div>

          {/* Live Rankings Leaderboard */}
          <button
            onClick={() => setLeaderboardOpen(!isLeaderboardOpen)}
            className={`hidden sm:flex items-center gap-1.5 h-8 sm:h-8.5 px-2.5 rounded-xl border text-xs font-bold shadow-xs transition-all whitespace-nowrap shrink-0 ${
              isLeaderboardOpen
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : isLight
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-900'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
            }`}
            title="Live Rankings Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden lg:inline text-[11px]">Leaderboard</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
          </button>

          {/* 3D Guided Virtual Tour Button */}
          {viewMode === '3d' && (
            <button
              onClick={() => {
                playClick();
                if (isTourActive) {
                  stopTour();
                } else {
                  startTour();
                }
              }}
              className={`hidden sm:flex items-center gap-1.5 h-8 sm:h-8.5 px-2.5 rounded-xl border text-xs font-bold shadow-xs transition-all whitespace-nowrap shrink-0 ${
                isTourActive
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm animate-pulse'
                  : isLight
                    ? 'bg-slate-100 hover:bg-slate-200/90 border-slate-200 text-slate-800'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
              title="Start 3D Guided Virtual Tour"
            >
              <Compass className={`w-3.5 h-3.5 ${isTourActive ? 'animate-spin' : 'text-amber-500'}`} />
              <span className="hidden xl:inline text-[11px]">{isTourActive ? 'Tour Active' : 'Guided Tour'}</span>
            </button>
          )}

          {/* Sound Effects Audio Mute / Unmute Toggle */}
          <button
            onClick={() => {
              const enabled = toggleSound();
              setIsSoundOn(enabled);
            }}
            className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl border flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-xs ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200/90 border-slate-200 text-slate-700'
                : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 text-slate-300'
            }`}
            title={isSoundOn ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            aria-label="Toggle Sound Effects"
          >
            {isSoundOn ? (
              <Volume2 className="w-4 h-4 text-amber-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl border flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-xs ${
              isLight
                ? 'bg-amber-50 hover:bg-amber-100/90 border-amber-300 text-amber-800'
                : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700 text-amber-300'
            }`}
            title={isLight ? 'Switch to Cosmic Dark Theme' : 'Switch to Architectural Light Theme'}
            aria-label="Toggle Theme"
          >
            {isLight ? (
              <Sun className="w-4 h-4 text-amber-600" />
            ) : (
              <Moon className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User Profile / Sign In */}
          {user ? (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-300 dark:border-slate-800 shrink-0">
              <div className={`flex items-center gap-1.5 h-8 sm:h-8.5 px-2 rounded-xl border text-xs max-w-[120px] sm:max-w-[150px] ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className={`truncate font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {user.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className={`p-0.5 rounded-lg transition-colors ml-0.5 shrink-0 ${
                    isLight ? 'text-slate-500 hover:text-rose-600' : 'text-slate-400 hover:text-rose-400'
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 text-xs font-bold shadow-sm transition-all whitespace-nowrap shrink-0"
              title="Sign in to cast your vote"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden w-8 h-8 rounded-xl border flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-slate-900/90 border-slate-700/80 text-white'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </nav>
    </header>
  );
}

export default memo(TopNavHUD);
