import { NextResponse } from "next/server";

import type { ApiResponse } from "@/types";

/** Respons sukses dengan bentuk seragam: { ok: true, data }. */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ ok: true, data }, { status });
}

/** Respons gagal dengan bentuk seragam: { ok: false, error }. */
export function fail(error: string, status = 400) {
  return NextResponse.json<ApiResponse<never>>({ ok: false, error }, { status });
}

/** Membaca body JSON dengan aman. Mengembalikan null bila bukan objek JSON yang valid. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Mengambil string yang sudah dipangkas spasinya. Null bila bukan string atau di luar batas panjang. */
export function asString(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= max ? trimmed : null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}