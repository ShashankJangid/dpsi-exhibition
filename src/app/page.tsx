'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Vote,
  Sun,
  Moon,
  Search,
  Trophy,
  X,
  Share2,
  LayoutGrid,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { SEED_PROJECTS } from '@/data/seedProjects';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { Project } from '@/types';
import ProjectDetailDrawer from '@/components/ui/ProjectDetailDrawer';
import AuthModal from '@/components/ui/AuthModal';
import DelegatePassModal from '@/components/ui/DelegatePassModal';
import SearchModal from '@/components/ui/SearchModal';
import LiveLeaderboard from '@/components/ui/LiveLeaderboard';
import ProjectCardSkeleton from '@/components/ui/ProjectCardSkeleton';
import PictureRailGallery, { type PictureRailItem, type PictureFrameStyle } from '@/components/ui/picture-rail-gallery';
import { EXHIBITION_GALLERY_ITEMS } from '@/components/ui/demo';
import { playClick, playChime, triggerHaptic } from '@/lib/sound';
import { subscribeToProjects, onFirebaseAuthStateChange, castVoteInFirebase, checkRedirectResult, subscribeToUserVotedProjects } from '@/lib/firebase';
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
  const setSearchModalOpen = useExhibitionStore((state) => state.setSearchModalOpen);
  const setLeaderboardOpen = useExhibitionStore((state) => state.setLeaderboardOpen);
  const setAuthModalOpen = useExhibitionStore((state) => state.setAuthModalOpen);
  const user = useExhibitionStore((state) => state.user);
  const votedProjectIds = useExhibitionStore((state) => state.votedProjectIds);
  const markProjectVoted = useExhibitionStore((state) => state.markProjectVoted);
  const incrementProjectVote = useExhibitionStore((state) => state.incrementProjectVote);

  type FilterCategory = 'all' | 'Physical' | 'Digital' | 'Business' | 'Show & Tell' | 'Robotics';
  const [selectedZone, setSelectedZone] = useState<FilterCategory>('all');
  const [directoryView, setDirectoryView] = useState<'grid' | 'rail'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [registered, setRegistered] = useState(false);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    getDeviceFingerprint().then((fp) => {
      setDeviceFingerprint(fp);
    });

    // Process any returning Google OAuth redirect credentials
    checkRedirectResult()
      .then((user) => {
        if (user) {
          setUser({
            id: user.uid,
            email: user.email || 'user@dpsi.in',
            name: user.displayName || 'Visitor',
          });
          showToast(`Welcome, ${user.displayName || 'Visitor'}!`);
        }
      })
      .catch((err) => {
        console.warn('OAuth redirect check notice:', err);
      });

    const unsubAuth = onFirebaseAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        const currentUser = useExhibitionStore.getState().user;
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || (currentUser?.id === firebaseUser.uid ? currentUser.email : 'visitor@dpsi.in'),
          name: firebaseUser.displayName || (currentUser?.id === firebaseUser.uid ? currentUser.name : 'Visitor'),
        });
      } else {
        const currentUser = useExhibitionStore.getState().user;
        // Retain local guest visitor pass if Firebase anonymous auth is unconfigured
        if (!currentUser?.id.startsWith('guest_')) {
          setUser(null);
        }
      }
    });

    const unsubProjects = subscribeToProjects((liveProjects) => {
      if (liveProjects && liveProjects.length > 0) {
        setProjects(liveProjects);
      }
      setIsProjectsLoading(false);
    });

    const timer = setTimeout(() => setIsProjectsLoading(false), 300);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      unsubAuth();
      unsubProjects();
    };
  }, [setIsMobile, setDeviceFingerprint, setUser, setProjects, setSearchModalOpen]);

  // Load locally saved votes from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dpsi_voted_project_ids');
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids)) {
          ids.forEach((id: string) => markProjectVoted(id));
        }
      }
    } catch {
      // LocalStorage access fallback
    }
  }, [markProjectVoted]);

  // Subscribe to verified user votes from Firestore when user identity is present
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToUserVotedProjects(user.id, (ids) => {
      ids.forEach((id) => markProjectVoted(id));
      try {
        const existing = JSON.parse(localStorage.getItem('dpsi_voted_project_ids') || '[]');
        const merged = Array.from(new Set([...existing, ...ids]));
        localStorage.setItem('dpsi_voted_project_ids', JSON.stringify(merged));
      } catch {
        // localStorage fallback
      }
    });
    return () => unsub();
  }, [user?.id, markProjectVoted]);

  const allProjects = storeProjects.length > 0 ? storeProjects : SEED_PROJECTS;
  const filteredProjects = allProjects.filter((p) => {
    // 1. Category / Zone filter
    if (selectedZone !== 'all') {
      if (selectedZone === 'Robotics') {
        if (p.category !== 'Robo Race' && p.category !== 'Robo Soccer') return false;
      } else if (p.category !== selectedZone) {
        return false;
      }
    }
    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCode = p.booth_code.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchMembers = p.members?.some((m) => m.toLowerCase().includes(q));
      const matchTech = p.tech_stack?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCode && !matchDesc && !matchMembers && !matchTech) {
        return false;
      }
    }
    return true;
  });

  const projectRailItems: PictureRailItem[] = useMemo(() => {
    const list = filteredProjects.length > 0 ? filteredProjects : allProjects;
    return list.map((p, idx) => {
      const styles: PictureFrameStyle[] = ['black', 'oak', 'white'];
      const frame = styles[idx % styles.length];
      const drops = [-0.05, 0.08, -0.02, 0.12, -0.08, 0.04, -0.04, 0.06];
      return {
        id: p.id,
        title: p.title.replace(/^[A-Z0-9]+\s*•\s*/, ''),
        artist: p.members?.length ? p.members.join(', ') : 'Student Innovators',
        year: '2026',
        image: p.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
        aspect: 0.8,
        frame,
        mat: idx % 2 === 0,
        drop: drops[idx % drops.length],
        tag: `Booth ${p.booth_code} • ${p.category}`,
        details: [
          `Booth: ${p.booth_code} • Category: ${p.category}`,
          `Tech Stack: ${p.tech_stack?.join(', ') || 'Embedded Systems'}`,
          `Community Votes: ${p.vote_count} ballots cast`,
          `Venue: DPS Indirapuram Innovation Fest`,
        ],
      };
    });
  }, [filteredProjects, allProjects]);

  // Deep link support (?booth=P04 or ?booth=ST01) - consumed once per query parameter
  const handledBoothRef = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const boothParam = params.get('booth');
    if (boothParam && handledBoothRef.current !== boothParam.toLowerCase() && allProjects.length > 0) {
      const match = allProjects.find(
        (p) => p.booth_code.toLowerCase() === boothParam.toLowerCase()
      );
      if (match) {
        handledBoothRef.current = boothParam.toLowerCase();
        selectProject(match);
        const timer = setTimeout(() => {
          const el = document.getElementById('projects');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
          showToast(`📍 Viewing Booth ${match.booth_code}: ${match.title.replace(/^.+•\s*/, '')}`);
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [allProjects, selectProject]);

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: allProjects.length,
      Physical: 0,
      Digital: 0,
      Business: 0,
      'Show & Tell': 0,
      Robotics: 0,
    };
    allProjects.forEach((p) => {
      if (p.category === 'Physical') counts.Physical++;
      else if (p.category === 'Digital') counts.Digital++;
      else if (p.category === 'Business') counts.Business++;
      else if (p.category === 'Show & Tell') counts['Show & Tell']++;
      else if (p.category === 'Robo Race' || p.category === 'Robo Soccer') counts.Robotics++;
    });
    return counts;
  }, [allProjects]);

  // Direct Card Voting with Optimistic UI & Confetti
  const handleDirectVote = async (p: Project, e: React.MouseEvent) => {
    playClick();
    if (votedProjectIds.includes(p.id)) {
      showToast(`Already verified vote for Booth ${p.booth_code}`);
      return;
    }
    if (!user) {
      setAuthModalOpen(true);
      showToast('Please sign in or enter guest email to verify ballot');
      return;
    }

    try {
      const fingerprint = await getDeviceFingerprint();

      // Instant optimistic UI update
      markProjectVoted(p.id);
      incrementProjectVote(p.id);

      // Confetti burst from button position
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { x, y },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'],
      });
      playChime();
      triggerHaptic(30);

      showToast(`🎉 Verified ballot recorded for Booth ${p.booth_code}!`);

      // Backend verification with token attachment and response verification
      castVoteInFirebase({
        projectId: p.id,
        fingerprint,
        userId: user.id,
        userEmail: user.email,
      }).then((res) => {
        if (res.alreadyVoted) {
          showToast(`Notice: Vote was previously recorded for Booth ${p.booth_code}`);
        } else if (!res.success) {
          showToast(res.message || 'Vote verification sync warning. Please check connection.');
        }
      });
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Vote submission failed. Please check connection.');
    }
  };

  // 1-Click Share Booth
  const handleShare = async (p: Project) => {
    playClick();
    const shareUrl = `${window.location.origin}/?booth=${encodeURIComponent(p.booth_code)}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showToast(`📋 Copied share link for Booth ${p.booth_code}!`);
      } else {
        showToast(`Booth link: ${shareUrl}`);
      }
    } catch {
      showToast(`Booth link: ${shareUrl}`);
    }
  };

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
      {/* ─── GITHUB UNIVERSE GRID NAVBAR ─── */}
      <header className={`sticky top-0 z-50 w-full backdrop-blur-md border-b transition-colors duration-300 ${
        isLight
          ? 'bg-[#dfe3e8]/90 border-slate-300/80 shadow-xs'
          : 'bg-[#000000]/95 border-[#30363d]'
      }`}>
        <div className="max-w-7xl mx-auto flex items-stretch h-14">
          {/* Brand Cell: DPS Shield + '26 (Light & Dark mode) */}
          <Link
            href="/"
            className={`flex items-center px-4 border-r transition-colors shrink-0 ${
              isLight
                ? 'border-slate-200/80 hover:bg-slate-200/50'
                : 'border-[#30363d] hover:bg-[#161b22]'
            }`}
            title="DPS Indirapuram '26"
          >
            <Image
              src={isLight ? '/dpsi_shield_26_light.svg' : '/dpsi_shield_26_dark.svg'}
              alt="DPS Indirapuram '26"
              width={124}
              height={48}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          {/* Navigation Cells */}
          <nav className="hidden lg:flex items-stretch text-xs font-mono">
            {[
              { href: '#stage', label: 'Stage' },
              { href: '#gallery', label: 'Photo View' },
              { href: '#projects', label: '35 Inventions' },
              { href: '#arenas', label: '3 Arenas' },
              { href: '#voting', label: 'Live Voting' },
              { href: '#schedule', label: 'Schedule' },
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
            {/* Quick Search Button */}
            <button
              onClick={() => {
                playClick();
                setSearchModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 border-r font-mono text-xs transition-colors ${
                isLight
                  ? 'border-slate-200/80 hover:bg-slate-200/50 text-slate-700'
                  : 'border-[#30363d] hover:bg-[#161b22] text-slate-300'
              }`}
              title="Search Projects"
            >
              <Search className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Search</span>
            </button>

            {/* Live Leaderboard Modal Trigger */}
            <button
              onClick={() => {
                playClick();
                setLeaderboardOpen(true);
              }}
              className={`hidden md:flex items-center gap-1.5 px-3 border-r font-mono text-xs transition-colors ${
                isLight
                  ? 'border-slate-200/80 hover:bg-slate-200/50 text-slate-700'
                  : 'border-[#30363d] hover:bg-[#161b22] text-slate-300'
              }`}
              title="View Live Voting Leaderboard & Ranks"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Leaderboard</span>
            </button>

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
              isLight ? 'text-slate-600' : 'text-[#8b949e]'
            }`}>
              <span className="flex items-center gap-2 text-[#3fb950] font-bold">
                <span>NOVEMBER 14, 2026</span>
                <span className="inline-block w-2 h-2 bg-[#3fb950] rounded-xs" />
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

            {/* Technical Sub-Header with Venue Metadata */}
            <div className={`relative z-10 px-4 py-2 border-b flex items-center justify-between text-[10px] sm:text-[11px] font-mono ${
              isLight ? 'border-slate-200/80 text-slate-600' : 'border-[#21262d] text-[#8b949e]'
            }`}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate font-bold tracking-tight">DELHI PUBLIC SCHOOL INDIRAPURAM</span>
              </div>
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
                guides={false}
                specks={0}
                reach={isMobile ? 120 : 180}
                bounce={0}
                softness={0}
              />
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
                  INNOVATION EXHIBITION ARCHITECTURE
                </span>
                <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${
                  isLight ? 'text-slate-800' : 'text-white'
                }`}>
                  innovate-build-deploy
                </h2>
                <p className={`mt-4 text-sm leading-relaxed font-mono ${
                  isLight ? 'text-slate-600' : 'text-[#8b949e]'
                }`}>
                  35 student research teams across Physical Computing, Artificial Intelligence,
                  Sustainable Enterprise, and Combat Robotics.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 font-mono text-xs">
                <div className={`p-3.5 border rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                  isLight ? 'border-slate-300/80 bg-white/80 backdrop-blur-md shadow-xs hover:shadow-sm' : 'border-[#21262d] bg-[#0d1117] hover:border-[#30363d]'
                }`}>
                  <span className="text-[#3fb950] font-bold block tabular-nums">12 BOOTHS</span>
                  <span className={`mt-1 block text-pretty ${isLight ? 'text-slate-800 font-semibold' : 'text-white'}`}>
                    Physical Computing (P)
                  </span>
                </div>
                <div className={`p-3.5 border rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                  isLight ? 'border-slate-300/80 bg-white/80 backdrop-blur-md shadow-xs hover:shadow-sm' : 'border-[#21262d] bg-[#0d1117] hover:border-[#30363d]'
                }`}>
                  <span className="text-[#58a6ff] font-bold block tabular-nums">12 BOOTHS</span>
                  <span className={`mt-1 block text-pretty ${isLight ? 'text-slate-800 font-semibold' : 'text-white'}`}>
                    Digital &amp; AI Software (D)
                  </span>
                </div>
                <div className={`p-3.5 border rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                  isLight ? 'border-slate-300/80 bg-white/80 backdrop-blur-md shadow-xs hover:shadow-sm' : 'border-[#21262d] bg-[#0d1117] hover:border-[#30363d]'
                }`}>
                  <span className="text-[#d2a8ff] font-bold block tabular-nums">07 BOOTHS</span>
                  <span className={`mt-1 block text-pretty ${isLight ? 'text-slate-800 font-semibold' : 'text-white'}`}>
                    Business Ventures (B)
                  </span>
                </div>
                <div className={`p-3.5 border rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                  isLight ? 'border-slate-300/80 bg-white/80 backdrop-blur-md shadow-xs hover:shadow-sm' : 'border-[#21262d] bg-[#0d1117] hover:border-[#30363d]'
                }`}>
                  <span className="text-[#f0883e] font-bold block tabular-nums">04 HEATS</span>
                  <span className={`mt-1 block text-pretty ${isLight ? 'text-slate-800 font-semibold' : 'text-white'}`}>
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
                  PURPOSE &amp; INVITATION
                </span>
                <p className={`text-base sm:text-lg leading-relaxed font-sans text-pretty ${
                  isLight ? 'text-slate-800' : 'text-[#c9d1d9]'
                }`}>
                  From deep-learning soil fertility scanners to hardware ADAS driver assistance and
                  autonomous maze rovers, experience the next generation of engineers delivering live at
                  Delhi Public School Indirapuram.
                </p>
                <p className={`mt-3 text-xs sm:text-sm font-mono text-pretty ${
                  isLight ? 'text-slate-600' : 'text-[#8b949e]'
                }`}>
                  Inspect blueprints in 3D WebGL, evaluate technical schematics, and submit your verified
                  ballot through our authenticated community voting portal.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/expo"
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all rounded-xl shadow-lg shadow-amber-500/25"
                >
                  <span>Launch 3D Hall ({isLight ? 'Light Showroom' : 'Cosmic Dark'})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#projects"
                  className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-4 border font-mono font-bold text-xs uppercase tracking-wider transition-all rounded-xl active:scale-[0.98] ${
                    isLight
                      ? 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                      : 'bg-[#161b22] hover:bg-[#21262d] border-[#30363d] text-white'
                  }`}
                >
                  <span>Browse 35 Projects</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE EXHIBITION MARQUEE RIBBON ─── */}
      <section className={`border-b transition-colors duration-300 py-1 overflow-hidden ${
        isLight ? 'border-slate-200/80 bg-white/35 backdrop-blur-sm' : 'border-[#30363d] bg-[#040711]'
      }`}>
        <div className="py-2 overflow-hidden">
          <TextLoop
            text="DPSI TECH & INNOVATION EXPO 2026 ✦ 35 STUDENT INVENTIONS ✦ PHYSICAL PROTOTYPES ✦ AI & COMPUTER VISION ✦ BUSINESS SUSTAINABILITY ✦ COMBAT ROBOTICS ✦ VERIFIED COMMUNITY BALLOT"
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

            {/* Exhibition Horizon Headline Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
              <span className={`px-3 py-1 rounded font-mono text-xs mb-4 backdrop-blur-sm ${
                isLight
                  ? 'bg-white/80 border border-slate-300/80 text-blue-700 shadow-xs'
                  : 'bg-black/80 border border-slate-700 text-[#38bdf8]'
              }`}>
                DPS INDIRAPURAM • ANNUAL INNOVATION EXHIBITION
              </span>
              <h2 className={`text-3xl sm:text-5xl font-black font-sans uppercase tracking-tight max-w-2xl ${
                isLight ? 'text-black font-black' : 'text-white drop-shadow-md'
              }`}>
                Where Young Visionaries Shape Tomorrow
              </h2>
              <p className={`mt-3 text-xs sm:text-sm font-mono max-w-lg ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}>
                Explore 35 breakthrough inventions engineered across physical computing, artificial intelligence, and sustainable enterprise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DEDICATED PHOTO VIEW SECTION: INNOVATION PICTURE RAIL GALLERY ─── */}
      <section id="gallery" className={`scroll-mt-16 border-b py-12 transition-colors duration-300 w-full overflow-hidden ${
        isLight ? 'border-slate-200/80 bg-slate-100/40' : 'border-[#30363d] bg-[#02040a]'
      }`}>
        {/* Spans full display width seamlessly without inner box borders or card container */}
        <div className="w-full">
          <PictureRailGallery
            items={EXHIBITION_GALLERY_ITEMS}
            eyebrow="DPS INDIRAPURAM • INNOVATION EXHIBITION 2026"
            heading="Curated Innovation Prints"
            caption="Physics-driven pendulum swinging with sub-step Euler momentum. Click any frame to lift and examine."
            className="bg-transparent"
          />
        </div>
      </section>

      {/* ─── GITHUB UNIVERSE STYLE 35 INVENTIONS DIRECTORY ─── */}
      <section id="projects" className={`scroll-mt-16 border-b pt-6 pb-12 transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-transparent' : 'border-[#30363d] bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b ${
            isLight ? 'border-slate-200/80' : 'border-[#30363d]'
          }`}>
            <div>
              <span className="text-xs font-mono text-[#3fb950] font-bold block mb-1">
                COMPETING BOOTHS DIRECTORY
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black uppercase font-sans tracking-tight ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}>
                All 35 Inventions
              </h2>
            </div>

            {/* Controls: Search Bar & Category Filter Tabs */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Direct Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, stall, team..."
                  className={`w-full pl-8 pr-7 py-2 text-xs font-mono rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                      : 'bg-[#0d1117] border-[#30363d] text-white placeholder-slate-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filter Cells */}
              <div className={`flex items-center border rounded-xl text-xs font-mono p-1 overflow-x-auto max-w-full ${
                isLight ? 'border-slate-300/80 bg-white/80 shadow-xs' : 'border-[#30363d] bg-[#0d1117]'
              }`}>
                {([
                  { id: 'all', label: `All (${categoryCounts.all})` },
                  { id: 'Physical', label: `Physical (${categoryCounts.Physical})` },
                  { id: 'Digital', label: `Digital (${categoryCounts.Digital})` },
                  { id: 'Business', label: `Business (${categoryCounts.Business})` },
                  { id: 'Show & Tell', label: `Show & Tell (${categoryCounts['Show & Tell']})` },
                  { id: 'Robotics', label: `Robotics (${categoryCounts.Robotics})` },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedZone(tab.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap active:scale-[0.97] tabular-nums ${
                      selectedZone === tab.id
                        ? 'bg-[#238636] text-white font-bold shadow-xs'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-[#8b949e] hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle: Grid vs Hanging Picture Rail */}
              <div className={`flex items-center border rounded-xl p-1 shrink-0 ${
                isLight ? 'border-slate-300/80 bg-white/80 shadow-xs' : 'border-[#30363d] bg-[#0d1117]'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setDirectoryView('grid');
                  }}
                  aria-label="Grid card view"
                  title="Grid Card View"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    directoryView === 'grid'
                      ? 'bg-[#238636] text-white font-bold shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setDirectoryView('rail');
                  }}
                  aria-label="Picture rail gallery view"
                  title="Interactive Hanging Picture Rail View"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    directoryView === 'rail'
                      ? 'bg-[#238636] text-white font-bold shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Photo Rail</span>
                </button>
              </div>
            </div>
          </div>

          {/* High-Density Session Cards Grid OR Picture Rail Gallery */}
          {filteredProjects.length === 0 ? (
            <div className={`mt-8 p-12 text-center border rounded-xl font-mono ${
              isLight ? 'border-slate-300/80 bg-white/60' : 'border-[#30363d] bg-[#0d1117]'
            }`}>
              <p className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                No inventions found matching &ldquo;{searchQuery}&rdquo; {selectedZone !== 'all' ? `in category “${selectedZone}”` : ''}.
              </p>
              <button
                onClick={() => {
                  playClick();
                  setSearchQuery('');
                  setSelectedZone('all');
                }}
                className="mt-4 px-4 py-2 rounded bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : directoryView === 'rail' ? (
            <div className="mt-8 w-full overflow-hidden">
              <PictureRailGallery
                items={projectRailItems}
                eyebrow="INVENTIONS PICTURE RAIL"
                heading={selectedZone === 'all' ? 'All Inventions Gallery' : `${selectedZone} Inventions Gallery`}
                caption="Drag any brass wire to swing the prints along the rail. Click any frame to lift it into 3D view or flip to study specifications."
                className="bg-transparent"
              />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isProjectsLoading ? (
                <ProjectCardSkeleton count={6} />
              ) : (
                filteredProjects.map((p, index) => (
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
                className={`group rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isLight
                    ? 'bg-white/95 border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                    : 'bg-[#0d1117] border-[#21262d] hover:border-[#38424d] hover:shadow-xl'
                }`}
              >
                <div>
                  {/* Small Preview Image Section */}
                  <div className="relative w-full h-36 overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80">
                    <Image
                      src={p.image_url}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index < 3}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

                    {/* Booth & Category Pill */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/80 text-amber-300 border border-white/10 backdrop-blur-md shadow-xs">
                        {p.booth_code}
                      </span>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-black/65 text-slate-200 border border-white/10 backdrop-blur-md">
                        {p.category}
                      </span>
                    </div>

                    {/* Vote count pill */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-mono font-semibold tabular-nums px-2 py-0.5 rounded-md bg-black/80 text-emerald-300 border border-white/10 backdrop-blur-md shadow-xs flex items-center gap-1">
                        <Vote className="w-3 h-3 text-emerald-400" />
                        <span>{p.vote_count}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 pb-2">
                    <h3 className={`text-sm sm:text-base font-semibold font-sans tracking-tight text-balance line-clamp-1 transition-colors ${
                      isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-slate-100 group-hover:text-sky-400'
                    }`}>
                      {p.title.replace(/^.+•\s*/, '')}
                    </h3>
                    <p className={`mt-1.5 text-xs line-clamp-2 leading-relaxed text-pretty ${
                      isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {p.description}
                    </p>

                    {/* Minimal Tech Tokens */}
                    {p.tech_stack && p.tech_stack.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px]">
                        {p.tech_stack.slice(0, 3).map((tech, i) => (
                          <span
                            key={i}
                            className={`px-2.5 py-0.5 rounded-full ${
                              isLight
                                ? 'bg-slate-100 text-slate-600 border border-slate-200/60'
                                : 'bg-[#161b22] text-slate-300 border border-[#21262d]'
                            }`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Minimal Footer */}
                <div className={`p-4 pt-3 border-t flex items-center justify-between text-xs font-mono ${
                  isLight ? 'border-slate-100' : 'border-[#21262d]'
                }`}>
                  <span className={`truncate max-w-[110px] text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {p.members?.join(', ')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectVote(p, e);
                      }}
                      disabled={votedProjectIds.includes(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all shadow-xs active:scale-95 ${
                        votedProjectIds.includes(p.id)
                          ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                          : 'bg-[#238636] hover:bg-[#2ea043] text-white'
                      }`}
                      title={votedProjectIds.includes(p.id) ? `Already voted for ${p.booth_code}` : `Cast verified vote for ${p.booth_code}`}
                    >
                      {votedProjectIds.includes(p.id) ? '✓ Voted' : 'Vote'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(p);
                      }}
                      title={`Copy share link for ${p.booth_code}`}
                      aria-label={`Copy share link for ${p.booth_code}`}
                      className={`text-[11px] font-medium flex items-center justify-center transition-all p-1 rounded-lg active:scale-95 ${
                        isLight
                          ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          : 'text-slate-400 hover:text-white hover:bg-[#161b22]'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectProject(p);
                      }}
                      className={`text-[11px] font-medium flex items-center gap-0.5 transition-all px-2 py-1 rounded-lg active:scale-95 ${
                        isLight
                          ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                          : 'text-slate-300 hover:text-sky-400 hover:bg-[#161b22]'
                      }`}
                    >
                      <span>Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/expo?booth=${p.booth_code}`}
                      onClick={(e) => e.stopPropagation()}
                      title="Explore booth in 3D Virtual Hall"
                      className={`text-[11px] font-medium flex items-center gap-0.5 transition-all px-1.5 py-1 rounded-lg active:scale-95 ${
                        isLight
                          ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          : 'text-sky-400 hover:text-sky-300 hover:bg-sky-950/40'
                      }`}
                    >
                      <span>3D</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/expo"
              className={`inline-flex items-center gap-2 px-6 py-3.5 border font-mono text-xs font-bold uppercase transition-all rounded-xl active:scale-[0.98] ${
                isLight
                  ? 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
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
      <section id="arenas" className={`scroll-mt-16 border-b py-12 transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-transparent' : 'border-[#30363d] bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className={`pb-6 border-b ${isLight ? 'border-slate-200/80' : 'border-[#30363d]'}`}>
            <span className="text-xs font-mono text-[#3fb950] font-bold block mb-1">
              PHYSICAL BLUEPRINT
            </span>
            <h2 className={`text-3xl sm:text-4xl font-black uppercase font-sans tracking-tight ${
              isLight ? 'text-slate-800' : 'text-white'
            }`}>
              The Three Arenas
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Arena 1 */}
            <div className={`p-6 border rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
              isLight
                ? 'border-slate-300/80 bg-white/90 backdrop-blur-md shadow-xs hover:border-sky-400/80 hover:shadow-sky-500/10 hover:shadow-lg'
                : 'border-[#30363d] bg-[#0d1117] hover:border-sky-500/50 hover:shadow-sky-500/10 hover:shadow-lg'
            }`}>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold border ${
                  isLight ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-sky-950/50 border-sky-800/80 text-sky-400'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  ZONE 01 • ST01–ST08
                </span>
                <h3 className={`text-xl font-bold mt-4 font-sans tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Show &amp; Tell Prototypes
                </h3>
                <p className={`mt-2.5 text-xs leading-relaxed font-mono text-pretty ${isLight ? 'text-slate-600' : 'text-[#8b949e]'}`}>
                  Hands-on working prototypes, renewable energy micro-harvesters, clean water filtration,
                  and bio-materials engineered by junior innovators.
                </p>
              </div>
              <div className={`mt-6 pt-4 border-t flex items-center justify-between gap-3 ${isLight ? 'border-slate-200/90' : 'border-[#21262d]'}`}>
                <a
                  href="#projects"
                  onClick={() => setSelectedZone('Show & Tell')}
                  className={`text-xs font-mono font-bold hover:underline transition-colors ${
                    isLight ? 'text-blue-600' : 'text-[#58a6ff]'
                  }`}
                >
                  Browse ST01–ST08 Projects ↓
                </a>
                <Link
                  href="/expo?booth=ST01"
                  className={`flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-[0.96] ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'border-[#30363d] bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>3D Hall</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Arena 2 */}
            <div className={`p-6 border rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
              isLight
                ? 'border-slate-300/80 bg-white/90 backdrop-blur-md shadow-xs hover:border-amber-400/80 hover:shadow-amber-500/10 hover:shadow-lg'
                : 'border-[#30363d] bg-[#0d1117] hover:border-amber-500/50 hover:shadow-amber-500/10 hover:shadow-lg'
            }`}>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold border ${
                  isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-950/50 border-amber-800/80 text-amber-400'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  ZONE 02 • INNOVATION PODS
                </span>
                <h3 className={`text-xl font-bold mt-4 font-sans tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  The Innovation Hub
                </h3>
                <p className={`mt-2.5 text-xs leading-relaxed font-mono text-pretty ${isLight ? 'text-slate-600' : 'text-[#8b949e]'}`}>
                  The flagship hall housing Physical computing (P01-12), Digital AI algorithms (D01-12), and
                  sustainable Business enterprises (B01-07).
                </p>
              </div>
              <div className={`mt-6 pt-4 border-t flex items-center justify-between gap-3 ${isLight ? 'border-slate-200/90' : 'border-[#21262d]'}`}>
                <a
                  href="#projects"
                  onClick={() => setSelectedZone('all')}
                  className="text-xs font-mono font-bold text-[#f0883e] hover:underline transition-colors"
                >
                  Browse Innovation Pods ↓
                </a>
                <Link
                  href="/expo?booth=P01"
                  className={`flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-[0.96] ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'border-[#30363d] bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>3D Hall</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Arena 3 */}
            <div className={`p-6 border rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
              isLight
                ? 'border-slate-300/80 bg-white/90 backdrop-blur-md shadow-xs hover:border-pink-400/80 hover:shadow-pink-500/10 hover:shadow-lg'
                : 'border-[#30363d] bg-[#0d1117] hover:border-pink-500/50 hover:shadow-pink-500/10 hover:shadow-lg'
            }`}>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold border ${
                  isLight ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-pink-950/50 border-pink-800/80 text-pink-400'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  ZONE 03 • ROBOTICS ARENAS
                </span>
                <h3 className={`text-xl font-bold mt-4 font-sans tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Robotics Arena &amp; Drone Pit
                </h3>
                <p className={`mt-2.5 text-xs leading-relaxed font-mono text-pretty ${isLight ? 'text-slate-600' : 'text-[#8b949e]'}`}>
                  Autonomous obstacle-navigating rovers, maze solvers, combat battle-bots, and drone telemetry
                  stations battling in live heats.
                </p>
              </div>
              <div className={`mt-6 pt-4 border-t flex items-center justify-between gap-3 ${isLight ? 'border-slate-200/90' : 'border-[#21262d]'}`}>
                <a
                  href="#projects"
                  onClick={() => setSelectedZone('Robotics')}
                  className="text-xs font-mono font-bold text-[#db61a2] hover:underline transition-colors"
                >
                  Browse Robotics Arenas ↓
                </a>
                <Link
                  href="/expo?booth=R01"
                  className={`flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-[0.96] ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'border-[#30363d] bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>3D Hall</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE VOTING ─── */}
      <section id="voting" className={`scroll-mt-16 border-b py-14 transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-white/30 backdrop-blur-sm' : 'border-[#30363d] bg-[#040711]'
      }`}>
        <div className="max-w-xl mx-auto px-4 flex items-center justify-center">
          <a
            href="#projects"
            onClick={() => playClick()}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Vote className="w-4 h-4" />
            <span>Cast Your Vote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* ─── REAL-TIME NOTIFICATIONS & VIP PASS ─── */}
      <section className={`border-b py-14 transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-[#f1f5f9]/50 backdrop-blur-sm' : 'border-[#30363d] bg-[#000000]'
      }`}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="text-xs font-mono text-[#3fb950] font-bold block mb-2">
            REAL-TIME EVENT ALERTS
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

          <form onSubmit={handleRegister} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto font-mono text-xs">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="visitor@dpsi.in"
              required
              className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                  : 'bg-[#0d1117] border-[#30363d] text-white placeholder-[#8b949e]'
              }`}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#238636] hover:bg-[#2ea043] active:scale-[0.98] text-white font-bold uppercase transition-all rounded-xl shadow-xs"
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

      {/* ─── SUMMIT SCHEDULE (TENTATIVE) ─── */}
      <section id="schedule" className={`scroll-mt-16 py-14 border-b transition-colors duration-300 ${
        isLight ? 'border-slate-200/80 bg-transparent' : 'border-[#30363d] bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b gap-4 ${
            isLight ? 'border-slate-200/80' : 'border-[#30363d]'
          }`}>
            <div>
              <span className="text-xs font-mono text-amber-500 font-bold block mb-1">
                SUMMIT ITINERARY • TENTATIVE
              </span>
              <h2 className={`text-3xl font-black uppercase font-sans tracking-tight ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}>
                Innovation Exhibition Schedule
              </h2>
            </div>

            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold self-start sm:self-auto ${
              isLight
                ? 'border-amber-300 bg-amber-50/80 text-amber-800 shadow-xs'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Timings Tentative</span>
            </div>
          </div>

          <div className={`mt-8 p-8 sm:p-12 rounded-2xl border text-center max-w-2xl mx-auto transition-colors ${
            isLight
              ? 'border-slate-300/80 bg-white/70 shadow-xs'
              : 'border-[#30363d] bg-[#0d1117]/80'
          }`}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-4">
              Schedule &amp; Timings Tentative
            </span>
            <h3 className={`text-xl sm:text-2xl font-bold font-sans tracking-tight ${
              isLight ? 'text-slate-800' : 'text-white'
            }`}>
              Event Schedule &amp; Timings are Tentative
            </h3>
            <p className={`mt-3 text-xs sm:text-sm font-mono leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              The summit program itinerary, session flow, and auditorium timings are currently tentative and subject to confirmation by the organizing committee. All finalized timings and round schedules will be published prior to the exhibition.
            </p>
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
                <Image src="/dps_shield.png" alt="DPS Indirapuram" width={20} height={20} className="h-full w-auto object-contain" />
              </div>
              <span className={isLight ? 'text-slate-700' : 'text-[#8b949e]'}>
                © 2026 Delhi Public School Indirapuram.
              </span>
            </div>
            <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              • Co-Engineered by Ojas Singh (IX-A) &amp; Devansh Grover (VII-H)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/expo" className={`hover:underline ${isLight ? 'text-blue-600 font-semibold' : 'text-white'}`}>
              3D Floor Plan
            </Link>
            <a href="#gallery" className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              Photo View
            </a>
            <a href="#projects" className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              35 Inventions
            </a>
            <a href="#voting" className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              Live Voting
            </a>
            <a href="#schedule" className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              Schedule
            </a>
          </div>
        </div>
      </footer>

      {/* Centered Modals for Project Expansion and Anti-Cheat Voting */}
      <ProjectDetailDrawer />
      <AuthModal />
      <SearchModal />
      <DelegatePassModal />
      <LiveLeaderboard />

      {/* Dynamic Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="floating-toast-alert"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-full bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 text-xs font-mono font-medium shadow-2xl border border-white/10 dark:border-slate-800/20 backdrop-blur-md flex items-center gap-2 max-w-[90vw] pointer-events-none"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
