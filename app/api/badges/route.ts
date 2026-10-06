import { fail, ok } from "@/lib/api";
import { BADGES } from "@/lib/data/badges";
import { DEMO_USER_ID, repository } from "@/lib/mock-db";
import type { BadgeRarity } from "@/types";

export const dynamic = "force-dynamic";

const RARITIES: readonly BadgeRarity[] = ["common", "rare", "epic", "legendary"];

/** GET /api/badges?rarity=epic  daftar lencana beserta status terbuka. */
export async function GET(request: Request) {
  const rarity = new URL(request.url).searchParams.get("rarity");
  if (rarity && !RARITIES.includes(rarity as BadgeRarity)) {
    return fail("Parameter rarity tidak dikenal.");
  }

  const user = await repository.getUser(DEMO_USER_ID);
  if (!user) return fail("Pengguna tidak ditemukan.", 404);

  const badges = BADGES.filter((badge) => !rarity || badge.rarity === rarity).map((badge) => ({
    ...badge,
    unlocked: user.unlockedBadgeIds.includes(badge.id),
  }));

  return ok({
    badges,
    unlockedCount: badges.filter((badge) => badge.unlocked).length,
    total: badges.length,
  });
}