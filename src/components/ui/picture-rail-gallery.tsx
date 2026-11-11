"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export type PictureFrameStyle = "black" | "oak" | "white";

export interface PictureRailItem {
  id: string;
  /** Accessible name, caption and detail title. */
  title: string;
  artist?: string;
  year?: string;
  /** Artwork shown behind the glass. */
  image: string;
  /** Width ÷ height of the artwork. Defaults to 0.8 (a 4:5 portrait). */
  aspect?: number;
  /** Frame moulding. Defaults to "black". */
  frame?: PictureFrameStyle;
  /** Adds a bevel-cut mat board around the artwork. */
  mat?: boolean;
  /** Extra wire length in frame units (about -0.1 to 0.3). At 0 every frame hangs on one centre line. */
  drop?: number;
  /** Short wall-label text such as a price. */
  tag?: string;
  /** Lines printed on the gallery label on the back: edition, size, medium… */
  details?: string[];
}

export interface PictureRailGalleryLabels {
  front: string;
  back: string;
  close: string;
  /** Hint printed on the lit print's wall label. */
  open: string;
}

export interface PictureRailGalleryProps extends React.ComponentProps<"section"> {
  items: PictureRailItem[];
  eyebrow?: string;
  heading?: string;
  /** Shown under the wall while no print is lit. */
  caption?: string;
  /** Call to action rendered under the caption. */
  action?: React.ReactNode;
  /** Lights the prints one by one until the visitor interacts. */
  autoplay?: boolean;
  /** Milliseconds each print stays lit during autoplay. */
  interval?: number;
  /** Lit print. Pass a number or null to control it; leave it undefined to let the gallery manage it. */
  active?: number | null;
  onActiveChange?: (index: number | null) => void;
  onOpenChange?: (index: number | null) => void;
  labels?: PictureRailGalleryLabels;
}

const DEFAULT_LABELS: PictureRailGalleryLabels = { front: "Front", back: "Back", close: "Close", open: "Lift to view" };
const PERSPECTIVE = 1200;
const GAP = 0.3;
const BREATH = 0.1;
const MARGIN = 0.05;
const EDGE = 36;
const RAIL_MIN_UNIT = 90;
const RAIL_MAX_UNIT = 150;
const CAROUSEL_MAX_UNIT = 128;
const LIFT_SCALE = 0.06;
/**
 * Chromium rasterizes a layer under a rotated perspective transform at about 1 CSS px, so a lifted print went soft on
 * retina screens. Each frame is laid out at twice its size (CSS zoom) and scaled back inside the same 3D transform:
 * identical geometry, a sharp photo while it tilts.
 */
const SUPERSAMPLE = 2;
const LIFT_GROW = 1.12;
const LIFT_Z = 26;
const TILT_X = -6;
const TILT_Y = 4;
const SWING_MAX = 14;
const SWING_DAMP = 2.2;
const SWING_G = 3900;
const SWING_COUPLING = 0.08;
/** The hand drives the dragged hook directly, so its wire answers about twice as strongly as a nudged neighbour. */
const DRAG_COUPLING = 0.16;
const NEIGHBOUR_KICK = 12;
const DEG = 180 / Math.PI;

const FRAME_BASE = {
  black: "color-mix(in oklab, black 82%, white)",
  oak: "color-mix(in oklab, burlywood 62%, peru)",
  white: "color-mix(in oklab, white 96%, wheat)",
} as const;
const FRAME_RELIEF = {
  black: [-0.45, 0.22, 0.06, -0.14, -0.5, 1],
  oak: [-0.36, 0.18, 0.05, -0.12, -0.42, 1],
  white: [-0.15, 0.05, 0.02, -0.05, -0.2, 0.55],
} as const;
const BRASS = "linear-gradient(to bottom, color-mix(in oklab, gold 35%, white) 0%, color-mix(in oklab, goldenrod 80%, white) 32%, color-mix(in oklab, darkgoldenrod 85%, black) 72%, color-mix(in oklab, darkgoldenrod 55%, black) 100%)";
const BRASS_DIM = "linear-gradient(to bottom, color-mix(in oklab, goldenrod 50%, white) 0%, color-mix(in oklab, darkgoldenrod 78%, black) 38%, color-mix(in oklab, darkgoldenrod 48%, black) 100%)";
const BRASS_SIDE = "linear-gradient(to right, color-mix(in oklab, goldenrod 70%, white), color-mix(in oklab, darkgoldenrod 80%, black) 70%, color-mix(in oklab, darkgoldenrod 50%, black))";
const WARM = "color-mix(in oklab, white 55%, gold)";
const PAPER = "color-mix(in oklab, white 95%, wheat)";
const INK = "color-mix(in oklab, black 84%, white)";

/** When the input happened, not when a busy main thread got to it (falls back to now for epoch-style stamps). */
function stamp(event: { timeStamp: number }) {
  const now = performance.now();
  return event.timeStamp > 0 && event.timeStamp <= now + 1 ? event.timeStamp : now;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function mix(color: string, amount: number) {
  if (amount === 0) return color;
  const keep = Math.round((1 - Math.min(1, Math.abs(amount))) * 1000) / 10;
  return `color-mix(in oklab, ${color} ${keep}%, ${amount > 0 ? "white" : "black"})`;
}

function tone(amount: number) {
  const c = `color-mix(in oklab, ${amount > 0 ? "white" : "black"} ${Math.round(Math.abs(amount) * 100)}%, transparent)`;
  return `linear-gradient(${c}, ${c})`;
}

/** Real walls are never perfect: each frame rests a little crooked (±1.5°). */
function restTilt(i: number) {
  return ((((i * 37 + 11) % 7) - 3) * 0.5);
}

type Shape = { frame: PictureFrameStyle; mold: number; mat: number; matB: number; w: number; h: number };

function shapeOf(item: PictureRailItem): Shape {
  const aspect = clamp(item.aspect ?? 0.8, 0.4, 2.5);
  const frame = item.frame ?? "black";
  const mold = frame === "oak" ? 0.068 : frame === "white" ? 0.058 : 0.046;
  const mat = item.mat ? 0.11 : 0;
  const matB = item.mat ? 0.022 : 0;
  const iw = Math.sqrt(aspect);
  return { frame, mold, mat, matB, w: iw + 2 * (mold + mat), h: 1 / iw + 2 * (mold + mat) + matB };
}

type Layout = { width: number; unit: number; carousel: boolean; railTop: number; railT: number; pivotY: number; tops: number[]; stageH: number };

function layoutFor(shapes: Shape[], drops: number[], width: number): Layout {
  const n = shapes.length;
  const sumW = shapes.reduce((sum, s) => sum + s.w, 0);
  const maxW = shapes.reduce((m, s) => Math.max(m, s.w), 0);
  const fit = n ? (width - 2 * EDGE) / (sumW + Math.max(0, n - 1) * GAP + 2 * BREATH + maxW * (LIFT_GROW - 1)) : RAIL_MAX_UNIT;
  const carousel = fit < RAIL_MIN_UNIT;
  const unit = carousel ? clamp(width * 0.2, 92, CAROUSEL_MAX_UNIT) : Math.min(RAIL_MAX_UNIT, fit);
  const railTop = 6;
  const railT = Math.round(clamp(unit * 0.11, 9, 16));
  const pivotY = railTop + railT + Math.round(unit * 0.045) + 2;
  const maxH = shapes.reduce((m, s) => Math.max(m, s.h), 0) * unit;
  const centre = pivotY + unit * 0.22 + maxH / 2;
  const tops = shapes.map((s, i) => Math.round(Math.max(pivotY + unit * 0.08, centre - (s.h * unit) / 2 + clamp(drops[i] ?? 0, -0.15, 0.6) * unit)));
  const bottom = shapes.reduce((m, s, i) => Math.max(m, (tops[i] ?? 0) + s.h * unit), pivotY);
  return { width, unit, carousel, railTop, railT, pivotY, tops, stageH: Math.round(bottom + 34) };
}

type Sim = {
  x: number[]; vx: number[]; tx: number[];
  sw: number[]; vsw: number[];
  e: number[]; ve: number[]; te: number[];
  ty: number[]; vty: number[]; tty: number[];
  drag: number; grab: number; free: number; last: number; raf: number;
  /** Each hook's position at the last frame and its smoothed real velocity (px/s): what the wire feels. */
  hx: number[]; hv: number[];
};

function emptySim(): Sim {
  return { x: [], vx: [], tx: [], sw: [], vsw: [], e: [], ve: [], te: [], ty: [], vty: [], tty: [], drag: -1, grab: 0, free: 0, last: 0, raf: 0, hx: [], hv: [] };
}

/** Pivot (the rail hook) to the frame's centre, in px. Longer wires swing slower. */
function pendulum(lay: Layout, shape: Shape, i: number) {
  return Math.max(30, (lay.tops[i] ?? 0) - lay.pivotY + (shape.h * lay.unit) / 2);
}

/** Horizontal reach of a hanging frame from its hook, swing and lift included: [left, right]. */
function reach(s: Sim, lay: Layout, shape: Shape, i: number) {
  const e = clamp(s.e[i] ?? 0, 0, 1);
  const half = (shape.w * lay.unit * (1 + (LIFT_GROW - 1) * e)) / 2;
  const top = (lay.tops[i] ?? 0) - lay.pivotY;
  const bottom = top + shape.h * lay.unit;
  const r = (s.sw[i] ?? 0) / DEG;
  const c = Math.cos(r);
  const sn = Math.sin(r);
  return [Math.min(-half * c - top * sn, -half * c - bottom * sn), Math.max(half * c - top * sn, half * c - bottom * sn)] as const;
}

/** Frames can't pass through each other or the rail ends: push apart and share momentum (the step turns the resulting hook motion into swing). */
function resolveContacts(s: Sim, lay: Layout, list: Shape[], margin: number) {
  const n = list.length;
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < n - 1; i++) {
      const a = list[i];
      const b = list[i + 1];
      if (!a || !b) continue;
      const overlap = (s.x[i] ?? 0) + reach(s, lay, a, i)[1] - ((s.x[i + 1] ?? 0) + reach(s, lay, b, i + 1)[0]) + margin;
      if (overlap <= 0) continue;
      if (i === s.drag) s.x[i + 1] = (s.x[i + 1] ?? 0) + overlap;
      else if (i + 1 === s.drag) s.x[i] = (s.x[i] ?? 0) - overlap;
      else { s.x[i] = (s.x[i] ?? 0) - overlap / 2; s.x[i + 1] = (s.x[i + 1] ?? 0) + overlap / 2; }
      const va = s.vx[i] ?? 0;
      const vb = s.vx[i + 1] ?? 0;
      if (va > vb) {
        const shared = (va + vb) / 2;
        if (i !== s.drag) s.vx[i] = shared;
        if (i + 1 !== s.drag) s.vx[i + 1] = shared;
      }
    }
  }
  if (!lay.carousel && n > 0) {
    const lo = 6;
    const hi = lay.width - 6;
    const first = list[0];
    const last = list[n - 1];
    if (first) {
      const l0 = reach(s, lay, first, 0)[0];
      if ((s.x[0] ?? 0) + l0 < lo) { s.x[0] = lo - l0; s.vx[0] = Math.abs(s.vx[0] ?? 0) * 0.3; }
    }
    for (let i = 0; i < n - 1; i++) {
      const a = list[i];
      const b = list[i + 1];
      if (!a || !b) continue;
      const min = (s.x[i] ?? 0) + reach(s, lay, a, i)[1] - reach(s, lay, b, i + 1)[0] + margin;
      if ((s.x[i + 1] ?? 0) < min) s.x[i + 1] = min;
    }
    if (last) {
      const rn = reach(s, lay, last, n - 1)[1];
      if ((s.x[n - 1] ?? 0) + rn > hi) { s.x[n - 1] = hi - rn; s.vx[n - 1] = -Math.abs(s.vx[n - 1] ?? 0) * 0.3; }
    }
    for (let i = n - 2; i >= 0; i--) {
      const a = list[i];
      const b = list[i + 1];
      if (!a || !b) continue;
      const max = (s.x[i + 1] ?? 0) + reach(s, lay, b, i + 1)[0] - reach(s, lay, a, i)[1] - margin;
      if ((s.x[i] ?? 0) > max) s.x[i] = max;
    }
  }
}

