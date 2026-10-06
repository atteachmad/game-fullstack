import { clamp } from "@/lib/utils";

/* ============================================================
 * Pembaca CSS sederhana: mengubah kode pengguna menjadi
 * spesifikasi yang dipakai untuk menggambar objek 3D.
 * ============================================================ */

interface Rule {
  selector: string;
  decls: Record<string, string>;
}

const COLOR = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/i;
const SHADOW =
  /(-?\d+(?:\.\d+)?)(?:px)?\s+(-?\d+(?:\.\d+)?)(?:px)?(?:\s+(-?\d+(?:\.\d+)?)(?:px)?)?/;

function parseRules(css: string): Rule[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: Rule[] = [];
  const pattern = /([^{}]+)\{([^{}]*)\}/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(clean)) !== null) {
    const decls: Record<string, string> = {};
    for (const part of match[2].split(";")) {
      const index = part.indexOf(":");
      if (index < 0) continue;
      const key = part.slice(0, index).trim().toLowerCase();
      const value = part.slice(index + 1).trim();
      if (key && value) decls[key] = value;
    }
    rules.push({ selector: match[1].trim(), decls });
  }
  return rules;
}

function mergeDecls(rules: Rule[]): Record<string, string> {
  return rules.reduce<Record<string, string>>(
    (acc, rule) => ({ ...acc, ...rule.decls }),
    {}
  );
}

export interface SwitchSpec {
  /** Warna badan tombol. */
  color: string;
  /** Warna sisi tebal tombol (dari warna box-shadow). */
  sideColor: string;
  /** Ketebalan tombol dalam piksel (0 = datar). */
  depth: number;
  /** Seberapa jauh tombol turun saat ditekan (dari transform di :active). */
  pressTravel: number;
  /** Apakah :active punya efek transform. */
  hasPressEffect: boolean;
  /** Radius sudut dalam piksel. */
  radius: number;
}

export const DEFAULT_SWITCH_COLOR = "#7c3aed";
export const DEFAULT_SIDE_COLOR = "#3b1d8f";

/** Membaca CSS tombol pengguna menjadi spesifikasi sakelar mekanis. */
export function parseSwitchSpec(css: string): SwitchSpec {
  const rules = parseRules(css);

  const targets = rules.filter((rule) =>
    /button|\.btn|\.key|\.switch/i.test(rule.selector)
  );
  const pool = targets.length > 0 ? targets : rules;

  const isPseudo = (selector: string) =>
    /:(hover|active|focus|disabled)/i.test(selector);
  const isActive = (selector: string) => /:active/i.test(selector);

  const base = mergeDecls(pool.filter((rule) => !isPseudo(rule.selector)));
  const active = mergeDecls(pool.filter((rule) => isActive(rule.selector)));

  // Warna badan
  const bgValue = base["background-color"] ?? base["background"] ?? "";
  const color = bgValue.match(COLOR)?.[0] ?? DEFAULT_SWITCH_COLOR;

  // Ketebalan dari box-shadow. Bayangan padat (blur 0) = tebal, bayangan lembut = tipis.
  let depth = 0;
  let sideColor = DEFAULT_SIDE_COLOR;
  const shadowValue = base["box-shadow"];
  if (shadowValue) {
    const shadow = shadowValue.match(SHADOW);
    if (shadow) {
      const offsetY = Number(shadow[2]);
      const blur = shadow[3] !== undefined ? Number(shadow[3]) : 0;
      if (offsetY > 0) {
        depth = blur === 0 ? offsetY : Math.round(offsetY / 3);
      }
    }
    sideColor = shadowValue.match(COLOR)?.[0] ?? DEFAULT_SIDE_COLOR;
  }
  depth = clamp(depth, 0, 16);

  // Efek tekan dari transform di :active
  const transform = active["transform"] ?? "";
  const travelMatch =
    transform.match(/translateY\(\s*(-?\d+(?:\.\d+)?)px/i) ??
    transform.match(/translate\(\s*[^,)]*,\s*(-?\d+(?:\.\d+)?)px/i);
  const hasPressEffect = /translate/i.test(transform);
  const rawTravel = travelMatch ? Math.max(0, Number(travelMatch[1])) : 0;
  const pressTravel = hasPressEffect
    ? clamp(rawTravel, 0, depth > 0 ? depth : 12)
    : 0;

  // Sudut membulat
  const radiusMatch = (base["border-radius"] ?? "").match(/(\d+(?:\.\d+)?)px/);
  const radius = radiusMatch ? clamp(Number(radiusMatch[1]), 0, 44) : 4;

  return { color, sideColor, depth, pressTravel, hasPressEffect, radius };
}