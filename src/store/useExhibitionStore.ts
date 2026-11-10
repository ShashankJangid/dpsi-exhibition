import { create } from 'zustand';
import { Project, CategoryType, CameraViewConfig } from '../types';
import { SEED_PROJECTS } from '../data/seedProjects';

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
  // Convenient, optimized initial entrance spawning position looking directly into the open 3D Hall
  overview: {
    position: [0.8, 7.5, 18.5],
    target: [0.8, 1.6, -10.0],
  },
  blueprint: {
    // True architectural top-down floor plan view centered over the entire hall
    position: [-2.0, 42.0, -12.001],
    target: [-2.0, 0.0, -12.0],
  },
  'zone-1': {
    // Show & Tell angled pavilion (eye-level perspective looking directly down the central promenade of ST01-ST08)
    position: [-9.5, 3.8, -2.8],
    target: [-19.5, 1.2, -3.2],
  },
  'zone-2': {
    // Main Hall comprehensive elevated overview
    position: [8.5, 10.5, 13.5],
    target: [8.5, 1.2, -6.5],
  },
  'zone-3': {
    // Robotics arenas grandstand view: directly in front of the concourse rail with full symmetrical view of both Arenas
    position: [10.4, 4.6, -16.8],
    target: [10.4, 1.2, -26.0],
  },
  physical: {
    // Physical Computing aisle view: directly down the center aisle of P01-P12
    position: [-2.2, 3.5, -11.25],
    target: [9.0, 1.1, -11.25],
  },
  digital: {
    // Digital Solutions aisle view: clear perspective right into the D01-D12 stores
    position: [-2.2, 3.5, -6.0],
    target: [9.0, 1.1, -6.0],
  },
  business: {
    // Business Ventures & Vertical Line view: comprehensive perspective looking into B01-B08 and the 12 vertical stalls
    position: [12.0, 5.2, 14.5],
    target: [20.5, 1.2, 2.5],
  },
};

export const MOBILE_CAMERA_PRESETS: Record<NavZoneId, CameraViewConfig> = {
  overview: {
    position: [0.8, 10.5, 23.5],
    target: [0.8, 1.6, -10.0],
  },
  blueprint: {
    position: [-2.0, 55.0, -12.001],
    target: [-2.0, 0.0, -12.0],
  },
  'zone-1': {
    position: [-8.5, 4.6, -2.8],
    target: [-19.5, 1.2, -3.2],
  },
  'zone-2': {
    position: [8.5, 14.0, 18.0],
    target: [8.5, 1.2, -6.5],
  },
  'zone-3': {
    position: [10.4, 6.2, -15.2],
    target: [10.4, 1.2, -26.0],
  },
  physical: {
    position: [-2.2, 4.2, -11.25],
    target: [9.0, 1.1, -11.25],
  },
  digital: {
    position: [-2.2, 4.2, -6.0],
    target: [9.0, 1.1, -6.0],
  },
  business: {
    position: [11.0, 7.5, 17.0],
    target: [20.5, 1.2, 2.5],
  },
};

export interface ExhibitionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface TourStop {
  id: string;
  title: string;
  subtitle: string;
  zone: NavZoneId;
  camera: CameraViewConfig;
  durationMs: number;
}

