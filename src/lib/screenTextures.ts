import * as THREE from 'three';
import { Project } from '@/types';

// In-memory cache so canvas textures are created once per project and reused
const textureCache = new Map<string, THREE.CanvasTexture>();
let stageTextureCache: THREE.CanvasTexture | null = null;
let auxStageTextureCache: THREE.CanvasTexture | null = null;
let telepresenceTextureCache: THREE.CanvasTexture | null = null;
let tabletControllerTextureCache: THREE.CanvasTexture | null = null;
let citySkylineTextureCache: THREE.CanvasTexture | null = null;
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
  canvas.width = 2048;
  canvas.height = 405;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  // Pure, authentic, executive keynote stage visual — clean, human-designed, and uncluttered
  const renderVisuals = (logoImg?: HTMLImageElement) => {
    const width = 2048;
    const height = 405;
    const centerX = width / 2;

    // 1. Deep cinematic midnight obsidian stage backdrop with atmospheric vignette
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#02050e');
    bg.addColorStop(0.3, '#061226');
    bg.addColorStop(0.5, '#0a1a38');
    bg.addColorStop(0.7, '#061226');
    bg.addColorStop(1, '#02050e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Soft overhead stage spotlight flare
    const spot = ctx.createRadialGradient(centerX, 90, 10, centerX, 120, 560);
    spot.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
    spot.addColorStop(0.5, 'rgba(14, 165, 233, 0.05)');
    spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, width, height);

    // Subtle fine architectural stage grid (whisper-thin, ultra-subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 64; x < width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Outer refined bezel frame
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // 2. Top Header Metadata Bar
    ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
    ctx.fillRect(4, 4, width - 8, 38);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.fillRect(4, 41, width - 8, 1);

    // Header Left
    ctx.textAlign = 'left';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 12px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('DELHI PUBLIC SCHOOL INDIRAPURAM', 36, 26);

    // Header Center
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('ANNUAL SCIENCE & TECHNOLOGY SYMPOSIUM • 2026', centerX, 26);

    // Header Right
    ctx.textAlign = 'right';
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(width - 240, 22, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('MAIN AUDITORIUM • PLENARY STAGE', width - 36, 26);

    // 3. Official DPS Crest / Logo Centerpiece
    const crestY = 100;
    const crestR = 36;

    // Elegant glowing halo around crest
    ctx.beginPath();
    ctx.arc(centerX, crestY, crestR + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, crestY, crestR, 0, Math.PI * 2);
    ctx.fillStyle = '#050c1e';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw authentic logo image if loaded
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, crestY, crestR - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg, centerX - (crestR - 2), crestY - (crestR - 2), (crestR - 2) * 2, (crestR - 2) * 2);
      ctx.restore();
    } else {
      // Instant vector crest fallback
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(centerX, crestY, crestR - 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 15px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DPSI', centerX, crestY + 5);
    }

    // 4. Grand Event Typography — Clean, Bold, Human-Designed
    ctx.textAlign = 'center';

    // Overline Badge
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px monospace';
    ctx.letterSpacing = '3px';
    ctx.fillText('EXCELLENCE IN INNOVATION • RESEARCH • LEADERSHIP', centerX, 172);
    ctx.letterSpacing = '0px';

    // Grand Main Event Title (Gleaming white with subtle elegant ambient glow)
    ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 58px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillText('DPSI INNOVATION FEST', centerX, 240);
    ctx.shadowBlur = 0;

    // Subtitle Theme
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('EXPLORE  •  INVENT  •  INSPIRE', centerX, 280);
    ctx.letterSpacing = '0px';

    // School Motto / Tagline
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('“Service Before Self”   •   Fostering Next-Generation Scientists, Engineers & Visionaries', centerX, 316);

    // 5. Bottom Horizon Divider & Footer Strip
    const footerY = 356;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    ctx.fillRect(4, footerY, width - 8, height - footerY - 4);

    // Golden horizon hairline
    const hairGrad = ctx.createLinearGradient(100, footerY, width - 100, footerY);
    hairGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    hairGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.4)');
    hairGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.6)');
    hairGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
    hairGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = hairGrad;
    ctx.fillRect(100, footerY, width - 200, 1.5);

    // Footer Left
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px monospace';
    ctx.fillText('EXHIBITION SECTORS: PHYSICAL COMPUTING • DIGITAL SOLUTIONS • BUSINESS VENTURES • ROBOTICS', 36, footerY + 28);

    // Footer Right
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px monospace';
    ctx.fillText('CAMPUS INDIRAPURAM • NEW DELHI NCR', width - 36, footerY + 28);
    ctx.textAlign = 'left';
  };

  // Immediate vector render
  renderVisuals();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = 16;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  // Asynchronously load the official DPS crest image and redraw cleanly when ready
  if (typeof window !== 'undefined') {
    const crestImg = new Image();
    crestImg.crossOrigin = 'anonymous';
    crestImg.src = '/dpsi_crest.png';
    crestImg.onload = () => {
      renderVisuals(crestImg);
      texture.needsUpdate = true;
    };
  }

  stageTextureCache = texture;
  return texture;
}

