import { asString, fail, ok, readJson } from "@/lib/api";
import { getMissionById } from "@/lib/data/missions";
import { DEMO_USER_ID, repository } from "@/lib/mock-db";
import type { UserRecord } from "@/lib/mock-db/schema";
import { getMissionStatus } from "@/lib/progress";
import { getLevelFromXp, getLevelProgress, getRankTitle } from "@/lib/xp";

export const dynamic = "force-dynamic";

function toDto(user: UserRecord) {
  const levelProgress = getLevelProgress(user.xp);
  return {
    userId: user.id,
    displayName: user.displayName,
    xp: user.xp,
    level: levelProgress.level,
    rank: getRankTitle(levelProgress.level),
    levelProgress,
    completedMissionIds: user.completedMissionIds,
    unlockedBadgeIds: user.unlockedBadgeIds,
  };
}

/** GET /api/progress: progres pemain saat ini. */
export async function GET() {
  const user = await repository.getUser(DEMO_USER_ID);
  if (!user) return fail("Pengguna tidak ditemukan.", 404);
  return ok(toDto(user));
}

/** POST /api/progress  body: { missionId }  menyelesaikan misi dan memberi hadiah. */
export async function POST(request: Request) {
  const body = await readJson(request);
  const missionId = body ? asString(body.missionId, 1, 80) : null;
  if (!missionId) return fail("Field missionId wajib diisi.");

  const mission = getMissionById(missionId);
  if (!mission) return fail("Misi tidak ditemukan.", 404);

  const user = await repository.getUser(DEMO_USER_ID);
  if (!user) return fail("Pengguna tidak ditemukan.", 404);

  if (user.completedMissionIds.includes(mission.id)) {
    return ok({
      awarded: false,
      leveledUp: false,
      newLevel: getLevelFromXp(user.xp),
      newBadge: false,
      progress: toDto(user),
    });
  }

  // Aturan buka kunci dijaga di server juga, bukan hanya di tampilan
  if (getMissionStatus(mission.id, user.completedMissionIds) === "locked") {
    return fail("Misi masih terkunci. Selesaikan misi sebelumnya dulu.", 403);
  }

  const previousLevel = getLevelFromXp(user.xp);
  const nextXp = user.xp + mission.xpReward;
  const newLevel = getLevelFromXp(nextXp);

  const badgeId = mission.badgeId;
  const newBadge = badgeId !== undefined && !user.unlockedBadgeIds.includes(badgeId);

  const updated = await repository.updateUser(user.id, {
    xp: nextXp,
    completedMissionIds: [...user.completedMissionIds, mission.id],
    unlockedBadgeIds: newBadge && badgeId ? [...user.unlockedBadgeIds, badgeId] : user.unlockedBadgeIds,
  });
  if (!updated) return fail("Gagal menyimpan progres.", 500);

  return ok({
    awarded: true,
    leveledUp: newLevel > previousLevel,
    newLevel,
    newBadge,
    progress: toDto(updated),
  });
}

/** DELETE /api/progress: mengatur ulang progres pemain demo. */
export async function DELETE() {
  const user = await repository.resetUser(DEMO_USER_ID);
  if (!user) return fail("Pengguna tidak ditemukan.", 404);
  return ok(toDto(user));
}