export const TOUR_STOPS: TourStop[] = [
  {
    id: 'welcome',
    title: 'Executive Grand Concourse',
    subtitle: 'Panoramic skyline windows, attendee check-in desks, and architectural oak flooring.',
    zone: 'overview',
    camera: {
      position: [-16, 12, 18],
      target: [-1, 1, 0],
    },
    durationMs: 8000,
  },
  {
    id: 'stage',
    title: 'Summit Keynote Stage',
    subtitle: 'Central 16:9 presentation board, speaker podium, and dual telemetry repeater screens.',
    zone: 'overview',
    camera: {
      position: [-1, 7.5, -9],
      target: [-1, 3.5, -20.5],
    },
    durationMs: 8000,
  },
  {
    id: 'physical',
    title: 'Physical Tech & IoT Aisle',
    subtitle: 'Hardware engineering prototypes, clean energy systems, and smart embedded sensors (P01–P12).',
    zone: 'physical',
    camera: {
      position: [9.5, 6.0, -4.5],
      target: [9.5, 0.9, -12.5],
    },
    durationMs: 8500,
  },
  {
    id: 'digital',
    title: 'Digital Solutions Aisle',
    subtitle: 'AI software, mobile apps, computer vision models, and cloud-native applications (D01–D12).',
    zone: 'digital',
    camera: {
      position: [9.5, 6.0, 2.0],
      target: [9.5, 0.9, -4.5],
    },
    durationMs: 8500,
  },
  {
    id: 'business',
    title: 'Business Ventures & EdTech',
    subtitle: 'Student startups, commercial enterprise models, and sustainable venture solutions (B01–B07).',
    zone: 'business',
    camera: {
      position: [9.5, 6.0, 9.0],
      target: [9.5, 0.9, 2.5],
    },
    durationMs: 8000,
  },
  {
    id: 'robotics',
    title: 'Robotics Speedway & Stadium',
    subtitle: 'Autonomous high-speed racing circuit and competitive robotic soccer stadium.',
    zone: 'zone-3',
    camera: {
      position: [0, 11.5, -18],
      target: [0, 0.8, -36],
    },
    durationMs: 8500,
  },
];

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

  // Guided Tour & Sound
  isTourActive: boolean;
  tourStepIndex: number;
  isSoundMuted: boolean;
  isDelegatePassOpen: boolean;

  // Live Minimap & Camera Tracking
  liveCameraPos: [number, number];
  liveCameraTarget: [number, number];
  isMinimapOpen: boolean;

  // Performance, WebGL & Fallbacks
  isLowPerformanceMode: boolean;
  webglFallbackNotice: string | null;

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

  // Tour & Sound Actions
  startTour: () => void;
  stopTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  setDelegatePassOpen: (open: boolean) => void;
  toggleSoundMute: () => void;

  // Live Minimap & Camera Tracking Actions
  setLiveCameraTracking: (pos: [number, number], target: [number, number]) => void;
  setIsMinimapOpen: (open: boolean) => void;
  toggleMinimap: () => void;

  // Performance & WebGL Actions
  setLowPerformanceMode: (low: boolean) => void;
  setWebglFallbackNotice: (notice: string | null) => void;
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

  isTourActive: false,
  tourStepIndex: 0,
  isSoundMuted: true,
  isDelegatePassOpen: false,

  liveCameraPos: [0.8, 18.5],
  liveCameraTarget: [0.8, -10.0],
  isMinimapOpen: false,

  isLowPerformanceMode: false,
  webglFallbackNotice: null,

  setLowPerformanceMode: (low) => {
    set({ isLowPerformanceMode: low });
  },
  setWebglFallbackNotice: (notice) => {
    set({ webglFallbackNotice: notice });
  },

  setLiveCameraTracking: (pos, target) => {
    set({ liveCameraPos: pos, liveCameraTarget: target });
  },
  setIsMinimapOpen: (open) => {
    set({ isMinimapOpen: open });
  },
  toggleMinimap: () => {
    set((state) => ({ isMinimapOpen: !state.isMinimapOpen }));
  },

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
    // On mobile, keep 3D view unobstructed so user directly sees the arenas & stores!
    const shouldOpenInspector = !isMobile && zone !== 'overview' && zone !== 'blueprint';
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

  startTour: () => {
    const firstStop = TOUR_STOPS[0];
    set({
      isTourActive: true,
      tourStepIndex: 0,
      activeZone: firstStop.zone,
      cameraConfig: firstStop.camera,
      selectedProject: null,
      isDrawerOpen: false,
      isLeaderboardOpen: false,
      isSearchOpen: false,
      isMobileMenuOpen: false,
    });
  },

  stopTour: () => {
    set({
      isTourActive: false,
      activeZone: 'overview',
      cameraConfig: CAMERA_PRESETS.overview,
    });
  },

  nextTourStep: () => {
    const nextIdx = (get().tourStepIndex + 1) % TOUR_STOPS.length;
    const stop = TOUR_STOPS[nextIdx];
    set({
      tourStepIndex: nextIdx,
      activeZone: stop.zone,
      cameraConfig: stop.camera,
    });
  },

  prevTourStep: () => {
    const prevIdx = (get().tourStepIndex - 1 + TOUR_STOPS.length) % TOUR_STOPS.length;
    const stop = TOUR_STOPS[prevIdx];
    set({
      tourStepIndex: prevIdx,
      activeZone: stop.zone,
      cameraConfig: stop.camera,
    });
  },

  setDelegatePassOpen: (open) => set({ isDelegatePassOpen: open }),
  toggleSoundMute: () => set((state) => ({ isSoundMuted: !state.isSoundMuted })),
}));
