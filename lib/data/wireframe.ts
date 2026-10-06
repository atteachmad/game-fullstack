import { clamp } from "@/lib/utils";
import type { WireframeShape, WireframeShapeType } from "@/types";

/* ============================================================
 * Konstanta kanvas (koordinat logis, kanvas diskalakan otomatis)
 * ============================================================ */

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 520;
export const GRID_SIZE = 8;
export const MIN_SHAPE_SIZE = 24;
export const MAX_SHAPES = 40;
export const STORAGE_KEY = "codequest-wireframe";

/** Tantangan desainer: hadiah XP satu kali. */
export const CHALLENGE_MISSION_ID = "wireframe-first-design";
export const CHALLENGE_XP = 40;

/* ============================================================
 * Definisi bentuk
 * ============================================================ */

export interface ShapeDefinition {
  type: WireframeShapeType;
  name: string;
  width: number;
  height: number;
  defaultLabel: string;
}

export const SHAPE_DEFINITIONS: Record<WireframeShapeType, ShapeDefinition> = {
  rectangle: { type: "rectangle", name: "Kotak", width: 160, height: 96, defaultLabel: "" },
  circle: { type: "circle", name: "Lingkaran", width: 96, height: 96, defaultLabel: "" },
  text: { type: "text", name: "Teks", width: 200, height: 32, defaultLabel: "Teks di sini" },
  button: { type: "button", name: "Tombol", width: 144, height: 48, defaultLabel: "Tombol" },
  input: { type: "input", name: "Kolom isian", width: 240, height: 40, defaultLabel: "Placeholder" },
  image: { type: "image", name: "Gambar", width: 176, height: 128, defaultLabel: "Gambar" },
};

export const SHAPE_ORDER: readonly WireframeShapeType[] = [
  "rectangle",
  "circle",
  "text",
  "button",
  "input",
  "image",
];

/* ============================================================
 * Helper
 * ============================================================ */

let idCounter = 0;

/** ID unik. Hanya dipanggil setelah interaksi pengguna, jadi aman dari hydration mismatch. */
export function createId(): string {
  idCounter += 1;
  return `shape-${Date.now().toString(36)}-${idCounter}`;
}

