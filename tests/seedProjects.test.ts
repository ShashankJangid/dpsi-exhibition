import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SEED_PROJECTS } from '../src/data/seedProjects';
import type { CategoryType, ZoneType } from '../src/types/index';

const VALID_CATEGORIES: CategoryType[] = [
  'Show & Tell',
  'Physical',
  'Digital',
  'Business',
  'Robo Race',
  'Robo Soccer',
];

const VALID_ZONES: ZoneType[] = ['zone-1', 'zone-2', 'zone-3'];

describe('Database Integrity: Exhibition Seed Projects', () => {
  test('total project count is exactly 44', () => {
    assert.equal(SEED_PROJECTS.length, 44, `Expected exactly 44 projects, got ${SEED_PROJECTS.length}`);
  });

  test('category counts match official exhibition registry', () => {
    const counts = SEED_PROJECTS.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    assert.equal(counts['Physical'], 12, 'Expected 12 Physical projects');
    assert.equal(counts['Digital'], 12, 'Expected 12 Digital projects');
    assert.equal(counts['Business'], 8, 'Expected 8 Business projects');
    assert.equal(counts['Show & Tell'], 8, 'Expected 8 Show & Tell projects');
    assert.equal(counts['Robo Race'], 2, 'Expected 2 Robo Race projects');
    assert.equal(counts['Robo Soccer'], 2, 'Expected 2 Robo Soccer projects');
  });

  test('all project IDs are unique, lowercase, and non-empty', () => {
    const ids = new Set<string>();
    for (const project of SEED_PROJECTS) {
      assert.ok(project.id, 'Project ID must be defined');
      assert.ok(project.id.length >= 1 && project.id.length <= 50, `ID length out of bounds: ${project.id}`);
      assert.equal(project.id, project.id.toLowerCase(), `ID must be lowercase: ${project.id}`);
      assert.ok(!ids.has(project.id), `Duplicate project ID detected: ${project.id}`);
      ids.add(project.id);
    }
  });

  test('all booth codes are unique and adhere to alphanumeric format', () => {
    const codes = new Set<string>();
    const boothCodeRegex = /^[A-Z0-9&-]+$/;
    for (const project of SEED_PROJECTS) {
      assert.ok(project.booth_code, `Booth code missing on project ${project.id}`);
      assert.ok(
        boothCodeRegex.test(project.booth_code),
        `Booth code format invalid on project ${project.id}: ${project.booth_code}`
      );
      assert.ok(!codes.has(project.booth_code), `Duplicate booth code: ${project.booth_code}`);
      codes.add(project.booth_code);
    }
  });

  test('all projects have valid categories and zones', () => {
    for (const project of SEED_PROJECTS) {
      assert.ok(
        VALID_CATEGORIES.includes(project.category),
        `Invalid category "${project.category}" on project ${project.id}`
      );
      assert.ok(
        VALID_ZONES.includes(project.zone),
        `Invalid zone "${project.zone}" on project ${project.id}`
      );
    }
  });

  test('zone assignments correctly partition projects', () => {
    const zone1 = SEED_PROJECTS.filter((p) => p.zone === 'zone-1');
    const zone2 = SEED_PROJECTS.filter((p) => p.zone === 'zone-2');
    const zone3 = SEED_PROJECTS.filter((p) => p.zone === 'zone-3');

    // Zone 1: Show & Tell (8 booths: ST01-ST08)
    assert.equal(zone1.length, 8, `Expected 8 booths in Zone 1, got ${zone1.length}`);
    for (const p of zone1) {
      assert.equal(p.category, 'Show & Tell');
      assert.ok(p.booth_code.startsWith('ST'), `Zone 1 booth code must start with ST: ${p.booth_code}`);
    }

    // Zone 2: Main Hall
    assert.ok(zone2.length >= 20, `Zone 2 should contain the main innovation pods, got ${zone2.length}`);

    // Zone 3: Robotics & Arenas (4 booths: R01, R02, S01, S02)
    assert.equal(zone3.length, 4, `Expected 4 booths in Zone 3, got ${zone3.length}`);
    for (const p of zone3) {
      assert.ok(
        ['Robo Race', 'Robo Soccer'].includes(p.category),
        `Zone 3 category must be Robo Race or Robo Soccer: ${p.category}`
      );
      assert.ok(
        ['R01', 'R02', 'S01', 'S02'].includes(p.booth_code),
        `Zone 3 booth code out of expected set: ${p.booth_code}`
      );
    }
  });

  test('3D spatial coordinates are within legal architectural bounds', () => {
    for (const p of SEED_PROJECTS) {
      assert.ok(
        p.position_x >= -35 && p.position_x <= 35,
        `Project ${p.id} position_x out of bounds: ${p.position_x}`
      );
      assert.ok(
        p.position_y >= -0.5 && p.position_y <= 5.0,
        `Project ${p.id} position_y out of bounds: ${p.position_y}`
      );
      assert.ok(
        p.position_z >= -35 && p.position_z <= 20,
        `Project ${p.id} position_z out of bounds: ${p.position_z}`
      );
    }
  });

  test('all projects have required metadata fields and valid image URLs', () => {
    for (const p of SEED_PROJECTS) {
      assert.ok(p.title && p.title.trim().length > 0, `Empty title on project ${p.id}`);
      assert.ok(p.description && p.description.trim().length > 0, `Empty description on project ${p.id}`);
      assert.ok(Array.isArray(p.members) && p.members.length > 0, `Missing members on project ${p.id}`);
      assert.ok(typeof p.vote_count === 'number' && p.vote_count >= 0, `Invalid vote_count on ${p.id}`);

      const isHttpOrRelative =
        p.image_url.startsWith('https://') ||
        p.image_url.startsWith('http://') ||
        p.image_url.startsWith('/');
      assert.ok(isHttpOrRelative, `Invalid image_url protocol on project ${p.id}: ${p.image_url}`);
    }
  });
});
