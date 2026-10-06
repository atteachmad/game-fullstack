/* ============================================================
 * Tipe data global CodeQuest
 * ============================================================ */

export type Language =
  | "html"
  | "css"
  | "javascript"
  | "php"
  | "react"
  | "vue"
  | "laravel"
  | "nextjs";

export type Difficulty = "easy" | "medium" | "hard" | "boss";

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  /** Nama visual 3D yang dipakai BadgeCard3D (mis. "gem", "shield", "crown") */
  emblem: string;
}

/** Aturan pengecekan jawaban misi (bisa diserialisasi, siap pindah ke database) */
export interface MissionCheck {
  type: "includes" | "regex";
  value: string;
  /** Pesan yang tampil jika pengecekan gagal */
  message: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  zoneId: string;
  language: Language;
  difficulty: Difficulty;
  xpReward: number;
  badgeId?: string;
  starterCode: string;
  hint: string;
  checks: MissionCheck[];
  /** Objek 3D yang divisualisasikan dari kode pengguna */
  visual?: "switch" | "clipboard" | "none";
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  order: number;
  missionIds: string[];
}

/** Hasil pemberian hadiah dari store gamifikasi */
export interface RewardResult {
  awarded: boolean;
  leveledUp: boolean;
  newLevel: number;
  newBadge: boolean;
}

export interface LevelProgress {
  level: number;
  /** XP yang sudah dikumpulkan di dalam level saat ini */
  xpIntoLevel: number;
  /** Total XP yang dibutuhkan untuk naik dari level ini ke level berikutnya */
  xpForNext: number;
  /** Nilai 0 sampai 1 */
  progress: number;
  isMaxLevel: boolean;
}

/* ---------- API & simulasi ---------- */

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export type SimulationStatus = "idle" | "processing" | "success" | "failed";

export type PaymentProvider = "midtrans" | "xendit" | "stripe";

/* ---------- Playground wireframe ---------- */

export type WireframeShapeType =
  | "rectangle"
  | "circle"
  | "text"
  | "button"
  | "input"
  | "image";

export interface WireframeShape {
  id: string;
  type: WireframeShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}