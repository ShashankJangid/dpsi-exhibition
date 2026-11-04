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
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

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

  // 1. Sleek architectural conference backdrop
  const bg = ctx.createLinearGradient(0, 0, 1024, 384);
  bg.addColorStop(0, '#020612');
  bg.addColorStop(0.3, '#07152c');
  bg.addColorStop(0.7, '#081833');
  bg.addColorStop(1, '#020612');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 384);

  // Subtle coordinate grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 384);
    ctx.stroke();
  }
  for (let y = 0; y < 384; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // 2. Top Broadcast Header Bar
  ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
  ctx.fillRect(0, 0, 1024, 40);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 38, 1024, 2);

  // Live Pulse Beacon
  ctx.beginPath();
  ctx.arc(24, 20, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('LIVE KEYNOTE SYMPOSIUM • PLENARY AUDITORIUM', 38, 24);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('DPSI INNOVATION FEST 2026', 1000, 24);
  ctx.textAlign = 'left';

  // 3. LEFT SECTION: WORLD MAP & GLOBAL INNOVATION TELEMETRY (Inspired by Image 2!)
  const mapWidth = 610;
  const mapHeight = 315;
  const mapX = 24;
  const mapY = 52;

  // Map container frame
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.roundRect(mapX, mapY, mapWidth, mapHeight, 8);
  ctx.fill();
  ctx.stroke();

  // Map Title Pill
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('GLOBAL STUDENT COLLABORATION & DEPLOYMENT MAP', mapX + 16, mapY + 24);

  // World Continents Silhouettes
  const drawContinent = (points: [number, number][], fill: string) => {
    ctx.beginPath();
    points.forEach(([px, py], idx) => {
      const sx = mapX + 20 + px * 5.4;
      const sy = mapY + 45 + py * 2.7;
      if (idx === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  // Continents
  drawContinent([[12, 12], [28, 10], [32, 22], [24, 38], [18, 44], [14, 30], [8, 22]], '#1e293b');
  drawContinent([[24, 46], [32, 48], [34, 62], [28, 80], [22, 70], [20, 52]], '#1e293b');
  drawContinent([[44, 12], [54, 10], [58, 22], [48, 28], [42, 20]], '#334155');
  drawContinent([[44, 30], [56, 30], [58, 54], [52, 74], [46, 68], [42, 44]], '#1e293b');
  drawContinent([[56, 10], [84, 12], [90, 32], [78, 50], [64, 48], [58, 30]], '#334155');
  // India (Highlighted in vibrant orange as event epicenter, exactly like Image 2!)
  drawContinent([[64, 34], [72, 34], [70, 48], [66, 52], [63, 42]], '#ea580c');
  drawContinent([[82, 58], [94, 58], [92, 74], [80, 72]], '#1e293b');

  // Interconnected Glowing Arc Lines between Innovation Hubs (Delhi, Tokyo, London, SF, Singapore)
  const hubCoords: [number, number, string][] = [
    [mapX + 382, mapY + 160, 'Delhi (Hub)'],
    [mapX + 145, mapY + 120, 'Silicon Valley'],
    [mapX + 285, mapY + 100, 'London'],
    [mapX + 490, mapY + 125, 'Tokyo'],
    [mapX + 425, mapY + 200, 'Singapore'],
  ];

  hubCoords.forEach(([hx, hy], i) => {
    ctx.beginPath();
    ctx.arc(hx, hy, i === 0 ? 5.5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? '#f97316' : '#38bdf8';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(hx, hy, i === 0 ? 9 : 6, 0, Math.PI * 2);
    ctx.strokeStyle = i === 0 ? 'rgba(249, 115, 22, 0.45)' : 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (i > 0) {
      const [dx, dy] = hubCoords[0];
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      const midX = (dx + hx) / 2;
      const midY = Math.min(dy, hy) - 30;
      ctx.quadraticCurveTo(midX, midY, hx, hy);
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  });

  // Highlight Stats along bottom of Map
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(mapX + 16, mapY + mapHeight - 56, mapWidth - 32, 44);
  ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
  ctx.strokeRect(mapX + 16, mapY + mapHeight - 56, mapWidth - 32, 44);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('35 INNOVATIONS', mapX + 32, mapY + mapHeight - 32);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px monospace';
  ctx.fillText('STUDENT TEAMS', mapX + 32, mapY + mapHeight - 18);

  ctx.fillStyle = '#f97316';
  ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('6 CATEGORIES', mapX + 175, mapY + mapHeight - 32);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px monospace';
  ctx.fillText('PHYSICAL • DIGITAL • BIZ', mapX + 175, mapY + mapHeight - 18);

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('99.4% VERIFIED', mapX + 360, mapY + mapHeight - 32);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px monospace';
  ctx.fillText('JURY ACCURACY', mapX + 360, mapY + mapHeight - 18);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('ROBOTICS ARENAS', mapX + 485, mapY + mapHeight - 32);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px monospace';
  ctx.fillText('LIVE COMPETITIONS', mapX + 485, mapY + mapHeight - 18);

  // 4. RIGHT SECTION: REAL-TIME ANALYTICS CARDS (Matching Image 2!)
  const panelX = mapX + mapWidth + 18;
  const panelWidth = 1024 - panelX - 24;
  const panelHeight = mapHeight;
  const panelY = mapY;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 8);
  ctx.fill();
  ctx.stroke();

  // Panel Title
  ctx.fillStyle = '#f97316';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('SUMMIT METRICS & TELEMETRY', panelX + 16, panelY + 24);

  // Donut Gauge 1 (Evaluation Progress)
  const donutX = panelX + 48;
  const donutY = panelY + 70;
  const rad = 25;

  ctx.beginPath();
  ctx.arc(donutX, donutY, rad, 0, Math.PI * 2);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 7;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(donutX, donutY, rad, -Math.PI / 2, Math.PI * 0.95);
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 7;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('88%', donutX, donutY + 4);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('Jury Progress', donutX + 36, donutY - 4);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('31 / 35 Booths Evaluated', donutX + 36, donutY + 12);

  // Horizontal Category Score Bars
  const catScores = [
    { label: 'Physical Computing', pct: 92, col: '#f59e0b' },
    { label: 'Digital & AI Systems', pct: 96, col: '#0284c7' },
    { label: 'Business & Ventures', pct: 88, col: '#059669' },
    { label: 'Robotics & Arena', pct: 95, col: '#dc2626' },
  ];

  catScores.forEach((cs, idx) => {
    const by = panelY + 122 + idx * 36;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 11px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(cs.label, panelX + 16, by);

    ctx.textAlign = 'right';
    ctx.fillStyle = cs.col;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${cs.pct}%`, panelX + panelWidth - 16, by);
    ctx.textAlign = 'left';

    // Track
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(panelX + 16, by + 5, panelWidth - 32, 6, 3);
    ctx.fill();

    // Bar
    ctx.fillStyle = cs.col;
    ctx.roundRect(panelX + 16, by + 5, (panelWidth - 32) * (cs.pct / 100), 6, 3);
    ctx.fill();
  });

  // Bottom Notice
  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.fillRect(panelX + 12, panelY + panelHeight - 46, panelWidth - 24, 34);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.strokeRect(panelX + 12, panelY + panelHeight - 46, panelWidth - 24, 34);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('📡 LIVE BALLOT STREAM ACTIVE', panelX + 24, panelY + panelHeight - 24);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  stageTextureCache = texture;
  return texture;
}

/**
 * Generates Auxiliary Stage Wall Display texture (flanking side screens from Image 2).
 */
export function getAuxiliaryStageScreenTexture(): THREE.CanvasTexture {
  if (auxStageTextureCache) return auxStageTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  const bg = ctx.createLinearGradient(0, 0, 512, 384);
  bg.addColorStop(0, '#030816');
  bg.addColorStop(1, '#081730');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 384);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 504, 376);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(4, 4, 504, 42);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('SUMMIT OVERVIEW • DPSI 2026', 20, 30);

  ctx.fillStyle = 'rgba(249, 115, 22, 0.15)';
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1.5;
  ctx.roundRect(24, 62, 464, 180, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f97316';
  ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('GLOBAL STUDENT INVENTIONS', 40, 92);
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('• 35 In-person Exhibition Booths', 40, 125);
  ctx.fillText('• High-Speed Autonomous Robot Race Track', 40, 150);
  ctx.fillText('• 2v2 Competitive Robo Soccer Arena', 40, 175);
  ctx.fillText('• Show & Tell Engineering Pavilion', 40, 200);

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1;
  ctx.roundRect(24, 258, 464, 98, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('VOTING SYSTEM STATUS: ONLINE', 40, 288);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('Tap any stall on the interactive floor plan to inspect', 40, 314);
  ctx.fillText('architectural hardware and cast verified delegate ballots.', 40, 334);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  auxStageTextureCache = texture;
  return texture;
}

/**
 * Generates the Telepresence Boardroom Display texture (from Image 1).
 * Features a high-tech video conference grid with remote jury participants and evaluation dashboards.
 */
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
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

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
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  groundPosterTextureCache.set(zone, texture);
  return texture;
}
