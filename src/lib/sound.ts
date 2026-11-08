// Lightweight, zero-dependency Web Audio synthesizer
// Adheres to browser autoplay policies by lazily instantiating AudioContext on first user gesture

let audioCtx: AudioContext | null = null;
let soundEnabled = false;

// Initialize on client
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('dpsi_sound_enabled');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  } catch {
    // LocalStorage not available
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('dpsi_sound_enabled', String(soundEnabled));
    } catch {}
  }
  if (spatialMasterGain && audioCtx) {
    try {
      spatialMasterGain.gain.setTargetAtTime(soundEnabled ? 1.0 : 0.0, audioCtx.currentTime, 0.1);
    } catch {}
  }
  if (soundEnabled) {
    playBlip(880);
  }
  return soundEnabled;
}

/**
 * Gentle tactile UI Blip for hover and desk selections
 */
export function playBlip(freq = 640) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {}
}

/**
 * Celebratory melodic chime for voting, achievements, and registration
 */
export function playChime() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const delay = idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.06, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.35);
    });
  } catch {}
}

/**
 * Soft whoosh for camera waypoint fly-throughs & drawer animations
 */
export function playWhoosh() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

/**
 * Tactile crisp click for toggles and UI buttons
 */
export function playClick() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch {}
}

/**
 * Native mobile haptic vibration
 */
export function triggerHaptic(duration = 15) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {}
  }
}

// =========================================================================
// SPATIAL ARENA SOUNDSCAPES & AUDIO HOTSPOTS (Zero-Dependency Web Audio API)
// =========================================================================

interface ZoneAudioNode {
  id: string;
  x: number;
  z: number;
  radius: number;
  masterGain: GainNode;
  oscillators: OscillatorNode[];
}

let spatialNodes: ZoneAudioNode[] | null = null;
let spatialMasterGain: GainNode | null = null;
let spatialInitialized = false;

export function initSpatialAudio(): boolean {
  if (typeof window === 'undefined') return false;
  if (spatialInitialized && spatialNodes) return true;

  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    // Create overall spatial master gain
    spatialMasterGain = ctx.createGain();
    spatialMasterGain.gain.setValueAtTime(soundEnabled ? 1.0 : 0.0, ctx.currentTime);
    spatialMasterGain.connect(ctx.destination);

    // Zone 1: Show & Tell Pavilion (-18, 0) - Shimmering crystal pavilion harmonic
    const z1Gain = ctx.createGain();
    z1Gain.gain.setValueAtTime(0, ctx.currentTime);
    const z1Filter = ctx.createBiquadFilter();
    z1Filter.type = 'bandpass';
    z1Filter.frequency.setValueAtTime(528, ctx.currentTime);
    z1Filter.Q.setValueAtTime(2.5, ctx.currentTime);

    const z1Osc1 = ctx.createOscillator();
    z1Osc1.type = 'sine';
    z1Osc1.frequency.setValueAtTime(264, ctx.currentTime); // C4 fundamental
    const z1Osc2 = ctx.createOscillator();
    z1Osc2.type = 'triangle';
    z1Osc2.frequency.setValueAtTime(528, ctx.currentTime); // C5 harmonic shimmer

    z1Osc1.connect(z1Filter);
    z1Osc2.connect(z1Filter);
    z1Filter.connect(z1Gain);
    z1Gain.connect(spatialMasterGain);

    z1Osc1.start();
    z1Osc2.start();

    // Zone 2: Innovation Hub (8, -7) - Warm futuristic technological drone
    const z2Gain = ctx.createGain();
    z2Gain.gain.setValueAtTime(0, ctx.currentTime);
    const z2Filter = ctx.createBiquadFilter();
    z2Filter.type = 'lowpass';
    z2Filter.frequency.setValueAtTime(380, ctx.currentTime);

    const z2Osc1 = ctx.createOscillator();
    z2Osc1.type = 'sine';
    z2Osc1.frequency.setValueAtTime(164.81, ctx.currentTime); // E3
    const z2Osc2 = ctx.createOscillator();
    z2Osc2.type = 'sine';
    z2Osc2.frequency.setValueAtTime(246.94, ctx.currentTime); // B3 fifth

    z2Osc1.connect(z2Filter);
    z2Osc2.connect(z2Filter);
    z2Filter.connect(z2Gain);
    z2Gain.connect(spatialMasterGain);

    z2Osc1.start();
    z2Osc2.start();

    // Zone 3: Robotics Arena (0, -25) - High-tech servo/track telemetry pulse
    const z3Gain = ctx.createGain();
    z3Gain.gain.setValueAtTime(0, ctx.currentTime);
    const z3Filter = ctx.createBiquadFilter();
    z3Filter.type = 'bandpass';
    z3Filter.frequency.setValueAtTime(220, ctx.currentTime);
    z3Filter.Q.setValueAtTime(3.0, ctx.currentTime);

    const z3Osc1 = ctx.createOscillator();
    z3Osc1.type = 'triangle';
    z3Osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2 sub
    const z3Osc2 = ctx.createOscillator();
    z3Osc2.type = 'sawtooth';
    z3Osc2.frequency.setValueAtTime(220, ctx.currentTime); // A3 telemetry

    z3Osc1.connect(z3Filter);
    z3Osc2.connect(z3Filter);
    z3Filter.connect(z3Gain);
    z3Gain.connect(spatialMasterGain);

    z3Osc1.start();
    z3Osc2.start();

    spatialNodes = [
      { id: 'zone-1', x: -18, z: 0, radius: 20, masterGain: z1Gain, oscillators: [z1Osc1, z1Osc2] },
      { id: 'zone-2', x: 8, z: -7, radius: 24, masterGain: z2Gain, oscillators: [z2Osc1, z2Osc2] },
      { id: 'zone-3', x: 0, z: -25, radius: 20, masterGain: z3Gain, oscillators: [z3Osc1, z3Osc2] },
    ];

    spatialInitialized = true;
    return true;
  } catch {
    return false;
  }
}

/**
 * Dynamic spatial audio attenuation: smoothly adjusts zone audio volumes based on camera coordinates
 */
export function updateSpatialAudio(cameraX: number, cameraZ: number) {
  if (!soundEnabled || !spatialNodes) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const MAX_ZONE_VOLUME = 0.018; // Soft, comfortable background soundscape

  spatialNodes.forEach((node) => {
    const dist = Math.hypot(cameraX - node.x, cameraZ - node.z);
    let targetVol = 0;
    if (dist < node.radius) {
      // Linear falloff within radius
      const factor = 1 - dist / node.radius;
      targetVol = Math.pow(factor, 1.5) * MAX_ZONE_VOLUME;
    }

    try {
      node.masterGain.gain.setTargetAtTime(targetVol, ctx.currentTime, 0.25);
    } catch {}
  });
}

/**
 * Stop and dispose all spatial audio nodes
 */
export function stopSpatialAudio() {
  if (!spatialNodes) return;
  try {
    spatialNodes.forEach((node) => {
      node.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      node.masterGain.disconnect();
    });
    if (spatialMasterGain) {
      spatialMasterGain.disconnect();
    }
  } catch {}
  spatialNodes = null;
  spatialMasterGain = null;
  spatialInitialized = false;
}

