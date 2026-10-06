import type { Language, MissionCheck } from "@/types";

export interface CheckResult {
  passed: boolean;
  failures: string[];
}

/**
 * Menghapus komentar sebelum pengecekan. Tanpa ini, petunjuk di kode awal
 * (misalnya "<!-- tambahkan <p> -->") akan dianggap sebagai jawaban benar.
 */
export function stripComments(code: string, language: Language): string {
  switch (language) {
    case "html":
      return code.replace(/<!--[\s\S]*?-->/g, "");
    case "css":
      return code.replace(/\/\*[\s\S]*?\*\//g, "");
    default:
      return code
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
  }
}

/** Menjalankan semua aturan misi terhadap kode pengguna. */
export function runChecks(
  code: string,
  language: Language,
  checks: MissionCheck[]
): CheckResult {
  const clean = stripComments(code, language);
  const lower = clean.toLowerCase();
  const failures: string[] = [];

  for (const check of checks) {
    let ok = false;

    if (check.type === "includes") {
      ok = lower.includes(check.value.toLowerCase());
    } else {
      try {
        ok = new RegExp(check.value, "i").test(clean);
      } catch {
        ok = false;
      }
    }

    if (!ok) failures.push(check.message);
  }

  return { passed: failures.length === 0, failures };
}