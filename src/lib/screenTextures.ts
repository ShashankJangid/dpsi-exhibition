import * as THREE from 'three';
import { Project } from '@/types';

// In-memory cache so canvas textures are created once per project and reused
const textureCache = new Map<string, THREE.CanvasTexture>();
let stageTextureCache: THREE.CanvasTexture | null = null;
let showAndTellTextureCache: THREE.CanvasTexture | null = null;

/**
 * Generates an ultra-crisp, high-tech dashboard UI texture for a booth's presentation monitor.
 * Renders in 512x288 (16:9 widescreen) with high contrast for crisp readability in WebGL.
 */
export function getBoothMonitorTexture(project: Project): THREE.CanvasTexture {
  if (textureCache.has(project.id)) {
    return textureCache.get(project.id)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  const categoryColors: Record<string, { bg: string; accent: string; text: string; header: string }> = {
    Physical: { bg: '#0b1120', accent: '#f59e0b', text: '#fef3c7', header: '#b45309' },
    Digital: { bg: '#061325', accent: '#38bdf8', text: '#e0f2fe', header: '#0369a1' },
    Business: { bg: '#061a14', accent: '#34d399', text: '#d1fae5', header: '#047857' },
    'Show & Tell': { bg: '#140c24', accent: '#a78bfa', text: '#ede9fe', header: '#6d28d9' },
    'Robo Race': { bg: '#1c0a0a', accent: '#f87171', text: '#fee2e2', header: '#b91c1c' },
    'Robo Soccer': { bg: '#071818', accent: '#2dd4bf', text: '#ccfbf1', header: '#0f766e' },
  };

  const palette = categoryColors[project.category] || categoryColors['Digital'];

  // 1. Sleek Dark Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 288);
  bgGrad.addColorStop(0, '#030712');
  bgGrad.addColorStop(0.5, palette.bg);
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 288);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 288);
    ctx.stroke();
  }
  for (let y = 0; y < 288; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // 2. Top Header Bar
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(0, 0, 512, 40);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(0, 38, 512, 2);

  // Status indicator dot
  ctx.beginPath();
  ctx.arc(24, 20, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(`DPS INNOVATION FEST 2026`, 38, 24);

  // Stall ID Badge
  ctx.fillStyle = palette.accent;
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`STALL [${project.id.toUpperCase()}]`, 492, 24);
  ctx.textAlign = 'left';

  // 3. Project Title in center
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Segoe UI", system-ui, sans-serif';
  const titleText = project.title.length > 28 ? project.title.substring(0, 26) + '...' : project.title;
  ctx.fillText(titleText, 24, 76);

  // Subtitle / Category Tag
  ctx.fillStyle = palette.accent;
  ctx.font = '600 13px "Segoe UI", system-ui, sans-serif';
  const leadMember = project.members && project.members.length > 0 ? project.members[0] : 'DPS Student Team';
  ctx.fillText(`${project.category.toUpperCase()} • ${leadMember}`, 24, 98);

  // 4. Center High-Tech Cards / Telemetry Simulation
  // Left Card: Live telemetry graph / progress
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.roundRect(24, 116, 260, 145, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('SYSTEM TELEMETRY', 36, 134);

  // Mini live bars / waveform
  const barHeights = [24, 42, 55, 36, 68, 52, 75, 48, 82, 60, 45, 70, 88, 65];
  barHeights.forEach((h, i) => {
    const x = 36 + i * 16;
    const y = 230 - h;
    const barGrad = ctx.createLinearGradient(0, y, 0, 230);
    barGrad.addColorStop(0, palette.accent);
    barGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    ctx.fillStyle = barGrad;
    ctx.fillRect(x, y, 11, h);
  });

  // Metrics readout
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('CPU: 34%', 36, 250);
  ctx.fillText('EFFICIENCY: 97.4%', 130, 250);

  // Right Card: Key Highlights & Live Votes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.roundRect(298, 116, 190, 145, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('AUDIENCE SCORE', 310, 134);

  // Big Vote Number
  ctx.fillStyle = palette.accent;
  ctx.font = 'bold 36px "Segoe UI", sans-serif';
  ctx.fillText(`${project.vote_count || 124}`, 310, 178);

  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  ctx.fillText('VERIFIED VOTES', 310, 194);

  // Interactive Prompt
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.roundRect(310, 210, 166, 36, 4);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CLICK TO INSPECT', 393, 232);
  ctx.textAlign = 'left';

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 16;

  textureCache.set(project.id, texture);
  return texture;
}

/**
 * Generates an ultra-wide, professional Keynote LED Stage Video Wall texture.
 * Replaces cheap flat blue billboards with an authentic Apple/TED-style keynote visual.
 */
export function getStageMediaWallTexture(): THREE.CanvasTexture {
  if (stageTextureCache) return stageTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  // 1. Ultra-deep cinematic backdrop with cyan/amber ambient glow
  const bg = ctx.createLinearGradient(0, 0, 1024, 384);
  bg.addColorStop(0, '#040814');
  bg.addColorStop(0.35, '#08142c');
  bg.addColorStop(0.7, '#0b1b3a');
  bg.addColorStop(1, '#030712');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 384);

  // Subtle radial center highlight
  const radGlow = ctx.createRadialGradient(512, 192, 10, 512, 192, 480);
  radGlow.addColorStop(0, 'rgba(14, 165, 233, 0.18)');
  radGlow.addColorStop(0.5, 'rgba(3, 105, 161, 0.08)');
  radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGlow;
  ctx.fillRect(0, 0, 1024, 384);

  // Subtle architectural grid texture
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 384);
    ctx.stroke();
  }
  for (let y = 0; y < 384; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // 2. Top Broadcast Status Bar
  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.fillRect(0, 0, 1024, 46);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 44, 1024, 2);

  // Live Pulse Dot
  ctx.beginPath();
  ctx.arc(36, 23, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('LIVE BROADCAST • MAIN AUDITORIUM & KEYNOTE STAGE', 54, 28);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('DELHI PUBLIC SCHOOL INDIRAPURAM', 988, 28);
  ctx.textAlign = 'left';

  // 3. Grand Event Typography
  ctx.textAlign = 'center';

  // Overline Badge
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('TECH & ROBOTICS EXPO 2026', 512, 110);
  ctx.letterSpacing = '0px';

  // Main Event Title (Gleaming white with subtle shadow)
  ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('DPSI INNOVATION FEST', 512, 172);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.fillStyle = '#fbbf24';
  ctx.font = '700 20px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('ANNUAL STUDENT INVENTIONS • LIVE DEMONSTRATIONS • GRAND JURY EVALUATION', 512, 215);

  // School crest / credit
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 14px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('Igniting Future Engineers & Innovators • Delhi Public School Indirapuram', 512, 248);

  // 4. Lower Live Ticker
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(48, 290, 928, 56);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 290, 928, 56);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('🏎️ ARENA 1: ROBO SPEEDWAY RAMP CIRCUIT   |   ⚽ ARENA 2: 2v2 AUTONOMOUS ROBO SOCCER MATCH   |   🏆 35 ACTIVE BOOTHS', 512, 324);
  ctx.textAlign = 'left';

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 16;

  stageTextureCache = texture;
  return texture;
}