export function PictureRailGallery({
  items,
  eyebrow,
  heading,
  caption,
  action,
  autoplay = false,
  interval = 2600,
  active: activeProp,
  onActiveChange,
  onOpenChange,
  labels = DEFAULT_LABELS,
  className,
  ...rest
}: PictureRailGalleryProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = items.length;
  const controlled = activeProp !== undefined;
  const stageRef = React.useRef(null as HTMLDivElement | null);
  const hangs = React.useRef([] as (HTMLDivElement | null)[]);
  const backs = React.useRef([] as (HTMLDivElement | null)[]);
  const swings = React.useRef([] as (HTMLSpanElement | null)[]);
  const slots = React.useRef([] as (HTMLButtonElement | null)[]);
  const tilts = React.useRef([] as (HTMLSpanElement | null)[]);
  const lights = React.useRef([] as (HTMLSpanElement | null)[]);
  const glares = React.useRef([] as (HTMLSpanElement | null)[]);
  const dims = React.useRef([] as (HTMLSpanElement | null)[]);
  const shadows = React.useRef([] as (HTMLSpanElement | null)[]);
  const washes = React.useRef([] as (HTMLSpanElement | null)[]);
  const sim = React.useRef(emptySim());
  const shapes = React.useMemo(() => items.map(shapeOf), [items]);
  const drops = React.useMemo(() => items.map((item) => item.drop ?? 0), [items]);
  const [width, setWidth] = React.useState(0);
  const layout = React.useMemo(() => layoutFor(shapes, drops, width), [shapes, drops, width]);
  const [activeState, setActiveState] = React.useState(null as number | null);
  const requested = React.useRef(undefined as number | null | undefined);
  const raw = controlled ? (activeProp ?? null) : activeState;
  const current = raw !== null && raw >= 0 && raw < count ? raw : null;
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [openIndex, setOpenIndex] = React.useState(null as number | null);
  const [reduced, setReduced] = React.useState(false);
  const [playing, setPlaying] = React.useState(autoplay);
  const [lifted, setLifted] = React.useState(null as number | null);
  const returnFocus = React.useRef(null as number | null);
  const pendingOpen = React.useRef(-1);
  const pointer = React.useRef({ id: -1, index: -1, x: 0, y: 0, moved: false, kind: "", swipe: 0, lastX: 0, lastT: 0, v: 0 });
  const live = React.useRef({ active: null as number | null, layout, shapes, reduced, count, openIndex: null as number | null, carouselIndex: Math.min(1, Math.max(0, count - 1)) });
  live.current = { ...live.current, active: current, layout, shapes, reduced, count, openIndex };
  // Latest host props for stable callbacks: an inline onActiveChange must not restart the autoplay timer on every parent render.
  const host = React.useRef({ controlled, onActiveChange, onOpenChange });
  host.current = { controlled, onActiveChange, onOpenChange };

  const carouselIndex = layout.carousel ? (current ?? live.current.carouselIndex) : null;

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => { setPlaying(autoplay); }, [autoplay]);

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = (next: number) => setWidth((old) => (Math.abs(old - next) < 0.5 ? old : Math.round(next * 100) / 100));
    measure(stage.clientWidth);
    const observer = new ResizeObserver((entries) => { const box = entries[0]; if (box) measure(box.contentRect.width); });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const targetsFor = React.useCallback((lay: Layout, front: number | null, centreIndex: number) => {
    const n = shapes.length;
    const feet = shapes.map((s, i) => s.w * lay.unit * (i === front ? LIFT_GROW : 1));
    const gapAfter = (a: number) => lay.unit * (GAP + (front !== null && (a === front || a + 1 === front) ? BREATH : 0));
    const xs = feet.map(() => 0);
    if (lay.carousel) {
      const c = clamp(front ?? centreIndex, 0, Math.max(0, n - 1));
      xs[c] = lay.width / 2;
      for (let i = c + 1; i < n; i++) xs[i] = (xs[i - 1] ?? 0) + ((feet[i - 1] ?? 0) + (feet[i] ?? 0)) / 2 + gapAfter(i - 1);
      for (let i = c - 1; i >= 0; i--) xs[i] = (xs[i + 1] ?? 0) - ((feet[i + 1] ?? 0) + (feet[i] ?? 0)) / 2 - gapAfter(i);
      return xs;
    }
    let total = 0;
    for (let i = 0; i < n; i++) total += (feet[i] ?? 0) + (i < n - 1 ? gapAfter(i) : 0);
    let cursor = (lay.width - total) / 2;
    for (let i = 0; i < n; i++) { xs[i] = cursor + (feet[i] ?? 0) / 2; cursor += (feet[i] ?? 0) + gapAfter(i); }
    return xs;
  }, [shapes]);

  const paint = React.useCallback((i: number) => {
    const s = sim.current;
    const { layout: lay, shapes: list, count: n } = live.current;
    const shape = list[i];
    if (!shape) return;
    const w = shape.w * lay.unit;
    const x = s.x[i] ?? 0;
    const theta = s.sw[i] ?? 0;
    const e = clamp(s.e[i] ?? 0, 0, 1.2);
    const lit = clamp(e, 0, 1);
    // Flat against the wall a frame can't turn; it faces the pointer only as far as it has lifted off.
    const ty = (s.ty[i] ?? 0) * lit;
    const left = `translate3d(${(x - w / 2).toFixed(2)}px,0,0)`;
    const hang = hangs.current[i];
    if (hang) hang.style.transform = left;
    const back = backs.current[i];
    if (back) back.style.transform = `${left} rotate(${theta.toFixed(3)}deg)`;
    const swing = swings.current[i];
    if (swing) swing.style.transform = `rotate(${theta.toFixed(3)}deg)`;
    const tilt = tilts.current[i];
    if (tilt) tilt.style.transform = `perspective(${PERSPECTIVE}px) translateZ(${(LIFT_Z * e).toFixed(2)}px) rotateX(${(TILT_X * e).toFixed(3)}deg) rotateY(${ty.toFixed(3)}deg) scale(${((1 + LIFT_SCALE * e) / SUPERSAMPLE).toFixed(4)})`;
    const light = lights.current[i];
    if (light) light.style.opacity = lit.toFixed(3);
    const wash = washes.current[i];
    if (wash) wash.style.opacity = lit.toFixed(3);
    const glare = glares.current[i];
    if (glare) glare.style.transform = `translate3d(${(-ty * 3 - theta * 1.6).toFixed(2)}%,0,0)`;
    const shadow = shadows.current[i];
    if (shadow) {
      shadow.style.transform = `translate3d(${(-ty * 1.4).toFixed(2)}px,${(lay.unit * 0.04 + 10 * e).toFixed(2)}px,0) scale(${(1 + 0.035 * e).toFixed(4)},${(1 + 0.07 * e).toFixed(4)})`;
      shadow.style.opacity = (1 - 0.3 * lit).toFixed(3);
    }
    let others = 0;
    for (let k = 0; k < n; k++) if (k !== i) others = Math.max(others, s.e[k] ?? 0);
    const dim = dims.current[i];
    if (dim) dim.style.opacity = (0.08 * clamp(others, 0, 1) * (1 - lit)).toFixed(4);
  }, []);

  const step = React.useCallback((now: number) => {
    const s = sim.current;
    const { layout: lay, shapes: list, count: n } = live.current;
    // Keep real time when frames come slowly (a busy screen recorder, a slow phone): up to 100 ms a frame, in sub-steps of at most 11.5 ms.
    const dt = s.last ? Math.min(0.1, (now - s.last) / 1000) : 1 / 60;
    s.last = now;
    const sub = Math.max(3, Math.ceil(dt / 0.0115));
    const h = dt / sub;
    const margin = MARGIN * lay.unit;
    const restoring = now > s.free;
    for (let k = 0; k < sub; k++) {
      for (let i = 0; i < n; i++) {
        const shape = list[i];
        if (!shape) continue;
        const len = pendulum(lay, shape, i);
        if (i !== s.drag) {
          const before = s.vx[i] ?? 0;
          const stiff = restoring ? 130 : 0;
          const damp = restoring ? 2 * Math.sqrt(130) * 0.86 : 3.2;
          const ax = -stiff * ((s.x[i] ?? 0) - (s.tx[i] ?? 0)) - damp * before;
          s.vx[i] = before + ax * h;
          s.x[i] = (s.x[i] ?? 0) + (s.vx[i] ?? 0) * h;
        }
        const ae = -150 * ((s.e[i] ?? 0) - (s.te[i] ?? 0)) - 2 * Math.sqrt(150) * 0.78 * (s.ve[i] ?? 0);
        s.ve[i] = (s.ve[i] ?? 0) + ae * h;
        s.e[i] = (s.e[i] ?? 0) + (s.ve[i] ?? 0) * h;
        const at = -110 * ((s.ty[i] ?? 0) - (s.tty[i] ?? 0)) - 2 * Math.sqrt(110) * 0.72 * (s.vty[i] ?? 0);
        s.vty[i] = (s.vty[i] ?? 0) + at * h;
        s.ty[i] = (s.ty[i] ?? 0) + (s.vty[i] ?? 0) * h;
        const rest = restTilt(i) * (1 - clamp(s.e[i] ?? 0, 0, 1));
        const as = -(SWING_G / len) * ((s.sw[i] ?? 0) - rest) - SWING_DAMP * (s.vsw[i] ?? 0);
        s.vsw[i] = (s.vsw[i] ?? 0) + as * h;
        s.sw[i] = clamp((s.sw[i] ?? 0) + (s.vsw[i] ?? 0) * h, -SWING_MAX, SWING_MAX);
      }
      resolveContacts(s, lay, list, margin);
    }
    // Every hook's real motion this frame (the hand, a shove from a neighbour, a rail-end stop, the spring home) swings its wire when it speeds up, slows or stops.
    const follow = 1 - Math.exp(-dt / 0.035);
    for (let i = 0; i < n; i++) {
      const shape = list[i];
      const x = s.x[i] ?? 0;
      const was = s.hv[i] ?? 0;
      const hv = was + ((x - (s.hx[i] ?? x)) / dt - was) * follow;
      s.hx[i] = x;
      s.hv[i] = hv;
      if (shape) s.vsw[i] = (s.vsw[i] ?? 0) + clamp((hv - was) * (DEG / pendulum(lay, shape, i)) * (i === s.drag ? DRAG_COUPLING : SWING_COUPLING), -40, 40);
    }
    if (s.drag >= 0) s.vx[s.drag] = s.hv[s.drag] ?? 0;
    let busy = s.drag >= 0 || now < s.free;
    for (let i = 0; i < n; i++) {
      paint(i);
      const rest = restTilt(i) * (1 - clamp(s.e[i] ?? 0, 0, 1));
      if (Math.abs(s.vx[i] ?? 0) > 0.4 || (restoring && Math.abs((s.x[i] ?? 0) - (s.tx[i] ?? 0)) > 0.25) || Math.abs((s.e[i] ?? 0) - (s.te[i] ?? 0)) > 0.002 || Math.abs(s.ve[i] ?? 0) > 0.01 || Math.abs((s.ty[i] ?? 0) - (s.tty[i] ?? 0)) > 0.02 || Math.abs(s.vty[i] ?? 0) > 0.05 || Math.abs((s.sw[i] ?? 0) - rest) > 0.02 || Math.abs(s.vsw[i] ?? 0) > 0.05) busy = true;
    }
    if (busy) s.raf = requestAnimationFrame(step);
    else {
      s.raf = 0;
      s.last = 0;
      for (let i = 0; i < n; i++) {
        if (restoring) s.x[i] = s.tx[i] ?? 0;
        s.hx[i] = s.x[i] ?? 0; s.hv[i] = 0;
        s.vx[i] = 0; s.e[i] = s.te[i] ?? 0; s.ve[i] = 0; s.ty[i] = s.tty[i] ?? 0; s.vty[i] = 0;
        s.sw[i] = restTilt(i) * (1 - clamp(s.e[i] ?? 0, 0, 1)); s.vsw[i] = 0;
        paint(i);
      }
    }
  }, [paint]);

  const kick = React.useCallback(() => {
    const s = sim.current;
    if (live.current.reduced) {
      for (let i = 0; i < live.current.count; i++) {
        s.x[i] = s.tx[i] ?? 0; s.vx[i] = 0; s.hx[i] = s.x[i] ?? 0; s.hv[i] = 0;
        s.e[i] = s.te[i] ?? 0; s.ve[i] = 0;
        s.ty[i] = s.tty[i] ?? 0; s.vty[i] = 0;
        s.sw[i] = restTilt(i) * (1 - clamp(s.e[i] ?? 0, 0, 1)); s.vsw[i] = 0;
        paint(i);
      }
      return;
    }
    if (!s.raf) { s.last = 0; s.raf = requestAnimationFrame(step); }
  }, [paint, step]);

  const impulse = React.useCallback((i: number, amount: number) => {
    const s = sim.current;
    if (live.current.reduced || i < 0 || i >= live.current.count) return;
    s.vsw[i] = (s.vsw[i] ?? 0) + amount;
    kick();
  }, [kick]);

  React.useLayoutEffect(() => {
    if (!layout.width) return;
    const s = sim.current;
    const xs = targetsFor(layout, current, live.current.carouselIndex);
    const fresh = s.x.length !== count;
    for (let i = 0; i < count; i++) {
      s.tx[i] = (xs[i] ?? 0) + (layout.carousel ? pointer.current.swipe : 0);
      s.te[i] = i === current ? 1 : 0;
      if (i !== current) s.tty[i] = 0;
      if (fresh || reduced) {
        s.x[i] = s.tx[i] ?? 0; s.vx[i] = 0; s.hx[i] = s.x[i] ?? 0; s.hv[i] = 0;
        s.e[i] = s.te[i] ?? 0; s.ve[i] = 0;
        s.ty[i] = s.tty[i] ?? 0; s.vty[i] = 0;
        s.sw[i] = restTilt(i) * (1 - (s.e[i] ?? 0)); s.vsw[i] = 0;
      }
    }
    if (fresh) {
      for (const list of [s.x, s.vx, s.tx, s.sw, s.vsw, s.e, s.ve, s.te, s.ty, s.vty, s.tty, s.hx, s.hv]) list.length = count;
    }
    for (let i = 0; i < count; i++) paint(i);
    kick();
  }, [layout, current, count, reduced, targetsFor, paint, kick]);

  const previous = React.useRef(null as number | null);
  React.useEffect(() => {
    const old = previous.current;
    previous.current = current;
    requested.current = undefined;
    if (old === current) return;
    if (current !== null) {
      live.current.carouselIndex = current;
      impulse(current - 1, NEIGHBOUR_KICK);
      impulse(current + 1, -NEIGHBOUR_KICK);
    }
    if (old !== null) { impulse(old - 1, -NEIGHBOUR_KICK * 0.5); impulse(old + 1, NEIGHBOUR_KICK * 0.5); }
  }, [current, impulse]);

  // First scene: a light brush along the rail. A re-measure (resize) must not cancel the remaining impulses, so the timers live in a ref and stop only on unmount.
  const brushed = React.useRef({ done: false, timers: [] as number[] });
  React.useEffect(() => {
    const b = brushed.current;
    if (!layout.width || b.done || reduced) return;
    b.done = true;
    for (let i = 0; i < count; i++) b.timers.push(window.setTimeout(() => impulse(i, 18 - i * 1.2), 140 + i * 60));
  }, [layout.width, reduced, count, impulse]);
  React.useEffect(() => () => {
    const b = brushed.current;
    b.timers.forEach((t) => window.clearTimeout(t));
    b.timers = [];
    b.done = false;
  }, []);

  React.useEffect(() => () => { cancelAnimationFrame(sim.current.raf); sim.current.raf = 0; }, []);

  React.useLayoutEffect(() => {
    if (openIndex !== null || lifted !== null || returnFocus.current === null) return;
    const index = returnFocus.current;
    returnFocus.current = null;
    slots.current[index]?.focus({ preventScroll: true });
  }, [openIndex, lifted]);

  const choose = React.useCallback((index: number | null) => {
    if (index === live.current.active || index === requested.current) return;
    requested.current = index;
    if (!host.current.controlled) setActiveState(index);
    host.current.onActiveChange?.(index);
  }, []);

  const stop = React.useCallback(() => setPlaying(false), []);

  // Autoplay keeps a fixed beat (first print at 1.1 s, then every interval) so a busy main thread can't stretch the cycle.
  const beat = React.useRef(0);
  React.useEffect(() => {
    if (!playing || reduced || openIndex !== null || count === 0 || !layout.width) { beat.current = 0; return; }
    const start = performance.now();
    if (!beat.current || beat.current < start - interval) beat.current = start + (current === null ? 1100 : interval);
    let timer = window.setTimeout(function advance() {
      const now = live.current.active;
      beat.current += interval;
      choose(now === null ? (live.current.layout.carousel ? live.current.carouselIndex : 0) : (now + 1) % live.current.count);
      timer = window.setTimeout(advance, Math.max(0, beat.current - performance.now()));
    }, Math.max(0, beat.current - start));
    return () => window.clearTimeout(timer);
  }, [playing, reduced, openIndex, count, interval, layout.width, choose, current]);

  const open = React.useCallback((index: number) => {
    stop();
    choose(index);
    setOpenIndex(index);
    host.current.onOpenChange?.(index);
  }, [choose, stop]);

  const sourceRect = React.useCallback(() => (openIndex === null ? null : tilts.current[openIndex]?.getBoundingClientRect() ?? null), [openIndex]);
  const onLift = React.useCallback((lift: boolean) => setLifted(lift ? openIndex : null), [openIndex]);
  const onDetailClose = React.useCallback(() => {
    const index = openIndex;
    if (index === null) return;
    returnFocus.current = index;
    setOpenIndex(null);
    host.current.onOpenChange?.(null);
    impulse(index, index % 2 ? 22 : -22);
  }, [openIndex, impulse]);

  function nearest(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage) return null;
    const box = stage.getBoundingClientRect();
    const x = clientX - box.left;
    const y = clientY - box.top;
    const { layout: lay, shapes: list, count: n } = live.current;
    const s = sim.current;
    let best = null as number | null;
    let distance = Infinity;
    for (let i = 0; i < n; i++) {
      const shape = list[i];
      if (!shape) continue;
      const [l, r] = reach(s, lay, shape, i);
      const cx = s.x[i] ?? 0;
      const bottom = (lay.tops[i] ?? 0) + shape.h * lay.unit + 30;
      if (x < cx + l - 4 || x > cx + r + 4 || y < lay.railTop - 4 || y > bottom) continue;
      const d = Math.abs(x - cx);
      if (d < distance) { best = i; distance = d; }
    }
    return best;
  }

  function aim(index: number, clientX: number) {
    const stage = stageRef.current;
    const shape = live.current.shapes[index];
    if (!stage || !shape) return;
    const s = sim.current;
    const local = clientX - stage.getBoundingClientRect().left;
    const half = (shape.w * live.current.layout.unit) / 2;
    for (let i = 0; i < live.current.count; i++) s.tty[i] = i === index ? clamp((local - (s.x[index] ?? 0)) / half, -1, 1) * TILT_Y : 0;
    kick();
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const p = pointer.current;
    const s = sim.current;
    const stage = stageRef.current;
    const lay = live.current.layout;
    if (p.id === event.pointerId && stage) {
      const dx = event.clientX - p.x;
      const now = stamp(event);
      if (!p.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(event.clientY - p.y)) {
        p.moved = true;
        stop();
        if (stage.isConnected) stage.setPointerCapture(event.pointerId);
        if (!lay.carousel && p.index >= 0) {
          s.drag = p.index;
          s.grab = event.clientX - stage.getBoundingClientRect().left - (s.x[p.index] ?? 0);
        }
      }
      if (p.moved) {
        const v = (event.clientX - p.lastX) / Math.max(1, now - p.lastT);
        p.v = p.v * 0.6 + v * 0.4;
        p.lastX = event.clientX;
        p.lastT = now;
        if (s.drag >= 0) {
          s.x[s.drag] = event.clientX - stage.getBoundingClientRect().left - s.grab;
          s.free = now + 900;
          kick();
        } else if (lay.carousel) {
          p.swipe = dx;
          const xs = targetsFor(lay, live.current.active, live.current.carouselIndex);
          for (let i = 0; i < live.current.count; i++) s.tx[i] = (xs[i] ?? 0) + dx;
          kick();
        }
      }
      return;
    }
    if (event.pointerType !== "mouse" || lay.carousel || live.current.openIndex !== null) return;
    const hit = nearest(event.clientX, event.clientY);
    const now = live.current.active;
    if (now !== null && hit !== now && stage) {
      const shape = live.current.shapes[now];
      const box = stage.getBoundingClientRect();
      const local = event.clientX - box.left;
      const keep = shape ? Math.abs(local - (s.x[now] ?? 0)) < (shape.w * lay.unit * LIFT_GROW) / 2 + 10 : false;
      if (keep && event.clientY - box.top < lay.stageH) { aim(now, event.clientX); return; }
    }
    if (hit !== null) { stop(); choose(hit); aim(hit, event.clientX); }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    const hit = nearest(event.clientX, event.clientY);
    const now = stamp(event);
    pendingOpen.current = -1;
    pointer.current = { id: event.pointerId, index: hit ?? -1, x: event.clientX, y: event.clientY, moved: false, kind: event.pointerType, swipe: 0, lastX: event.clientX, lastT: now, v: 0 };
  };

  const finishPointer = (event: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (p.id !== event.pointerId) return;
    const s = sim.current;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    pointer.current = { ...p, id: -1 };
    if (s.drag >= 0) {
      // Let go mid-motion and the print slides on; stop first and it stays where the hand left it.
      const idle = stamp(event) - p.lastT;
      s.vx[s.drag] = idle < 140 ? p.v * 1000 * (1 - idle / 140) : 0;
      s.drag = -1;
      s.free = performance.now() + 700;
      kick();
      return;
    }
    const lay = live.current.layout;
    if (p.moved && lay.carousel) {
      const dx = event.clientX - p.x;
      const from = live.current.active ?? live.current.carouselIndex;
      const distanceSteps = Math.round(Math.abs(dx) / 110);
      const velocitySteps = Math.abs(p.v) > 0.4 ? Math.round(Math.abs(p.v) * 2) : 0;
      const totalSteps = Math.max(1, Math.max(distanceSteps, velocitySteps));
      const step = Math.abs(dx) > 30 || Math.abs(p.v) > 0.3 ? (dx < 0 ? totalSteps : -totalSteps) : 0;
      pointer.current.swipe = 0;
      const next = clamp(from + step, 0, live.current.count - 1);
      live.current.carouselIndex = next;
      if (next === live.current.active || controlled) {
        const xs = targetsFor(lay, controlled ? live.current.active : next, next);
        for (let i = 0; i < live.current.count; i++) s.tx[i] = xs[i] ?? 0;
        kick();
      }
      choose(next);
      return;
    }
    if (cancelled || p.moved || p.index < 0) return;
    stop();
    if ((p.kind !== "mouse" || lay.carousel) && live.current.active !== p.index) choose(p.index);
    else pendingOpen.current = p.index;
  };

  const wheelAccum = React.useRef(0);
  const wheelStamp = React.useRef(0);

  const onWheel = (event: React.WheelEvent) => {
    // Recognize both horizontal deltaX (trackpad swipe) and vertical deltaY (mouse wheel)
    const dx = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(dx) < 4) return;
    const now = performance.now();
    wheelAccum.current += dx;
    // Step when wheel accumulator exceeds threshold
    if (Math.abs(wheelAccum.current) >= 28 && now - wheelStamp.current > 140) {
      wheelStamp.current = now;
      const step = wheelAccum.current > 0 ? 1 : -1;
      wheelAccum.current = 0;
      stop();
      const from = current ?? focusIndex;
      const next = clamp(from + step, 0, count - 1);
      if (next !== from) {
        setFocusIndex(next);
        choose(next);
        impulse(next, step > 0 ? -14 : 14);
      }
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    stop();
    const from = current ?? focusIndex;
    const next = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : clamp(from + (event.key === "ArrowRight" ? 1 : -1), 0, count - 1);
    setFocusIndex(next);
    choose(next);
    slots.current[next]?.focus({ preventScroll: true });
  };

  const currentItem = current === null ? null : items[current];
  const byline = currentItem ? [[currentItem.artist, currentItem.year].filter(Boolean).join(", "), currentItem.tag].filter(Boolean).join(" · ") : "";
  const U = layout.unit;
  const blur = Math.max(3, U * 0.05);

  return (
    <section
      {...rest}
      data-slot="picture-rail-gallery"
      data-mode={layout.carousel ? "carousel" : "rail"}
      data-active={current ?? ""}
      aria-roledescription="picture rail gallery"
      className={`relative isolate w-full overflow-hidden ${className?.includes("bg-") ? "" : "bg-background"} text-foreground ${className ?? ""}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(72% 58% at 50% 44%, color-mix(in oklab, var(--color-foreground, #1e293b) 4%, transparent), transparent 78%)" }} />
      {(eyebrow || heading) && (
        <header className="relative z-10 flex flex-col items-center gap-2 px-6 pt-7 text-center">
          {eyebrow && <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">{eyebrow}</p>}
          {heading && <h2 className="text-balance text-2xl font-medium tracking-tight sm:text-3xl">{heading}</h2>}
        </header>
      )}

      <div
        ref={stageRef}
        data-stage
        role="group"
        aria-label={heading ?? "Picture rail"}
        className="relative mt-5 w-full touch-pan-y select-none"
        style={{ height: layout.stageH, overflowX: "clip" }}
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={(event) => finishPointer(event, false)}
        onPointerCancel={(event) => finishPointer(event, true)}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse" || pointer.current.id >= 0 || layout.carousel) return;
          for (let i = 0; i < count; i++) sim.current.tty[i] = 0;
          if (!document.activeElement?.matches("[data-frame]:focus-visible")) choose(null);
          kick();
        }}
        onKeyDown={onKeyDown}
      >
        <div aria-hidden="true" data-rail className="pointer-events-none absolute inset-x-0 z-[1]" style={{ top: layout.railTop, height: layout.railT }}>
          <div className="absolute inset-x-0 top-full h-3 bg-black opacity-[0.07] blur-[5px] dark:opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, color-mix(in oklab, var(--color-card, #ffffff) 70%, white) 0%, var(--color-card, #ffffff) 16%, color-mix(in oklab, var(--color-card, #ffffff) 90%, black) 30%, color-mix(in oklab, var(--color-card, #ffffff) 96%, white) 46%, var(--color-card, #ffffff) 62%, color-mix(in oklab, var(--color-card, #ffffff) 84%, black) 86%, color-mix(in oklab, var(--color-card, #ffffff) 72%, black) 100%)", boxShadow: "0 1px 0 color-mix(in oklab, var(--color-foreground, #1e293b) 14%, transparent), 0 -1px 0 color-mix(in oklab, var(--color-foreground, #1e293b) 8%, transparent)" }} />
          <div className="absolute inset-x-0 top-[30%] h-px bg-black opacity-10 dark:opacity-40" />
          <div className="absolute inset-x-0 top-0 h-px bg-white opacity-80 dark:opacity-15" />
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]">
          {items.map((item, i) => {
            const shape = shapes[i];
            if (!shape) return null;
            const w = shape.w * U;
            const h = shape.h * U;
            const top = layout.tops[i] ?? 0;
            return (
              <div key={item.id} ref={(node) => { backs.current[i] = node; }} className="absolute left-0 top-0" style={{ width: w, height: 0, transformOrigin: `${w / 2}px ${layout.pivotY + 1}px`, visibility: lifted === i ? "hidden" : undefined }}>
                <span ref={(node) => { washes.current[i] = node; }} data-wash className="absolute opacity-0 [--wash:color-mix(in_oklab,gold_28%,transparent)] dark:[--wash:color-mix(in_oklab,gold_30%,transparent)]" style={{ left: -w * 0.5, width: w * 2, top: top - h * 0.5, height: h * 1.75, background: "radial-gradient(closest-side, var(--wash), transparent)" }} />
                <span className="absolute opacity-[0.22] dark:opacity-70" style={{ left: 0, top, width: w, height: h, filter: `blur(${blur.toFixed(1)}px)` }}>
                  <span ref={(node) => { shadows.current[i] = node; }} className="absolute inset-0 rounded-[2px] bg-black" />
                </span>
              </div>
            );
          })}
        </div>

        {items.map((item, i) => {
          const shape = shapes[i];
          if (!shape) return null;
          const w = shape.w * U;
          const h = shape.h * U;
          const top = layout.tops[i] ?? 0;
          const lit = current === i;
          const ringY = top + h * 0.07;
          return (
            <div key={item.id} ref={(node) => { hangs.current[i] = node; }} data-hang={i} className="pointer-events-none absolute left-0 top-0" style={{ width: w, height: 0, zIndex: lit ? 30 : 10 + i }}>
              <Hook x={w / 2} railTop={layout.railTop} railT={layout.railT} pivotY={layout.pivotY} />
              {(item.title || item.tag) && (
                <span
                  data-label
                  title={item.title || item.tag}
                  className={`absolute whitespace-nowrap max-w-[160px] truncate rounded-[3px] border border-border bg-card px-2 py-[3px] text-[10px] font-medium leading-none shadow-[0_1px_2px_color-mix(in_oklab,var(--color-foreground,currentColor)_10%,transparent)] ${lit ? "text-card-foreground border-emerald-500/50 shadow-sm" : "text-muted-foreground"}`}
                  style={{ top: top + h + 10, right: 0 }}
                >
                  {lit && <span aria-hidden="true" className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500 align-middle shrink-0" />}
                  {item.title || item.tag}
                </span>
              )}
              <span ref={(node) => { swings.current[i] = node; }} data-swing className="absolute left-0 top-0" style={{ width: w, height: 0, transformOrigin: `${w / 2}px ${layout.pivotY + 1}px`, visibility: lifted === i ? "hidden" : undefined }}>
                <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-0 overflow-visible text-foreground" width={Math.max(1, w)} height={Math.max(1, ringY)}>
                  {[w * 0.2, w * 0.8].map((rx) => (
                    <g key={rx}>
                      <line x1={w / 2 + 0.7} y1={layout.pivotY + 1.8} x2={rx + 0.7} y2={ringY + 0.8} stroke="black" strokeOpacity="0.14" strokeWidth="1.4" />
                      <line x1={w / 2} y1={layout.pivotY + 1} x2={rx} y2={ringY} stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
                      <line x1={w / 2 - 0.3} y1={layout.pivotY + 1} x2={rx - 0.3} y2={ringY} stroke="white" strokeOpacity="0.35" strokeWidth="0.4" />
                    </g>
                  ))}
                </svg>
                <button
                  ref={(node) => { slots.current[i] = node; }}
                  type="button"
                  data-frame={i}
                  data-lit={lit || undefined}
                  tabIndex={i === (current ?? focusIndex) ? 0 : -1}
                  aria-label={item.title}
                  aria-describedby={`${uid}-caption`}
                  aria-pressed={lit}
                  className="pointer-events-auto absolute cursor-pointer rounded-[2px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-ring"
                  style={{ left: 0, top, width: w, height: h }}
                  onFocus={() => { setFocusIndex(i); if (pointer.current.id < 0) { stop(); choose(i); } }}
                  onClick={(event) => { const pending = pendingOpen.current; pendingOpen.current = -1; if (event.detail === 0 || pending === i) open(i); }}
                >
                  <span ref={(node) => { tilts.current[i] = node; }} data-tilt className="absolute block" style={{ left: (-(SUPERSAMPLE - 1) * w) / 2, top: (-(SUPERSAMPLE - 1) * h) / 2, width: w * SUPERSAMPLE, height: h * SUPERSAMPLE, transform: `scale(${1 / SUPERSAMPLE})` }}>
                    <span className="absolute inset-0 block" style={{ zoom: SUPERSAMPLE }}>
                      <FrameArt
                        item={item}
                        shape={shape}
                        unit={U}
                        lightRef={(node) => { lights.current[i] = node; }}
                        glareRef={(node) => { glares.current[i] = node; }}
                        dimRef={(node) => { dims.current[i] = node; }}
                      />
                    </span>
                  </span>
                </button>
              </span>
            </div>
          );
        })}
        {/* Floating Left & Right Navigation Arrows for effortless continuous scrolling */}
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous frame (Scroll Left)"
              title="Previous Frame (Scroll Left)"
              disabled={(current ?? focusIndex) <= 0}
              onClick={(e) => {
                e.stopPropagation();
                stop();
                const prev = Math.max(0, (current ?? focusIndex) - 1);
                setFocusIndex(prev);
                choose(prev);
                impulse(prev, 16);
              }}
              className="pointer-events-auto absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-2.5 rounded-full border border-border/80 bg-background/85 backdrop-blur-md text-foreground shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next frame (Scroll Right)"
              title="Next Frame (Scroll Right)"
              disabled={(current ?? focusIndex) >= count - 1}
              onClick={(e) => {
                e.stopPropagation();
                stop();
                const next = Math.min(count - 1, (current ?? focusIndex) + 1);
                setFocusIndex(next);
                choose(next);
                impulse(next, -16);
              }}
              className="pointer-events-auto absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-2.5 rounded-full border border-border/80 bg-background/85 backdrop-blur-md text-foreground shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {layout.carousel && count > 1 && (
        <div className="relative z-10 mt-2 flex flex-col items-center gap-1.5" role="group" aria-label={heading ?? "Prints"}>
          {count <= 12 ? (
            <div className="flex justify-center gap-1.5">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.title}
                  aria-current={carouselIndex === i}
                  onClick={() => { stop(); choose(i); }}
                  className={`h-1.5 rounded-full outline-none transition-[width,background-color] duration-300 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${carouselIndex === i ? "w-6 bg-foreground" : "w-1.5 bg-foreground/25 hover:bg-foreground/45"}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 w-full max-w-sm px-4">
              <button
                type="button"
                aria-label="Previous project"
                disabled={(current ?? focusIndex) <= 0}
                onClick={() => {
                  stop();
                  const prev = Math.max(0, (current ?? focusIndex) - 1);
                  setFocusIndex(prev);
                  choose(prev);
                }}
                className="text-xs font-mono px-2.5 py-1 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
              >
                &larr; Prev
              </button>
              <div className="flex-1 h-1.5 bg-foreground/15 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-200"
                  style={{ width: `${Math.round((((current ?? focusIndex) + 1) / count) * 100)}%` }}
                />
              </div>
              <button
                type="button"
                aria-label="Next project"
                disabled={(current ?? focusIndex) >= count - 1}
                onClick={() => {
                  stop();
                  const next = Math.min(count - 1, (current ?? focusIndex) + 1);
                  setFocusIndex(next);
                  choose(next);
                }}
                className="text-xs font-mono px-2.5 py-1 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
              >
                Next &rarr;
              </button>
              <span className="text-[11px] font-mono tabular-nums text-muted-foreground font-semibold whitespace-nowrap">
                {(current ?? focusIndex) + 1}/{count}
              </span>
            </div>
          )}
          <span className="text-[11px] font-mono text-muted-foreground/75 hidden sm:inline">
            Scroll left / right or drag wire to browse all {count} projects
          </span>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-3 px-6 pb-7 pt-3 text-center">
        <div id={`${uid}-caption`} aria-live="polite" className="min-h-[2.75rem]">
          <p className="text-sm font-medium">{currentItem ? currentItem.title : caption}</p>
          {currentItem && <p className="mt-0.5 text-[13px] text-muted-foreground">{byline}{byline ? " · " : ""}<span className="text-foreground/80">{labels.open}</span></p>}
        </div>
        {action}
      </div>

      {openIndex !== null && items[openIndex] && shapes[openIndex] && (
        <Detail
          uid={uid}
          item={items[openIndex]}
          shape={shapes[openIndex]}
          index={openIndex}
          total={count}
          labels={labels}
          reduced={reduced}
          source={sourceRect}
          onLift={onLift}
          onClose={onDetailClose}
        />
      )}
    </section>
  );
}

