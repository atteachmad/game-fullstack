import type { Database } from "@/lib/mock-db/schema";

/** Pengguna demo tunggal. Setelah ada login sungguhan, ID ini diganti ID pengguna aktif. */
export const DEMO_USER_ID = "demo-user";

export function createSeedDatabase(): Database {
  const now = new Date().toISOString();

  return {
    users: [
      {
        id: DEMO_USER_ID,
        displayName: "Petualang Demo",
        xp: 0,
        completedMissionIds: [],
        unlockedBadgeIds: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
    payments: [],
    crmEvents: [],
  };
}