/**
 * Generates an ultra-crisp, high-resolution texture for the Show & Tell Pavilion overhead banner.
 * Completely eliminates moiré artifacts, SDF aliasing, and Z-fighting distortion.
 */
export function getShowAndTellBannerTexture(): THREE.CanvasTexture {
  if (showAndTellTextureCache) return showAndTellTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  // 1. Sleek deep violet/purple linear gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 160);
  grad.addColorStop(0, '#0f051d');
  grad.addColorStop(0.3, '#2a0e4e');
  grad.addColorStop(0.7, '#381269');
  grad.addColorStop(1, '#0f051d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 160);

  // Glowing neon purple border rim
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 1020, 156);

  // Subtle interior grid accents
  ctx.strokeStyle = 'rgba(192, 132, 252, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 160);
    ctx.stroke();
  }

  // 2. Overline Tag
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 16px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('• JUNIOR & SENIOR INNOVATION SHOWCASE •', 512, 42);
  ctx.letterSpacing = '0px';

  // 3. Grand Banner Title
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
  ctx.shadowBlur = 12;
  ctx.font = '900 44px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('SHOW & TELL PAVILION', 512, 94);
  ctx.shadowBlur = 0;

  // 4. Subline Info
  ctx.fillStyle = '#e9d5ff';
  ctx.font = '600 16px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('BOOTHS ST01 – ST08  •  DELHI PUBLIC SCHOOL INDIRAPURAM', 512, 132);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 16;

  showAndTellTextureCache = texture;
  return texture;
}

const groundPosterTextureCache = new Map<string, THREE.CanvasTexture>();

