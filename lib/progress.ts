import { ZONES, getMissionById } from "@/lib/data/missions";
import type { Mission } from "@/types";

export type MissionStatus = "completed" | "available" | "locked";

/** Seluruh misi dalam urutan petualangan: zona 1 sampai terakhir, lalu misi di dalamnya. */
export const ORDERED_MISSIONS: Mission[] = [...ZONES]
  .sort((a, b) => a.order - b.order)
  .flatMap((zone) => zone.missionIds.map((id) => getMissionById(id)))
  .filter((mission): mission is Mission => mission !== undefined);

/**
 * Aturan buka kunci: misi pertama selalu terbuka.
 * Misi lainnya terbuka setelah misi sebelumnya (dalam urutan global) selesai.
 */
export function getMissionStatus(
  missionId: string,
  completedIds: readonly string[]
): MissionStatus {
  if (completedIds.includes(missionId)) return "completed";

  const index = ORDERED_MISSIONS.findIndex((mission) => mission.id === missionId);
  if (index === -1) return "locked";
  if (index === 0) return "available";

  const previous = ORDERED_MISSIONS[index - 1];
  return completedIds.includes(previous.id) ? "available" : "locked";
}

/** Misi pertama yang belum selesai, atau undefined jika semua sudah tamat. */
export function getNextMission(
  completedIds: readonly string[]
): Mission | undefined {
  return ORDERED_MISSIONS.find((mission) => !completedIds.includes(mission.id));
}

/** Jumlah misi sungguhan yang selesai (mengabaikan ID bonus seperti "welcome-bonus"). */
export function countCompletedMissions(completedIds: readonly string[]): number {
  return ORDERED_MISSIONS.filter((mission) => completedIds.includes(mission.id)).length;
}