export function getAuxiliaryStageScreenTexture(): THREE.CanvasTexture {
  if (auxStageTextureCache) return auxStageTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 652;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  // Deep cyber background
  const bg = ctx.createLinearGradient(0, 0, 384, 652);
  bg.addColorStop(0, '#020614');
  bg.addColorStop(0.5, '#07152f');
  bg.addColorStop(1, '#020614');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 384, 652);

  // Subtle vertical grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 384; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 652);
    ctx.stroke();
  }
  for (let y = 0; y < 652; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(384, y);
    ctx.stroke();
  }

  // Outer glowing border
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, 378, 646);

  // Header Bar
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(4, 4, 376, 48);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(4, 50, 376, 2);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('⚡ ARENA TELEMETRY HUD', 20, 32);

  // Top Card: Arena Status
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1.5;
  ctx.roundRect(16, 68, 352, 230, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f97316';
  ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('LIVE COMPETITIONS', 32, 98);

  const arenaItems = [
    { label: '🏎️ Speedway Ramps', val: 'CIRCUIT LIVE', col: '#22c55e' },
    { label: '⚽ Robo Soccer 2v2', val: 'MATCH 4 IN PLAY', col: '#38bdf8' },
    { label: '🏆 Lap Record', val: '14.28s (B04)', col: '#fbbf24' },
    { label: '📡 LiDAR Tracking', val: 'LOCK: OPTIMAL', col: '#22c55e' },
  ];

  arenaItems.forEach((item, idx) => {
    const iy = 132 + idx * 38;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 12px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(item.label, 32, iy);

    ctx.textAlign = 'right';
    ctx.fillStyle = item.col;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(item.val, 348, iy);
    ctx.textAlign = 'left';
  });

  // Middle Card: Innovation Sections
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.roundRect(16, 314, 352, 180, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('EXHIBIT HALL SECTORS', 32, 344);

  const sectors = [
    '• Section 1: Physical Computing (P01-P12)',
    '• Section 2: Digital & AI (D01-D12)',
    '• Section 3: Business Ventures (B01-B08)',
    '• Section 4: Show & Tell (ST01-ST08)',
  ];

  sectors.forEach((txt, idx) => {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11.5px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(txt, 32, 376 + idx * 26);
  });

  // Bottom Card: Voting System Call to Action
  ctx.fillStyle = 'rgba(6, 78, 59, 0.3)';
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;
  ctx.roundRect(16, 510, 352, 122, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('VOTING SYSTEM: ONLINE', 32, 538);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '11px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('Click any exhibition stall in the 3D hall to', 32, 564);
  ctx.fillText('inspect engineering hardware, inspect docs,', 32, 584);
  ctx.fillText('and cast your verified delegate vote.', 32, 604);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 16;

  auxStageTextureCache = texture;
  return texture;
}

export function getTelepresenceScreenTexture(): THREE.CanvasTexture {
  if (telepresenceTextureCache) return telepresenceTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  const bg = ctx.createLinearGradient(0, 0, 1024, 576);
  bg.addColorStop(0, '#020612');
  bg.addColorStop(0.5, '#0a1020');
  bg.addColorStop(1, '#020612');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 576);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 46);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 44, 1024, 2);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('DPS INNOVATION SUMMIT • EXECUTIVE JURY BOARDROOM', 24, 28);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('ENCRYPTED TELEPRESENCE FEED [LIVE]', 1000, 28);
  ctx.textAlign = 'left';

  const pwX = 24;
  const pwY = 64;
  const pwW = 630;
  const pwH = 485;

  ctx.fillStyle = '#050b18';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.roundRect(pwX, pwY, pwW, pwH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('SHARED CONTENT: JURY EVALUATION MATRIX', pwX + 24, pwY + 36);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('Project Deliberation & Scoring', pwX + 24, pwY + 74);

  const rows = [
    { name: 'Hardware & Engineering Depth', score: '9.8 / 10', col: '#22c55e' },
    { name: 'Algorithmic Complexity & AI', score: '9.6 / 10', col: '#38bdf8' },
    { name: 'Commercial Viability & Impact', score: '9.2 / 10', col: '#f59e0b' },
    { name: 'Live Demonstration Execution', score: '9.9 / 10', col: '#a855f7' },
  ];

  rows.forEach((r, idx) => {
    const ry = pwY + 120 + idx * 75;
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(pwX + 24, ry, pwW - 48, 58, 6);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 16px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(r.name, pwX + 44, ry + 36);

    ctx.textAlign = 'right';
    ctx.fillStyle = r.col;
    ctx.font = 'bold 18px monospace';
    ctx.fillText(r.score, pwX + pwW - 48, ry + 36);
    ctx.textAlign = 'left';
  });

  const tilesX = 674;
  const tileW = 326;
  const tileH = 75;

  const participants = [
    { name: 'Dr. Deepa Raghavan', role: 'Principal, DPS Indirapuram', col: '#38bdf8' },
    { name: 'Prof. S. Sengupta', role: 'Jury Chair • IIT Delhi', col: '#f59e0b' },
    { name: 'Devansh Grover', role: 'Lead Engineer • Class 7-H', col: '#22c55e' },
    { name: 'Ojas Singh', role: 'Lead Architect • Class 7-I', col: '#a855f7' },
    { name: 'Dr. Ananya Ray', role: 'HOD Computer Science', col: '#38bdf8' },
    { name: 'Guest Jury Panel', role: 'IEEE & Atal Innovation Mission', col: '#fbbf24' },
  ];

  participants.forEach((p, idx) => {
    const ty = pwY + idx * (tileH + 8);

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1;
    ctx.roundRect(tilesX, ty, tileW, tileH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(tilesX + 38, ty + 38, 20, 0, Math.PI * 2);
    ctx.fillStyle = p.col;
    ctx.fill();

    const initials = p.name.split(' ').map(n => n[0]).slice(0, 2).join('');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(initials, tilesX + 38, ty + 43);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(p.name, tilesX + 70, ty + 32);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(p.role, tilesX + 70, ty + 50);

    ctx.beginPath();
    ctx.arc(tilesX + tileW - 20, ty + 38, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  telepresenceTextureCache = texture;
  return texture;
}

/**
 * Generates Desktop Touch Tablet Controller texture (from Image 1's boardroom table).
 */
export function getTabletControllerTexture(): THREE.CanvasTexture {
  if (tabletControllerTextureCache) return tabletControllerTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, 256, 160);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 256, 28);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('BOARDROOM CONTROL', 12, 18);

  const btns = [
    { label: 'MIC ON', bg: '#166534', x: 12, y: 38, w: 110, h: 48 },
    { label: 'CAMERA', bg: '#0369a1', x: 134, y: 38, w: 110, h: 48 },
    { label: 'SHARE', bg: '#1e293b', x: 12, y: 96, w: 110, h: 48 },
    { label: 'VOLUME', bg: '#1e293b', x: 134, y: 96, w: 110, h: 48 },
  ];

  btns.forEach((b) => {
    ctx.fillStyle = b.bg;
    ctx.roundRect(b.x, b.y, b.w, b.h, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 4);
    ctx.textAlign = 'left';
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  tabletControllerTextureCache = texture;
  return texture;
}

/**
 * Generates high-resolution panoramic modern city skyline vista texture (from Image 1).
 * Displays a realistic urban skyline through floor-to-ceiling panoramic glass windows.
 */
export function getCitySkylineTexture(): THREE.CanvasTexture {
  if (citySkylineTextureCache) return citySkylineTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  skyGrad.addColorStop(0, '#738a9c');
  skyGrad.addColorStop(0.35, '#96abbc');
  skyGrad.addColorStop(0.6, '#b8ccd9');
  skyGrad.addColorStop(0.72, '#dbe5ec');
  skyGrad.addColorStop(1, '#c5d5e2');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  for (let i = 0; i < 18; i++) {
    const cx = (i * 130 + 50) % 2048;
    const cy = 80 + (i % 5) * 50;
    ctx.beginPath();
    ctx.arc(cx, cy, 90 + (i % 4) * 35, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#a4b7c6';
  ctx.beginPath();
  ctx.moveTo(0, 680);
  for (let x = 0; x <= 2048; x += 128) {
    ctx.lineTo(x, 650 + Math.sin(x * 0.005) * 30);
  }
  ctx.lineTo(2048, 1024);
  ctx.lineTo(0, 1024);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#6f8396';
  for (let x = 0; x < 2048; x += 35) {
    const bWidth = 28 + (x % 4) * 8;
    const bHeight = 180 + (Math.sin(x * 0.02) * 110) + ((x * 13) % 140);
    const by = 750 - bHeight;
    ctx.fillRect(x, by, bWidth, bHeight + 300);

    if (x % 5 === 0) {
      ctx.fillRect(x + bWidth / 2 - 1.5, by - 45, 3, 45);
    }
  }

  for (let x = 0; x < 2048; x += 48) {
    const bWidth = 38 + (x % 3) * 12;
    const bHeight = 260 + (Math.cos(x * 0.015) * 160) + ((x * 17) % 200);
    const by = 820 - bHeight;

    const bGrad = ctx.createLinearGradient(x, by, x + bWidth, by);
    bGrad.addColorStop(0, '#3a4a58');
    bGrad.addColorStop(0.5, '#4e6274');
    bGrad.addColorStop(1, '#2c3945');
    ctx.fillStyle = bGrad;
    ctx.fillRect(x, by, bWidth, bHeight + 250);

    ctx.fillStyle = 'rgba(230, 242, 255, 0.45)';
    const winCols = Math.floor(bWidth / 7);
    const winRows = Math.floor(bHeight / 9);
    for (let r = 2; r < winRows - 2; r += 2) {
      for (let c = 1; c < winCols - 1; c++) {
        if ((r + c + x) % 3 !== 0) {
          ctx.fillRect(x + 4 + c * 7, by + 10 + r * 9, 4, 5);
        }
      }
    }

    ctx.fillStyle = '#25303a';
    ctx.fillRect(x + 6, by - 14, bWidth - 12, 14);

    if (x % 3 === 0) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + bWidth / 2 - 1.5, by - 65, 3, 51);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x + bWidth / 2, by - 66, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#202932';
  ctx.fillRect(0, 920, 2048, 104);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  citySkylineTextureCache = texture;
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