export function snap(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

/** Memastikan ukuran dan posisi bentuk selalu berada di dalam kanvas. */
export function constrainShape(shape: WireframeShape): WireframeShape {
  const width = clamp(shape.width, MIN_SHAPE_SIZE, CANVAS_WIDTH);
  const height = clamp(shape.height, MIN_SHAPE_SIZE, CANVAS_HEIGHT);
  return {
    ...shape,
    width,
    height,
    x: clamp(shape.x, 0, CANVAS_WIDTH - width),
    y: clamp(shape.y, 0, CANVAS_HEIGHT - height),
  };
}

export function createShape(type: WireframeShapeType, x = 48, y = 48): WireframeShape {
  const def = SHAPE_DEFINITIONS[type];
  return constrainShape({
    id: createId(),
    type,
    x,
    y,
    width: def.width,
    height: def.height,
    label: def.defaultLabel,
  });
}

/** Membersihkan data dari localStorage agar data rusak tidak merusak halaman. */
export function sanitizeShapes(raw: unknown): WireframeShape[] {
  if (!Array.isArray(raw)) return [];

  const result: WireframeShape[] = [];
  for (const entry of raw) {
    if (result.length >= MAX_SHAPES) break;
    if (typeof entry !== "object" || entry === null) continue;

    const candidate = entry as Record<string, unknown>;
    const type = candidate.type;

    if (typeof candidate.id !== "string") continue;
    if (typeof type !== "string" || !(type in SHAPE_DEFINITIONS)) continue;

    const numbers = [candidate.x, candidate.y, candidate.width, candidate.height];
    if (!numbers.every((value) => typeof value === "number" && Number.isFinite(value))) continue;

    result.push(
      constrainShape({
        id: candidate.id,
        type: type as WireframeShapeType,
        x: candidate.x as number,
        y: candidate.y as number,
        width: candidate.width as number,
        height: candidate.height as number,
        label: typeof candidate.label === "string" ? candidate.label.slice(0, 60) : undefined,
      })
    );
  }
  return result;
}

/* ============================================================
 * Template
 * ============================================================ */

type ShapeSeed = Omit<WireframeShape, "id">;

export interface WireframeTemplate {
  id: string;
  name: string;
  description: string;
  shapes: ShapeSeed[];
}

export const TEMPLATES: WireframeTemplate[] = [
  {
    id: "login",
    name: "Halaman Login",
    description: "Kartu masuk dengan logo, dua kolom isian, dan tombol.",
    shapes: [
      { type: "rectangle", x: 240, y: 64, width: 320, height: 400, label: "Kartu" },
      { type: "circle", x: 352, y: 88, width: 96, height: 96, label: "Logo" },
      { type: "text", x: 280, y: 200, width: 240, height: 32, label: "Masuk ke akun" },
      { type: "input", x: 280, y: 248, width: 240, height: 40, label: "Email" },
      { type: "input", x: 280, y: 304, width: 240, height: 40, label: "Kata sandi" },
      { type: "button", x: 280, y: 368, width: 240, height: 48, label: "Masuk" },
    ],
  },
  {
    id: "landing",
    name: "Landing Page",
    description: "Navbar, judul besar, ilustrasi, dan tiga kartu fitur.",
    shapes: [
      { type: "rectangle", x: 16, y: 16, width: 768, height: 48, label: "Navbar" },
      { type: "text", x: 48, y: 112, width: 400, height: 48, label: "Judul besar yang menarik" },
      { type: "text", x: 48, y: 176, width: 400, height: 56, label: "Deskripsi singkat produkmu" },
      { type: "button", x: 48, y: 256, width: 176, height: 48, label: "Mulai Sekarang" },
      { type: "image", x: 496, y: 96, width: 272, height: 224, label: "Ilustrasi" },
      { type: "rectangle", x: 48, y: 352, width: 216, height: 136, label: "Fitur 1" },
      { type: "rectangle", x: 288, y: 352, width: 216, height: 136, label: "Fitur 2" },
      { type: "rectangle", x: 528, y: 352, width: 216, height: 136, label: "Fitur 3" },
    ],
  },
  {
    id: "dashboard",
    name: "Dasbor",
    description: "Sidebar, kartu statistik, grafik, dan kolom pencarian.",
    shapes: [
      { type: "rectangle", x: 16, y: 16, width: 160, height: 488, label: "Sidebar" },
      { type: "text", x: 200, y: 24, width: 360, height: 40, label: "Dasbor" },
      { type: "circle", x: 728, y: 24, width: 48, height: 48, label: "Avatar" },
      { type: "rectangle", x: 200, y: 88, width: 176, height: 104, label: "Statistik 1" },
      { type: "rectangle", x: 392, y: 88, width: 176, height: 104, label: "Statistik 2" },
      { type: "rectangle", x: 584, y: 88, width: 176, height: 104, label: "Statistik 3" },
      { type: "rectangle", x: 200, y: 216, width: 560, height: 200, label: "Grafik" },
      { type: "input", x: 200, y: 440, width: 400, height: 40, label: "Cari data..." },
      { type: "button", x: 624, y: 440, width: 136, height: 40, label: "Cari" },
    ],
  },
];

export function instantiateTemplate(templateId: string): WireframeShape[] {
  const template = TEMPLATES.find((item) => item.id === templateId);
  if (!template) return [];
  return template.shapes.map((seed) => constrainShape({ ...seed, id: createId() }));
}

/* ============================================================
 * Tantangan desainer
 * ============================================================ */

export interface ChallengeItem {
  label: string;
  done: boolean;
}

export function evaluateChallenge(shapes: WireframeShape[]): ChallengeItem[] {
  return [
    { label: "Letakkan minimal 5 elemen di kanvas", done: shapes.length >= 5 },
    { label: "Tambahkan sebuah tombol", done: shapes.some((s) => s.type === "button") },
    { label: "Tambahkan sebuah kolom isian", done: shapes.some((s) => s.type === "input") },
  ];
}

/* ============================================================
 * Ekspor ke kerangka HTML
 * ============================================================ */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Mengubah wireframe menjadi kerangka HTML, diurutkan dari atas ke bawah. */
export function generateHtml(shapes: WireframeShape[]): string {
  if (shapes.length === 0) return "<!-- Wireframe masih kosong. Tambahkan elemen di kanvas. -->";

  const sorted = [...shapes].sort((a, b) => a.y - b.y || a.x - b.x);

  const lines = sorted.map((shape) => {
    const label = escapeHtml((shape.label ?? "").trim());
    switch (shape.type) {
      case "text":
        return shape.height >= 40
          ? `  <h2>${label || "Judul"}</h2>`
          : `  <p>${label || "Teks"}</p>`;
      case "button":
        return `  <button type="button">${label || "Tombol"}</button>`;
      case "input":
        return `  <input type="text" placeholder="${label}" />`;
      case "image":
        return `  <img src="gambar.jpg" alt="${label || "Gambar"}" />`;
      case "circle":
        return `  <div class="lingkaran">${label}</div>`;
      case "rectangle":
        return `  <div class="kotak">${label}</div>`;
    }
  });

  return `<main>\n${lines.join("\n")}\n</main>`;
}