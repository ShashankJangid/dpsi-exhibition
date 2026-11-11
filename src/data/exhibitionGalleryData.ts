import { SEED_PROJECTS } from './seedProjects';

export type PictureFrameStyle = "black" | "oak" | "white";

export interface PictureRailItem {
  id: string;
  title: string;
  artist?: string;
  year?: string;
  image: string;
  aspect?: number;
  frame?: PictureFrameStyle;
  mat?: boolean;
  drop?: number;
  tag?: string;
  details?: string[];
}

const FRAME_STYLES: PictureFrameStyle[] = ["black", "oak", "white"];
const DROPS = [-0.05, 0.08, -0.02, 0.12, -0.07, 0.04, -0.04, 0.06];
const ASPECTS = [0.8, 0.78, 0.82, 0.76, 0.84, 0.8, 0.75, 0.85];

export const EXHIBITION_GALLERY_ITEMS: PictureRailItem[] = SEED_PROJECTS.map((p, idx) => ({
  id: p.id,
  title: p.title.replace(/^[A-Z0-9]+\s*•\s*/, ''),
  artist: p.members?.length ? p.members.join(', ') : 'Student Innovators',
  year: '2026',
  image: p.image_url,
  aspect: ASPECTS[idx % ASPECTS.length],
  frame: FRAME_STYLES[idx % FRAME_STYLES.length],
  mat: idx % 2 === 0,
  drop: DROPS[idx % DROPS.length],
  tag: `Booth ${p.booth_code} • ${p.category}`,
  details: [
    `Booth: ${p.booth_code} • Category: ${p.category}`,
    `Innovators: ${p.members?.join(', ') || 'DPS Indirapuram Innovators'}`,
    `Tech Stack: ${p.tech_stack?.join(', ') || 'Embedded Systems'}`,
    `Live Votes: ${p.vote_count} ballots cast`,
    `Edition: DPS Indirapuram Innovation Exhibition '26`,
  ],
}));