export function getGroundPosterTexture(
  zone: 'physical' | 'digital' | 'business' | 'show-and-tell' | 'robotics' | 'vertical'
): THREE.CanvasTexture {
  if (groundPosterTextureCache.has(zone)) {
    return groundPosterTextureCache.get(zone)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  const configs: Record<
    string,
    {
      title: string;
      subtitle: string;
      tag: string;
      accent: string;
      accentGlow: string;
      bg1: string;
      bg2: string;
    }
  > = {
    physical: {
      title: 'PHYSICAL COMPUTING',
      subtitle: 'BOOTHS P01 – P12 • SENSORS, EMBEDDED SYSTEMS & HARDWARE',
      tag: 'INNOVATION SECTION 1',
      accent: '#f59e0b',
      accentGlow: '#fbbf24',
      bg1: '#120b02',
      bg2: '#2b1504',
    },
    digital: {
      title: 'DIGITAL SOLUTIONS',
      subtitle: 'BOOTHS D01 – D12 • AI, FULL-STACK SOFTWARE & CLOUD APPS',
      tag: 'INNOVATION SECTION 2',
      accent: '#0284c7',
      accentGlow: '#38bdf8',
      bg1: '#020b18',
      bg2: '#052244',
    },
    business: {
      title: 'BUSINESS & ENTERPRISE',
      subtitle: 'BOOTHS B01 – B08 • STARTUPS, EDTECH & HYDROPONICS',
      tag: 'INNOVATION SECTION 3',
      accent: '#059669',
      accentGlow: '#34d399',
      bg1: '#02120b',
      bg2: '#062d1c',
    },
    vertical: {
      title: 'VERTICAL TECH GALLERY',
      subtitle: '12 ADVANCED HARDWARE, DIGITAL & STARTUP VENTURES',
      tag: 'EAST GALLERY SHOWCASE',
      accent: '#10b981',
      accentGlow: '#6ee7b7',
      bg1: '#041410',
      bg2: '#092e22',
    },
    'show-and-tell': {
      title: 'SHOW & TELL PAVILION',
      subtitle: 'BOOTHS ST01 – ST08 • JUNIOR & SENIOR STUDENT SHOWCASE',
      tag: 'SPECIAL EXHIBIT PAVILION',
      accent: '#9333ea',
      accentGlow: '#c084fc',
      bg1: '#0d041a',
      bg2: '#28084a',
    },
    robotics: {
      title: 'ROBOTICS ARENAS',
      subtitle: 'ROBO SPEEDWAY CIRCUIT • ROBO SOCCER 2v2 STADIUM',
      tag: 'LIVE ARENA COMPETITIONS',
      accent: '#dc2626',
      accentGlow: '#f87171',
      bg1: '#160404',
      bg2: '#380a0a',
    },
  };

  const c = configs[zone] || configs.physical;

  // 1. High-contrast rich dark gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 256);
  grad.addColorStop(0, '#020617');
  grad.addColorStop(0.2, c.bg1);
  grad.addColorStop(0.5, c.bg2);
  grad.addColorStop(0.8, c.bg1);
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 256);

  // Subtle architectural grid texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // 2. High-visibility outer glowing border
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, 1016, 248);

  // Inner subtle neon hairline border
  ctx.strokeStyle = c.accentGlow;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(12, 12, 1000, 232);

  // Corner Accent Brackets
  const cornerLen = 28;
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  // Top-left
  ctx.beginPath();
  ctx.moveTo(4, 4 + cornerLen);
  ctx.lineTo(4, 4);
  ctx.lineTo(4 + cornerLen, 4);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(1020 - cornerLen, 4);
  ctx.lineTo(1020, 4);
  ctx.lineTo(1020, 4 + cornerLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(4, 252 - cornerLen);
  ctx.lineTo(4, 252);
  ctx.lineTo(4 + cornerLen, 252);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(1020 - cornerLen, 252);
  ctx.lineTo(1020, 252);
  ctx.lineTo(1020, 252 - cornerLen);
  ctx.stroke();

  // 3. Category Tag Pill Badge (Top Center)
  ctx.textAlign = 'center';
  ctx.fillStyle = c.accent;
  ctx.font = 'bold 16px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText(`• ${c.tag} •`, 512, 54);
  ctx.letterSpacing = '0px';

  // 4. Grand Main Title (Massive, Bold, Crisp White with colored glow shadow)
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = c.accentGlow;
  ctx.shadowBlur = 14;
  ctx.font = '900 52px "Segoe UI", system-ui, -apple-system, sans-serif';
  ctx.fillText(c.title, 512, 134);
  ctx.shadowBlur = 0;

  // 5. High-Contrast Subtitle
  ctx.fillStyle = c.accentGlow;
  ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(c.subtitle, 512, 186);

  // Decorative bottom bar
  ctx.fillStyle = c.accent;
  ctx.fillRect(256, 214, 512, 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 16;

  groundPosterTextureCache.set(zone, texture);
  return texture;
}
