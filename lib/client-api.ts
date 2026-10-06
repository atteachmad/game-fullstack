import type { ApiResponse } from "@/types";

/**
 * POST JSON dari browser dengan penanganan error yang seragam.
 * Tidak pernah melempar error: selalu mengembalikan { ok, data?, error? }.
 */
export async function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return { ok: false, error: "Tidak bisa terhubung ke server. Coba lagi sebentar." };
  }
}