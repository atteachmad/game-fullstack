import { asString, fail, ok, readJson } from "@/lib/api";
import { MISSIONS, ZONES, getMissionById } from "@/lib/data/missions";
import { ALL_LANGUAGES } from "@/lib/data/suggestions";
import { runChecks } from "@/lib/mission-check";
import type { Language, Mission } from "@/types";

export const dynamic = "force-dynamic";

const MAX_CODE_LENGTH = 20000;

/** Bentuk publik misi: aturan pengecekan tidak ikut dikirim ke klien. */
function toPublicMission(mission: Mission) {
  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    zoneId: mission.zoneId,
    language: mission.language,
    difficulty: mission.difficulty,
    xpReward: mission.xpReward,
    badgeId: mission.badgeId,
    starterCode: mission.starterCode,
    hint: mission.hint,
    visual: mission.visual,
    checkCount: mission.checks.length,
  };
}

/** GET /api/missions?zone=css-mountain&language=css  daftar misi dan zona. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const zone = params.get("zone");
  const language = params.get("language");

  if (language && !ALL_LANGUAGES.includes(language as Language)) {
    return fail("Parameter language tidak dikenal.");
  }

  const missions = MISSIONS.filter(
    (mission) => (!zone || mission.zoneId === zone) && (!language || mission.language === language)
  ).map(toPublicMission);

  return ok({ zones: ZONES, missions });
}

/** POST /api/missions  body: { missionId, code }  memeriksa jawaban di server (tanpa memberi XP). */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("Body harus berupa objek JSON.");

  const missionId = asString(body.missionId, 1, 80);
  if (!missionId) return fail("Field missionId wajib diisi.");

  if (typeof body.code !== "string" || body.code.length > MAX_CODE_LENGTH) {
    return fail("Field code wajib berupa teks maksimal 20.000 karakter.");
  }

  const mission = getMissionById(missionId);
  if (!mission) return fail("Misi tidak ditemukan.", 404);

  const result = runChecks(body.code, mission.language, mission.checks);
  return ok(result);
}