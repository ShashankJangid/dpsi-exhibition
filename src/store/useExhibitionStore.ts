import { create } from 'zustand';
import { Project, CategoryType, CameraViewConfig } from '@/types';
import { SEED_PROJECTS } from '@/data/seedProjects';

export type NavZoneId =
  | 'overview'
  | 'blueprint'
  | 'zone-1'
  | 'zone-2'
  | 'zone-3'
  | 'physical'
  | 'digital'
  | 'business';

export type ThemeMode = 'light' | 'dark';

export const CAMERA_PRESETS: Record<NavZoneId, CameraViewConfig> = {
  // Balanced isometric perspective capturing Show & Tell, Main Hall, and Robotics with clear depth
  overview: {
    position: [7, 36, 30],
    target: [7, 0.5, -6],
  },
  blueprint: {
    // True architectural top-down floor plan view matching the uploaded blueprint
    position: [7, 48, -6.001],
    target: [7, 0.0, -6],
  },
  'zone-1': {
    // Show & Tell angled pavilion (eye-level close-up showcasing the desks and kiosks)
    position: [-16, 7.5, 4.5],
    target: [-16, 0.8, -3.5],
  },
  'zone-2': {
    // Main Hall comprehensive view
    position: [8.5, 13.5, 14],
    target: [8.5, 0.8, -4],
  },
  'zone-3': {
    // Robotics arenas & top concourse (angled downward into the speedway and soccer pitch)
    position: [8.5, 9.0, -13],
    target: [8.5, 0.8, -24.5],
  },
  physical: {
    // Physical Booths P01-P12 close-in aisle view looking directly at the booths
    position: [8.5, 5.5, -3.5],
    target: [8.5, 0.8, -10.5],
  },
  digital: {
    // Digital Booths D01-D12 close-in aisle view
    position: [8.5, 5.5, 2.5],
    target: [8.5, 0.8, -4.5],
  },
  business: {
    // Business Booths B01-B07 close-in aisle view
    position: [8.5, 5.5, 8.5],
    target: [8.5, 0.8, 1.5],
  },
};

export const MOBILE_CAMERA_PRESETS: Record<NavZoneId, CameraViewConfig> = {
  overview: {
    position: [7, 46, 40],
    target: [7, 0.5, -6],
  },
  blueprint: {
    position: [7, 60, -6.001],
    target: [7, 0.0, -6],
  },
  'zone-1': {
    position: [-16, 11, 7],
    target: [-16, 0.8, -3.5],
  },
  'zone-2': {
    position: [8.5, 18, 17],
    target: [8.5, 0.8, -4],
  },
  'zone-3': {
    position: [8.5, 13, -11],
    target: [8.5, 0.8, -24.5],
  },
  physical: {
    position: [8.5, 8.5, -1],
    target: [8.5, 0.8, -10.5],
  },
  digital: {
    position: [8.5, 8.5, 5],
    target: [8.5, 0.8, -4.5],
  },
  business: {
    position: [8.5, 8.5, 11],
    target: [8.5, 0.8, 1.5],
  },
};

export interface ExhibitionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface ExhibitionState {
  // Navigation & 3D view
  theme: ThemeMode;
  isMobile: boolean;
  activeZone: NavZoneId;
  selectedProject: Project | null;
  cameraConfig: CameraViewConfig;
  viewMode: '3d' | '2d';
  isLeaderboardOpen: boolean;
  isDrawerOpen: boolean;
  isSegmentInspectorOpen: boolean;
  isAuthModalOpen: boolean;
  isSearchOpen: boolean;
  isSearchModalOpen: boolean;
  isMobileMenuOpen: boolean;
  activeLeaderboardTab: CategoryType | 'All';

  // Projects & Live Data
  projects: Project[];
  votedProjectIds: string[];
  user: ExhibitionUser | null;
  deviceFingerprint: string | null;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setIsMobile: (isMobile: boolean) => void;
  setActiveZone: (zone: NavZoneId) => void;
  setSegmentInspectorOpen: (open: boolean) => void;
  selectProject: (project: Project | null) => void;
  selectNextProject: () => void;
  selectPrevProject: () => void;
  setViewMode: (mode: '3d' | '2d') => void;
  setLeaderboardOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setActiveLeaderboardTab: (tab: CategoryType | 'All') => void;
  setDeviceFingerprint: (fingerprint: string) => void;
  setUser: (user: ExhibitionUser | null) => void;
  markProjectVoted: (projectId: string) => void;
  incrementProjectVote: (projectId: string) => void;
  setProjects: (projects: Project[]) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetToOverview: () => void;
}

