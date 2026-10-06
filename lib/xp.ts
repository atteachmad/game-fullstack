import type { LevelProgress } from "@/types";
import { clamp } from "@/lib/utils";

export const MAX_LEVEL = 50;

/**
 * Total XP kumulatif yang dibutuhkan untuk MENCAPAI sebuah level.
 * Level 1 = 0, Level 2 = 100, Level 3 = 300, Level 4 = 600, dst.
 */
export function xpForLevel(level: number): number {
  const l = clamp(Math.floor(level), 1, MAX_LEVEL);
  return 50 * (l - 1) * l;
}

/** Menghitung level dari total XP. */
export function getLevelFromXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp));

  let level = Math.floor((1 + Math.sqrt(1 + (4 * safeXp) / 50)) / 2);
  level = clamp(level, 1, MAX_LEVEL);

  // Koreksi kecil untuk menghindari error pembulatan floating point
  while (level < MAX_LEVEL && safeXp >= xpForLevel(level + 1)) level++;
  while (level > 1 && safeXp < xpForLevel(level)) level--;

  return level;
}

/** Detail progres di dalam level saat ini (untuk XP bar). */
export function getLevelProgress(xp: number): LevelProgress {
  const safeXp = Math.max(0, Math.floor(xp));
  const level = getLevelFromXp(safeXp);

  if (level >= MAX_LEVEL) {
    return { level, xpIntoLevel: 0, xpForNext: 0, progress: 1, isMaxLevel: true };
  }

  const currentFloor = xpForLevel(level);
  const nextFloor = xpForLevel(level + 1);
  const xpForNext = nextFloor - currentFloor;
  const xpIntoLevel = safeXp - currentFloor;

  return {
    level,
    xpIntoLevel,
    xpForNext,
    progress: clamp(xpIntoLevel / xpForNext, 0, 1),
    isMaxLevel: false,
  };
}

const RANKS: ReadonlyArray<{ minLevel: number; title: string }> = [
  { minLevel: 1, title: "Novice Coder" },
  { minLevel: 3, title: "Script Apprentice" },
  { minLevel: 5, title: "Pixel Knight" },
  { minLevel: 8, title: "Logic Mage" },
  { minLevel: 12, title: "Code Ranger" },
  { minLevel: 16, title: "Stack Paladin" },
  { minLevel: 22, title: "Framework Archmage" },
  { minLevel: 30, title: "Full-Stack Champion" },
  { minLevel: 40, title: "Legendary Architect" },
];

/** Gelar pemain berdasarkan level. */
export function getRankTitle(level: number): string {
  let title = RANKS[0].title;
  for (const rank of RANKS) {
    if (level >= rank.minLevel) title = rank.title;
  }
  return title;
}