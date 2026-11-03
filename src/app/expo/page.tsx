'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getDeviceFingerprint } from '@/lib/fingerprint';
import { subscribeToProjects, onFirebaseAuthStateChange, checkRedirectResult } from '@/lib/firebase';
import TopNavHUD from '@/components/ui/TopNavHUD';
import MobileBottomDock from '@/components/ui/MobileBottomDock';
import ProjectDetailDrawer from '@/components/ui/ProjectDetailDrawer';
import SegmentInspector from '@/components/ui/SegmentInspector';
import LiveLeaderboard from '@/components/ui/LiveLeaderboard';
import TwoDFallbackGrid from '@/components/ui/TwoDFallbackGrid';
import AuthModal from '@/components/ui/AuthModal';
import SearchModal from '@/components/ui/SearchModal';
import MobileNavMenu from '@/components/ui/MobileNavMenu';
import CameraControlsWidget from '@/components/ui/CameraControlsWidget';
import GuidedTour from '@/components/canvas/GuidedTour';
import DelegatePassModal from '@/components/ui/DelegatePassModal';
import { MousePointerClick, Move, ZoomIn, ArrowLeft } from 'lucide-react';

const ExhibitionCanvas = dynamic(
  () => import('@/components/canvas/ExhibitionCanvas'),
  { ssr: false }
);

export default function ExpoFloorPlanPage() {
  const viewMode = useExhibitionStore((state) => state.viewMode);
  const setDeviceFingerprint = useExhibitionStore((state) => state.setDeviceFingerprint);
  const setIsMobile = useExhibitionStore((state) => state.setIsMobile);
  const setProjects = useExhibitionStore((state) => state.setProjects);
  const setUser = useExhibitionStore((state) => state.setUser);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  useEffect(() => {
    const checkMobile = () => {
      const isMob = window.innerWidth < 768;
      setIsMobile(isMob);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    getDeviceFingerprint().then((fp) => {
      setDeviceFingerprint(fp);
    });

    // 1. Check for pending redirect OAuth results
    checkRedirectResult()
      .then((redirectUser) => {
        if (redirectUser) {
          setUser({
            id: redirectUser.uid,
            email: redirectUser.email || 'user@dpsi.in',
            name: redirectUser.displayName || 'Visitor',
          });
        }
      })
      .catch(console.error);

    // 2. Centralized Firebase Auth state synchronization
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

    // 3. Real-time Firebase Firestore synchronization
    const unsubProjects = subscribeToProjects((liveProjects) => {
      if (liveProjects && liveProjects.length > 0) {
        setProjects(liveProjects);
      }
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      unsubAuth();
      unsubProjects();
    };
  }, [setIsMobile, setDeviceFingerprint, setProjects, setUser]);

  return (
    <main className={`relative w-screen h-[100dvh] overflow-hidden font-sans transition-colors duration-300 ${
      isLight ? 'bg-[#f1f5f9]' : 'bg-[#070b14]'
    }`}>
      {/* Top HUD Navigation Bar */}
      <TopNavHUD />

      {/* Main Exhibition Floor (3D WebGL Hall or 2D Bento Directory) */}
      {viewMode === '3d' ? (
        <div className="relative isolate w-full h-full">
          <ExhibitionCanvas />

          {/* Desktop Only: Bottom Left Camera Gesture Legend */}
          <div className={`hidden lg:flex fixed bottom-4 left-6 z-30 items-center gap-4 px-4 py-2.5 rounded-2xl backdrop-blur-md border text-[11px] pointer-events-none shadow-xl font-mono transition-colors duration-300 ${
            isLight
              ? 'bg-white/85 border-slate-200 text-slate-600 shadow-slate-200/50'
              : 'bg-[#0b101c]/85 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-amber-500" />
              <span>Tap Booth</span>
            </div>
            <div className={`w-1 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`} />
            <div className="flex items-center gap-1.5">
              <Move className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`} />
              <span>Drag to Orbit</span>
            </div>
            <div className={`w-1 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`} />
            <div className="flex items-center gap-1.5">
              <ZoomIn className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`} />
              <span>Pinch / Scroll to Zoom</span>
            </div>
            <div className={`w-1 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`} />
            <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              DPS Indirapuram • Co-Engineered by Devansh Grover (7-H, &apos;31) &amp; Ojas Singh (&apos;30)
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full overflow-y-auto">
          <TwoDFallbackGrid />
        </div>
      )}

      {/* Mobile Floating Action Dock */}
      <MobileBottomDock />

      {/* Floating 3D Navigation Controls Widget */}
      <CameraControlsWidget />

      {/* Interactive 3D Guided Virtual Tour */}
      <GuidedTour />

      {/* Segment Inspector Drawer (Opens when a segment is selected to show what's inside!) */}
      <SegmentInspector />

      {/* Slide-out Drawers & Modals */}
      <ProjectDetailDrawer />
      <LiveLeaderboard />
      <AuthModal />
      <SearchModal />
      <MobileNavMenu />
      <DelegatePassModal />
    </main>
  );
}