export const useExhibitionStore = create<ExhibitionState>((set, get) => ({
  theme: 'light',
  isMobile: false,
  activeZone: 'overview',
  selectedProject: null,
  cameraConfig: CAMERA_PRESETS.overview,
  viewMode: '3d',
  isLeaderboardOpen: false,
  isDrawerOpen: false,
  isSegmentInspectorOpen: false,
  isAuthModalOpen: false,
  isSearchOpen: false,
  isSearchModalOpen: false,
  isMobileMenuOpen: false,
  activeLeaderboardTab: 'All',

  projects: SEED_PROJECTS,
  votedProjectIds: [],
  user: null,
  deviceFingerprint: null,

  setIsMobile: (isMobile) => {
    set({ isMobile });
  },

  setActiveZone: (zone) => {
    const isMobile = get().isMobile;
    const presets = isMobile ? MOBILE_CAMERA_PRESETS : CAMERA_PRESETS;
    const config = presets[zone] || presets.overview;
    const shouldOpenInspector = zone !== 'overview' && zone !== 'blueprint';
    set({
      activeZone: zone,
      cameraConfig: config,
      selectedProject: null,
      isDrawerOpen: false,
      isSegmentInspectorOpen: shouldOpenInspector,
      isMobileMenuOpen: false,
    });
  },

  setSegmentInspectorOpen: (open) => {
    set({ isSegmentInspectorOpen: open });
  },

  selectProject: (project) => {
    if (!project) {
      set({
        selectedProject: null,
        isDrawerOpen: false,
      });
      return;
    }

    const isMobile = get().isMobile;
    const rotY = project.rotation_y || 0;
    // Dynamic trigonometry camera placement: always positions camera directly in front of the outward-facing counter desk!
    const camDist = isMobile ? 6.2 : 5.2;
    const camHeight = isMobile ? 3.2 : 2.6;

    const boothCamera: CameraViewConfig = {
      position: [
        project.position_x + Math.sin(rotY) * camDist,
        project.position_y + camHeight,
        project.position_z + Math.cos(rotY) * camDist,
      ],
      target: [
        project.position_x,
        project.position_y + (isMobile ? 0.7 : 0.9),
        project.position_z,
      ],
    };

    set({
      selectedProject: project,
      activeZone: project.zone,
      cameraConfig: boothCamera,
      isDrawerOpen: true,
      isSegmentInspectorOpen: false,
      isSearchOpen: false,
      isMobileMenuOpen: false,
    });
  },

  selectNextProject: () => {
    const { projects, selectedProject } = get();
    if (!projects || projects.length === 0) return;
    if (!selectedProject) {
      get().selectProject(projects[0]);
      return;
    }
    const currentIndex = projects.findIndex((p) => p.id === selectedProject.id);
    const nextIndex = (currentIndex + 1) % projects.length;
    get().selectProject(projects[nextIndex]);
  },

  selectPrevProject: () => {
    const { projects, selectedProject } = get();
    if (!projects || projects.length === 0) return;
    if (!selectedProject) {
      get().selectProject(projects[projects.length - 1]);
      return;
    }
    const currentIndex = projects.findIndex((p) => p.id === selectedProject.id);
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    get().selectProject(projects[prevIndex]);
  },

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('dpsi_expo_theme', theme);
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      } catch (e) {
        console.warn('Storage error:', e);
      }
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },

  setViewMode: (mode) => set({ viewMode: mode, isMobileMenuOpen: false }),
  setLeaderboardOpen: (open) => set({ isLeaderboardOpen: open }),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open, isSearchModalOpen: open }),
  setSearchModalOpen: (open) => set({ isSearchOpen: open, isSearchModalOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setActiveLeaderboardTab: (tab) => set({ activeLeaderboardTab: tab }),
  setDeviceFingerprint: (fingerprint) => set({ deviceFingerprint: fingerprint }),
  setUser: (user) => set({ user }),

  markProjectVoted: (projectId) => {
    const current = get().votedProjectIds;
    if (!current.includes(projectId)) {
      set({ votedProjectIds: [...current, projectId] });
    }
  },

  incrementProjectVote: (projectId) => {
    const updated = get().projects.map((p) =>
      p.id === projectId ? { ...p, vote_count: p.vote_count + 1 } : p
    );
    const selected = get().selectedProject;
    set({
      projects: updated,
      selectedProject:
        selected && selected.id === projectId
          ? { ...selected, vote_count: selected.vote_count + 1 }
          : selected,
    });
  },

  setProjects: (incoming) => {
    if (!incoming || incoming.length === 0) return;
    const seedMap = new Map(SEED_PROJECTS.map((sp) => [sp.id.toLowerCase(), sp]));
    const complete = incoming.map((inc) => {
      const sp = seedMap.get(inc.id.toLowerCase());
      if (sp) {
        return {
          ...sp,
          ...inc,
          position_x: sp.position_x,
          position_y: sp.position_y,
          position_z: sp.position_z,
          rotation_y: sp.rotation_y,
          zone: sp.zone,
        };
      }
      return inc;
    });
    const incMap = new Map(complete.map((p) => [p.id.toLowerCase(), p]));
    const fullList = SEED_PROJECTS.map((sp) => incMap.get(sp.id.toLowerCase()) || sp);
    set({ projects: fullList });
  },

  zoomIn: () => {
    const current = get().cameraConfig;
    const factor = 0.75;
    const newPos: [number, number, number] = [
      current.target[0] + (current.position[0] - current.target[0]) * factor,
      Math.max(5, current.target[1] + (current.position[1] - current.target[1]) * factor),
      current.target[2] + (current.position[2] - current.target[2]) * factor,
    ];
    set({ cameraConfig: { position: newPos, target: current.target } });
  },

  zoomOut: () => {
    const current = get().cameraConfig;
    const factor = 1.3;
    const newPos: [number, number, number] = [
      current.target[0] + (current.position[0] - current.target[0]) * factor,
      Math.min(180, current.target[1] + (current.position[1] - current.target[1]) * factor),
      current.target[2] + (current.position[2] - current.target[2]) * factor,
    ];
    set({ cameraConfig: { position: newPos, target: current.target } });
  },

  resetToOverview: () => {
    get().setActiveZone('overview');
  },
}));