function Hook({ x, railTop, railT, pivotY }: { x: number; railTop: number; railT: number; pivotY: number }) {
  const plate = clamp(railT * 0.36, 3, 6);
  const height = pivotY - railTop + 6;
  return (
    <span aria-hidden="true" className="absolute" style={{ left: x - plate, top: railTop - 3, width: plate * 2, height }}>
      <span className="absolute inset-x-0 top-0 rounded-full" style={{ height: 4, background: BRASS, boxShadow: "0 1px 1px color-mix(in oklab, black 30%, transparent)" }} />
      <span className="absolute top-[3px] rounded-b-[1px]" style={{ left: plate * 0.5, width: plate, bottom: 5, background: BRASS_SIDE, boxShadow: "1px 1px 1.5px color-mix(in oklab, black 28%, transparent)" }} />
      <svg aria-hidden="true" className="absolute bottom-0 left-0 overflow-visible" width={plate * 2} height={7} style={{ color: "color-mix(in oklab, darkgoldenrod 80%, black)" }}>
        <path d={`M${plate * 0.62},0 Q${plate * 0.62},6.2 ${plate},6.2 Q${plate * 1.38},6.2 ${plate * 1.38},2.4`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Moulding({ frame, m }: { frame: PictureFrameStyle; m: number }) {
  const base = FRAME_BASE[frame];
  const [outer, crest, shoulder, cove, lip, light] = FRAME_RELIEF[frame];
  const sides = [
    { key: "t", style: { left: 0, right: 0, top: 0, height: m, clipPath: `polygon(0 0, 100% 0, calc(100% - ${m}px) 100%, ${m}px 100%)` }, dir: "to bottom", along: "178.6deg", light: 0.16 },
    { key: "l", style: { left: 0, top: 0, bottom: 0, width: m, clipPath: `polygon(0 0, 100% ${m}px, 100% calc(100% - ${m}px), 0 100%)` }, dir: "to right", along: "91.2deg", light: 0.04 },
    { key: "r", style: { right: 0, top: 0, bottom: 0, width: m, clipPath: `polygon(0 ${m}px, 100% 0, 100% 100%, 0 calc(100% - ${m}px))` }, dir: "to left", along: "88.9deg", light: -0.14 },
    { key: "b", style: { left: 0, right: 0, bottom: 0, height: m, clipPath: `polygon(${m}px 0, calc(100% - ${m}px) 0, 100% 100%, 0 100%)` }, dir: "to top", along: "1.3deg", light: -0.24 },
  ];
  return (
    <>
      {sides.map((side) => {
        const layers = [tone(side.light * light)];
        if (frame === "oak") layers.push(`repeating-linear-gradient(${side.along}, transparent 0 1.7px, color-mix(in oklab, sienna 26%, transparent) 1.7px 2.3px, transparent 2.3px 4.4px, color-mix(in oklab, saddlebrown 16%, transparent) 4.4px 4.9px, transparent 4.9px 7.6px)`);
        layers.push(`linear-gradient(${side.dir}, ${mix(base, outer)} 0%, ${mix(base, crest)} 16%, ${mix(base, shoulder)} 32%, ${base} 56%, ${mix(base, cove)} 82%, ${mix(base, lip)} 100%)`);
        return <span key={side.key} aria-hidden="true" className="absolute" style={{ ...side.style, background: layers.join(", ") }} />;
      })}
    </>
  );
}

function Fixture({ width, hood, arm }: { width: number; hood: number; arm: number }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 -translate-x-1/2" style={{ bottom: "100%", width, height: arm + hood }}>
      {[0.26, 0.74].map((p) => (
        <span key={p} className="absolute bottom-0" style={{ left: `calc(${p * 100}% - 0.75px)`, width: 1.5, height: arm + hood * 0.5, background: "linear-gradient(to right, color-mix(in oklab, goldenrod 60%, white), color-mix(in oklab, darkgoldenrod 70%, black))" }} />
      ))}
      <span className="absolute inset-x-0 top-0 rounded-full" style={{ height: hood, background: BRASS_DIM, boxShadow: "0 1px 2px color-mix(in oklab, black 35%, transparent)" }} />
      <span className="absolute top-0 rounded-full bg-white opacity-30" style={{ left: "8%", right: "8%", height: Math.max(1, hood * 0.22), marginTop: hood * 0.12 }} />
    </span>
  );
}

function FrameArt({ item, shape, unit, lit, lightRef, glareRef, dimRef }: {
  item: PictureRailItem;
  shape: Shape;
  unit: number;
  lit?: number;
  lightRef?: (node: HTMLSpanElement | null) => void;
  glareRef?: (node: HTMLSpanElement | null) => void;
  dimRef?: (node: HTMLSpanElement | null) => void;
}) {
  const m = Math.max(2, shape.mold * unit);
  const mat = shape.mat * unit;
  const matB = shape.matB * unit;
  const fixture = clamp(shape.w * unit * 0.46, 30, 190);
  const hood = clamp(unit * 0.05, 4, 12);
  const arm = clamp(unit * 0.07, 5, 20);
  const above = arm + hood;
  const bevel = clamp(unit * 0.012, 1, 3);
  return (
    <>
      <Fixture width={fixture} hood={hood} arm={arm} />
      <span className="absolute inset-0 block rounded-[1.5px]" style={{ boxShadow: "0 0 0 0.6px color-mix(in oklab, black 45%, transparent)" }}>
        <Moulding frame={shape.frame} m={m} />
        <span className="absolute block overflow-hidden" style={{ inset: m, background: mat ? `linear-gradient(to bottom, ${PAPER}, color-mix(in oklab, white 89%, wheat))` : "var(--color-muted, #e2e8f0)" }}>
          <span className="absolute block overflow-hidden bg-muted" style={{ backgroundImage: "radial-gradient(120% 90% at 28% 18%, color-mix(in oklab, var(--color-foreground, #1e293b) 9%, transparent), transparent 70%)", left: mat, right: mat, top: mat, bottom: mat + matB, boxShadow: mat ? `0 0 0 ${bevel}px color-mix(in oklab, white 97%, wheat), 0 0 0 ${bevel + 0.6}px color-mix(in oklab, black 16%, transparent), ${bevel * 0.6}px ${bevel}px ${bevel * 1.6}px ${bevel}px color-mix(in oklab, black 9%, transparent)` : undefined }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt=""
              draggable={false}
              decoding="async"
              ref={(node) => { if (node?.complete && node.naturalWidth > 0) node.dataset.loaded = "true"; }}
              onLoad={(event) => { event.currentTarget.dataset.loaded = "true"; }}
              onError={(event) => { event.currentTarget.dataset.failed = "true"; }}
              className="pointer-events-none absolute inset-0 size-full select-none object-cover opacity-0 transition-opacity duration-500 data-[failed]:hidden data-[loaded]:opacity-100 motion-reduce:transition-none"
            />
          </span>
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 block" style={{ boxShadow: `inset 0 ${(m * 0.45).toFixed(1)}px ${(m * 0.9).toFixed(1)}px color-mix(in oklab, black 30%, transparent), inset ${(m * 0.2).toFixed(1)}px 0 ${(m * 0.5).toFixed(1)}px color-mix(in oklab, black 12%, transparent), inset 0 0 0 0.5px color-mix(in oklab, black 45%, transparent)` }} />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 block overflow-hidden">
            <span className="absolute inset-0 block" style={{ background: "linear-gradient(to bottom, color-mix(in oklab, white 9%, transparent), transparent 30%)" }} />
            <span ref={glareRef} data-glare className="absolute inset-y-0 -left-1/2 block w-[200%]" style={{ background: "linear-gradient(112deg, transparent 37%, color-mix(in oklab, white 10%, transparent) 43.5%, color-mix(in oklab, white 4%, transparent) 50%, transparent 56%)" }} />
          </span>
        </span>
        <span ref={lightRef} data-light aria-hidden="true" className="pointer-events-none absolute block opacity-0 mix-blend-screen" style={{ left: 0, right: 0, top: -above, bottom: 0, ...(lit === undefined ? null : { opacity: lit }) }}>
          <span className="absolute left-1/2 block -translate-x-1/2 rounded-full" style={{ top: 0, width: fixture, height: hood, background: BRASS, opacity: 0.55 }} />
          <span className="absolute left-1/2 block -translate-x-1/2 rounded-full" style={{ top: hood * 0.6, width: fixture * 0.86, height: Math.max(2, hood * 0.45), background: WARM, boxShadow: `0 0 ${(hood * 1.8).toFixed(1)}px ${(hood * 0.6).toFixed(1)}px color-mix(in oklab, gold 55%, transparent)` }} />
          <span className="absolute block" style={{ left: m * 0.4, right: m * 0.4, top: above - 1, height: m * 1.8, background: `radial-gradient(55% 100% at 50% 0%, color-mix(in oklab, ${WARM} 75%, transparent), transparent)` }} />
          <span className="absolute block" style={{ left: m, right: m, top: above + m * 0.2, bottom: m, background: `radial-gradient(95% 78% at 50% 0%, color-mix(in oklab, ${WARM} 50%, transparent) 0%, color-mix(in oklab, ${WARM} 18%, transparent) 46%, transparent 80%)` }} />
        </span>
        <span ref={dimRef} data-dim aria-hidden="true" className="pointer-events-none absolute inset-0 block bg-black opacity-0" />
      </span>
    </>
  );
}

function FrameBack({ item, shape, unit }: { item: PictureRailItem; shape: Shape; unit: number }) {
  const w = shape.w * unit;
  const h = shape.h * unit;
  const edge = Math.max(4, shape.mold * unit * 0.85);
  const cw = w - edge * 2;
  const ch = h - edge * 2;
  const tape = clamp(unit * 0.035, 4, 12);
  const ringY = ch * 0.24;
  const rings = [cw * 0.16, cw * 0.84];
  const sag = ringY + ch * 0.13;
  const font = clamp(unit * 0.034, 8.5, 13);
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2px]" style={{ background: `repeating-linear-gradient(90.6deg, transparent 0 3px, color-mix(in oklab, sienna 12%, transparent) 3px 3.6px, transparent 3.6px 8px), linear-gradient(to bottom, color-mix(in oklab, burlywood 70%, white), color-mix(in oklab, burlywood 85%, sienna))`, boxShadow: "inset 0 0 0 0.6px color-mix(in oklab, black 40%, transparent)" }}>
      <div className="absolute" style={{ inset: edge, background: "repeating-linear-gradient(33deg, transparent 0 2.6px, color-mix(in oklab, sienna 7%, transparent) 2.6px 3.4px), repeating-linear-gradient(-61deg, transparent 0 4px, color-mix(in oklab, white 6%, transparent) 4px 4.8px), linear-gradient(160deg, color-mix(in oklab, tan 82%, white), color-mix(in oklab, tan 70%, sienna))", boxShadow: `inset 0 0 0 ${tape}px color-mix(in oklab, peru 52%, tan), inset 0 0 0 ${tape + 0.6}px color-mix(in oklab, sienna 30%, transparent), 0 0 0 0.5px color-mix(in oklab, black 30%, transparent)` }}>
        <svg aria-hidden="true" className="absolute inset-0 overflow-visible" width={cw} height={ch}>
          <path d={`M${rings[0]},${ringY + 5} Q${cw / 2},${sag + 10} ${rings[1]},${ringY + 5}`} fill="none" stroke="color-mix(in oklab, black 30%, transparent)" strokeWidth="2.2" transform="translate(0.8 1.4)" />
          <path d={`M${rings[0]},${ringY + 5} Q${cw / 2},${sag + 10} ${rings[1]},${ringY + 5}`} fill="none" stroke="color-mix(in oklab, gray 70%, white)" strokeWidth="1.6" />
          <path d={`M${rings[0]},${ringY + 5} Q${cw / 2},${sag + 10} ${rings[1]},${ringY + 5}`} fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="0.5" strokeDasharray="1.2 1.6" />
          {rings.map((rx, k) => (
            <g key={rx}>
              <path d={`M${rx + (k ? -4 : 4)},${ringY + 5} l${k ? -9 : 9},2.2 l${k ? 1.6 : -1.6},1.4 l${k ? -8 : 8},1.6`} fill="none" stroke="color-mix(in oklab, gray 60%, white)" strokeWidth="1.1" strokeLinecap="round" />
              <rect x={rx - 5} y={ringY - 9} width="10" height="13" rx="2" fill="color-mix(in oklab, gray 55%, white)" stroke="color-mix(in oklab, black 35%, transparent)" strokeWidth="0.6" />
              <circle cx={rx} cy={ringY - 5} r="1.5" fill="color-mix(in oklab, gray 70%, black)" />
              <circle cx={rx} cy={ringY + 0.4} r="1.5" fill="color-mix(in oklab, gray 70%, black)" />
              <path d={`M${rx - 4.5},${ringY + 3} Q${rx - 4.5},${ringY + 10} ${rx},${ringY + 10} Q${rx + 4.5},${ringY + 10} ${rx + 4.5},${ringY + 3}`} fill="none" stroke="color-mix(in oklab, gray 45%, white)" strokeWidth="2" />
              <path d={`M${rx - 4.5},${ringY + 3} Q${rx - 4.5},${ringY + 10} ${rx},${ringY + 10}`} fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="0.6" />
            </g>
          ))}
          {[[tape * 2.2, ch - tape * 2.2], [cw - tape * 2.2, ch - tape * 2.2]].map(([bx, by]) => (
            <g key={`${bx}`}>
              <circle cx={bx} cy={by} r={clamp(unit * 0.03, 3, 7)} fill="color-mix(in oklab, black 70%, white)" />
              <circle cx={(bx ?? 0) - 0.8} cy={(by ?? 0) - 0.9} r={clamp(unit * 0.012, 1, 2.6)} fill="white" fillOpacity="0.35" />
            </g>
          ))}
        </svg>
        <div data-back-label className="absolute left-1/2 -translate-x-1/2 rounded-[2px] text-left" style={{ bottom: ch * 0.14, width: clamp(cw * 0.66, 120, 300), padding: `${font * 0.8}px ${font}px`, fontSize: font, lineHeight: 1.35, background: PAPER, color: INK, boxShadow: "0 1px 2px color-mix(in oklab, black 25%, transparent), inset 0 0 0 0.5px color-mix(in oklab, black 12%, transparent)" }}>
          <p className="uppercase" style={{ fontSize: "0.7em", letterSpacing: "0.2em", opacity: 0.6 }}>Gallery label</p>
          <p className="font-semibold" style={{ fontSize: "1.18em", marginTop: "0.25em" }}>{item.title}</p>
          {(item.artist || item.year) && <p>{[item.artist, item.year].filter(Boolean).join(", ")}</p>}
          {item.details && item.details.length > 0 && (
            <ul className="mt-[0.35em] border-t pt-[0.35em]" style={{ borderColor: "color-mix(in oklab, black 14%, transparent)" }}>
              {item.details.map((line) => <li key={line}>{line}</li>)}
            </ul>
          )}
          <svg aria-hidden="true" viewBox="0 0 120 26" className="mt-[0.3em] block h-[1.9em] w-auto" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3,18 C10,4 14,4 13,14 C12,22 18,20 22,12 C25,6 27,8 26,15 C30,10 34,9 35,15 C37,21 43,6 48,9 C52,12 47,20 54,17 C60,14 63,7 66,12 C69,18 74,14 79,11 C84,8 88,16 94,13 C100,10 106,11 116,8" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function fitUnit(shape: Shape) {
  if (typeof window === "undefined") return 280;
  const wide = window.innerWidth >= 768;
  const maxW = wide ? Math.min(520, window.innerWidth * 0.46) : window.innerWidth * 0.78;
  const maxH = wide ? Math.min(500, window.innerHeight * 0.64) : window.innerHeight * 0.4;
  return Math.max(80, Math.min(maxW / shape.w, maxH / shape.h));
}

function Detail({ uid, item, shape, index, total, labels, reduced, source, onLift, onClose }: {
  uid: string;
  item: PictureRailItem;
  shape: Shape;
  index: number;
  total: number;
  labels: PictureRailGalleryLabels;
  reduced: boolean;
  source: () => DOMRect | null;
  onLift: (lifted: boolean) => void;
  onClose: () => void;
}) {
  const dialogRef = React.useRef(null as HTMLDivElement | null);
  const figureRef = React.useRef(null as HTMLDivElement | null);
  const spinRef = React.useRef(null as HTMLDivElement | null);
  const closeRef = React.useRef(null as HTMLButtonElement | null);
  const [side, setSide] = React.useState("front" as "front" | "back");
  const [shown, setShown] = React.useState(false);
  const [unit, setUnit] = React.useState(() => fitUnit(shape));
  const angle = React.useRef({ value: 0, target: 0, velocity: 0, raf: 0, last: 0, dragging: false, startX: 0, startAngle: 0 });
  const closing = React.useRef(false);
  const titleId = `${uid}-detail-title`;

  React.useEffect(() => {
    const onResize = () => setUnit(fitUnit(shape));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [shape]);

  const spin = React.useCallback(() => {
    const a = angle.current;
    const node = spinRef.current;
    const loop = (now: number) => {
      const dt = a.last ? Math.min(0.1, (now - a.last) / 1000) : 1 / 60;
      a.last = now;
      const sub = Math.ceil(dt / 0.012);
      for (let k = 0; k < sub; k++) {
        const accel = -90 * (a.value - a.target) - 2 * Math.sqrt(90) * 0.82 * a.velocity;
        a.velocity += (accel * dt) / sub;
        a.value += (a.velocity * dt) / sub;
      }
      if (node) node.style.transform = `rotateY(${a.value.toFixed(2)}deg)`;
      if (Math.abs(a.value - a.target) < 0.05 && Math.abs(a.velocity) < 0.05) { a.value = a.target; if (node) node.style.transform = `rotateY(${a.value}deg)`; a.raf = 0; a.last = 0; return; }
      a.raf = requestAnimationFrame(loop);
    };
    if (reduced) { a.value = a.target; if (node) node.style.transform = `rotateY(${a.value}deg)`; return; }
    if (!a.raf) a.raf = requestAnimationFrame(loop);
  }, [reduced]);

  const turnTo = React.useCallback((next: "front" | "back") => {
    const a = angle.current;
    const base = Math.round(a.value / 360) * 360;
    a.target = base + (next === "back" ? 180 : 0);
    if (Math.abs(a.target - a.value) > 180) a.target -= 360 * Math.sign(a.target - a.value);
    setSide(next);
    spin();
  }, [spin]);

  React.useLayoutEffect(() => {
    const figure = figureRef.current;
    const from = source();
    closeRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    const touchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    let animation = null as Animation | null;
    if (figure && from && !reduced && from.width > 0) {
      const to = figure.getBoundingClientRect();
      const scale = from.width / to.width;
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const lift = Math.min(90, Math.abs(dy) * 0.25 + 30);
      onLift(true);
      animation = figure.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - lift}px) scale(${((scale + 1) / 2) * 1.03}) rotate(${dx > 0 ? -2.5 : 2.5}deg)`, offset: 0.5 },
        { transform: "none" },
      ], { duration: 680, easing: "cubic-bezier(.22,.85,.3,1)" });
    } else onLift(true);
    const raf = requestAnimationFrame(() => setShown(true));
    const spinState = angle.current;
    return () => {
      cancelAnimationFrame(raf);
      animation?.cancel();
      document.body.style.overflow = overflow;
      document.body.style.touchAction = touchAction;
      cancelAnimationFrame(spinState.raf);
      spinState.raf = 0;
      onLift(false);
    };
  }, [source, reduced, onLift]);

  const dismiss = React.useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    const figure = figureRef.current;
    const to = source();
    if (!figure || !to || reduced || to.width === 0) { onClose(); return; }
    const from = figure.getBoundingClientRect();
    const scale = to.width / from.width;
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const animation = figure.animate([
      { transform: "none" },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 30}px) scale(${(scale + 1) / 2})`, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
    ], { duration: 560, easing: "cubic-bezier(.45,0,.55,1)", fill: "forwards" });
    animation.onfinish = () => onClose();
  }, [source, reduced, onClose]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.contains(event.target as Node)) return;
      if (event.key === "Escape") { event.preventDefault(); dismiss(); }
      else if (event.key === "ArrowLeft" || event.key === "ArrowRight") turnTo(side === "front" ? "back" : "front");
      else if (event.key === "Tab") { const first = dialog.querySelector("button"); if (first) { event.preventDefault(); first.focus(); } }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss, turnTo, side]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); dismiss(); return; }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); turnTo(side === "front" ? "back" : "front"); return; }
    if (event.key !== "Tab") return;
    const controls = [...(dialogRef.current?.querySelectorAll("button") ?? [])].filter((node) => !node.disabled);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const w = shape.w * unit;
  const h = shape.h * unit;
  const byline = [item.artist, item.year].filter(Boolean).join(", ");

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-background p-6 text-foreground"
      onKeyDown={onKeyDown}
    >
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-background/98 sm:bg-background/95 backdrop-blur-2xl transition-opacity duration-300 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}
        style={{ minHeight: "100dvh", minWidth: "100vw" }}
        onClick={dismiss}
      />
      <button ref={closeRef} type="button" onClick={dismiss} className={`absolute right-5 top-5 z-10 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground outline-none transition-[opacity,color] duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}>
        {labels.close}
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
      </button>
      <div className="relative grid w-full max-w-5xl items-center justify-items-center gap-8 pt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:gap-12">
        <div ref={figureRef} data-figure className="relative" style={{ width: w, height: h }}>
          <div aria-hidden="true" className="absolute inset-x-[10%] -bottom-[7%] h-[16%] rounded-[50%] bg-black opacity-[0.18] blur-xl dark:opacity-60" />
          <div
            data-spin-area
            className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
            style={{ perspective: "1600px" }}
            onPointerDown={(event) => { const a = angle.current; a.dragging = true; a.startX = event.clientX; a.startAngle = a.value; cancelAnimationFrame(a.raf); a.raf = 0; a.last = 0; event.currentTarget.setPointerCapture(event.pointerId); }}
            onPointerMove={(event) => { const a = angle.current; if (!a.dragging) return; a.value = clamp(a.startAngle + (event.clientX - a.startX) * 0.45, a.startAngle - 220, a.startAngle + 220); if (spinRef.current) spinRef.current.style.transform = `rotateY(${a.value.toFixed(2)}deg)`; }}
            onPointerUp={() => { const a = angle.current; if (!a.dragging) return; a.dragging = false; const facing = ((a.value % 360) + 360) % 360; turnTo(facing > 90 && facing < 270 ? "back" : "front"); }}
            onPointerCancel={() => { angle.current.dragging = false; turnTo(side); }}
          >
            <div ref={spinRef} className="absolute inset-0 [transform-style:preserve-3d]">
              <div data-face="front" className="absolute inset-0 [backface-visibility:hidden]">
                <FrameArt item={item} shape={shape} unit={unit} lit={0.85} />
              </div>
              <div data-face="back" className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }}>
                <FrameBack item={item} shape={shape} unit={unit} />
              </div>
            </div>
          </div>
        </div>
        <div className={`flex flex-col gap-3 text-center transition-[opacity,transform] delay-150 duration-500 motion-reduce:transition-none md:text-left ${shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</p>
          <h3 id={titleId} className="text-2xl font-medium tracking-tight sm:text-3xl">{item.title}</h3>
          {byline && <p className="text-sm text-muted-foreground">{byline}</p>}
          {item.tag && <p className="text-lg font-medium tabular-nums">{item.tag}</p>}
          {item.details && item.details.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2 md:justify-start">
              {item.details.map((detail) => <li key={detail} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{detail}</li>)}
            </ul>
          )}
          <div role="group" aria-label={`${labels.front} / ${labels.back}`} className="mt-1 inline-flex justify-center gap-6 md:justify-start">
            {(["front", "back"] as const).map((face) => (
              <button key={face} type="button" aria-pressed={side === face} onClick={() => turnTo(face)} className={`relative rounded-[3px] pb-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transition-none ${side === face ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {face === "front" ? labels.front : labels.back}
                <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-px origin-left bg-foreground transition-transform duration-300 motion-reduce:transition-none ${side === face ? "scale-x-100" : "scale-x-0"}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default PictureRailGallery;
