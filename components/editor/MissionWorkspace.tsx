"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Box,
  CheckCheck,
  Lightbulb,
  Lock,
  Map as MapIcon,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";

import CodeEditor from "@/components/editor/CodeEditor";
import LivePreview from "@/components/editor/LivePreview";
import BadgeCard3D from "@/components/gamification/BadgeCard3D";
import ParticleBurst from "@/components/gamification/ParticleBurst";
import Clipboard3D from "@/components/three-d/Clipboard3D";
import MechanicalSwitch3D from "@/components/three-d/MechanicalSwitch3D";
import Button3D from "@/components/ui/Button3D";
import { getBadgeById } from "@/lib/data/badges";
import { LANGUAGE_LABELS } from "@/lib/data/suggestions";
import { runChecks } from "@/lib/mission-check";
import { ORDERED_MISSIONS, getMissionStatus } from "@/lib/progress";
import { cn, formatNumber } from "@/lib/utils";
import { getRankTitle } from "@/lib/xp";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import type { Difficulty, Mission, RewardResult } from "@/types";

const EMPTY_IDS: string[] = [];

const DIFFICULTY: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: "Mudah", className: "text-neon-lime" },
  medium: { label: "Sedang", className: "text-neon-cyan" },
  hard: { label: "Sulit", className: "text-neon-pink" },
  boss: { label: "Bos", className: "text-neon-gold" },
};

type Phase = "idle" | "failed" | "passed";

export default function MissionWorkspace({ mission }: { mission: Mission }) {
  const hydrated = useHasHydrated();
  const storedCompleted = useGameStore((state) => state.completedMissionIds);
  const completeMission = useGameStore((state) => state.completeMission);

  const completedIds = hydrated ? storedCompleted : EMPTY_IDS;
  const status = getMissionStatus(mission.id, completedIds);

  const [code, setCode] = useState(mission.starterCode);
  const [phase, setPhase] = useState<Phase>("idle");
  const [failures, setFailures] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [burst, setBurst] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [reward, setReward] = useState<RewardResult | null>(null);

  const difficulty = DIFFICULTY[mission.difficulty];
  const badge = mission.badgeId ? getBadgeById(mission.badgeId) : undefined;

  const currentIndex = ORDERED_MISSIONS.findIndex((item) => item.id === mission.id);
  const nextMission = currentIndex >= 0 ? ORDERED_MISSIONS[currentIndex + 1] : undefined;

  const handleCheck = () => {
    const result = runChecks(code, mission.language, mission.checks);

    if (!result.passed) {
      setFailures(result.failures);
      setPhase("failed");
      setShakeKey((key) => key + 1);
      return;
    }

    const outcome = completeMission(mission.id, mission.xpReward, mission.badgeId);
    setReward(outcome);
    setFailures([]);
    setPhase("passed");
    setBurst((value) => value + 1);
  };

  const handleReset = () => {
    setCode(mission.starterCode);
    setPhase("idle");
    setFailures([]);
    setReward(null);
  };

  /* ---------- Menunggu data tersimpan dimuat ---------- */
  if (!hydrated) {
    return <div className="neu-card h-96 animate-pulse" aria-busy="true" aria-label="Memuat misi" />;
  }

  /* ---------- Misi terkunci ---------- */
  if (status === "locked") {
    return (
      <section className="neu-card mx-auto flex max-w-lg flex-col items-center gap-5 p-10 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-void-900 shadow-neu-inset">
          <Lock className="h-9 w-9 text-slate-500" />
        </div>
        <h1 className="font-display text-2xl font-black">Misi Terkunci</h1>
        <p className="text-slate-400">
          Selesaikan misi sebelumnya di peta untuk membuka misi
          <span className="font-semibold text-slate-200"> {mission.title}</span>.
        </p>
        <Link href="/world-map" className="btn-3d">
          <MapIcon className="h-4 w-4" />
          Kembali ke Peta Dunia
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* ---------- Kepala misi ---------- */}
      <header className="space-y-4">
        <Link
          href="/world-map"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Peta Dunia
        </Link>

        <div className="neu-card space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold text-slate-200">
              {LANGUAGE_LABELS[mission.language]}
            </span>
            <span className={cn("font-semibold", difficulty.className)}>{difficulty.label}</span>
            <span className="tabular-nums font-semibold text-neon-gold">
              +{formatNumber(mission.xpReward)} XP
            </span>
            {status === "completed" && (
              <span className="rounded-full bg-neon-lime/15 px-2.5 py-1 font-semibold text-neon-lime">
                Sudah selesai
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">{mission.title}</h1>
          <p className="max-w-3xl leading-relaxed text-slate-400">{mission.description}</p>

          <ul className="space-y-1.5 pt-1" aria-label="Syarat misi">
            {mission.checks.map((check) => (
              <li key={check.message} className="flex items-start gap-2 text-sm text-slate-300">
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-arcane-400" />
                {check.message}
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ---------- Editor dan hasil ---------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={mission.language}
          height="340px"
        />

        <div className="space-y-6">
          <LivePreview
            language={mission.language}
            code={code}
            minHeight={mission.visual === "none" || !mission.visual ? 340 : 200}
          />

          {mission.visual && mission.visual !== "none" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-display font-semibold text-slate-200">
                <Box className="h-4 w-4 text-neon-cyan" />
                Wujud fisik kodemu
              </div>
              {mission.visual === "switch" ? (
                <MechanicalSwitch3D code={code} />
              ) : (
                <Clipboard3D code={code} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Aksi ---------- */}
      <section className="neu-card space-y-5 p-6" aria-label="Aksi misi">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <ParticleBurst trigger={burst} count={26} distance={150} />
            <Button3D
              variant="success"
              size="lg"
              icon={<CheckCheck className="relative h-5 w-5" />}
              onClick={handleCheck}
              disabled={phase === "passed"}
            >
              {phase === "passed" ? "Misi Selesai" : "Periksa Jawaban"}
            </Button3D>
          </div>

          <Button3D
            variant="ghost"
            icon={<Lightbulb className="relative h-4 w-4" />}
            onClick={() => setShowHint((value) => !value)}
            aria-expanded={showHint}
          >
            {showHint ? "Sembunyikan Petunjuk" : "Petunjuk"}
          </Button3D>

          <Button3D
            variant="ghost"
            icon={<RotateCcw className="relative h-4 w-4" />}
            onClick={handleReset}
          >
            Ulangi dari Awal
          </Button3D>
        </div>

        <AnimatePresence initial={false}>
          {showHint && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="rounded-xl bg-neon-gold/10 px-4 py-3 text-sm text-neon-gold ring-1 ring-neon-gold/30">
                <Lightbulb className="mr-2 inline h-4 w-4" />
                {mission.hint}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Umpan balik gagal */}
        <AnimatePresence mode="wait">
          {phase === "failed" && (
            <motion.div
              key={`fail-${shakeKey}`}
              role="alert"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="animate-shake-x rounded-2xl bg-neon-red/10 p-4 ring-1 ring-neon-red/40"
            >
              <p className="mb-2 font-display text-sm font-bold text-neon-red">
                Belum tepat. Perbaiki hal berikut:
              </p>
              <ul className="space-y-1.5">
                {failures.map((message) => (
                  <li key={message} className="flex items-start gap-2 text-sm text-slate-200">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-neon-red" />
                    {message}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ---------- Hadiah ---------- */}
      <AnimatePresence>
        {phase === "passed" && reward && (
          <motion.section
            key="reward"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="neu-card relative overflow-hidden p-8"
          >
            <div aria-hidden="true" className="absolute inset-0 bg-gold-gradient opacity-10" />

            <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              {reward.newBadge && badge && (
                <div className="w-52 shrink-0">
                  <BadgeCard3D badge={badge} unlocked />
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-3">
                {reward.awarded ? (
                  <>
                    <h2 className="text-gradient-gold text-glow font-display text-3xl font-black">
                      Misi Selesai!
                    </h2>
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-display font-bold text-neon-gold">
                      <Sparkles className="h-4 w-4" />+{formatNumber(mission.xpReward)} XP
                    </p>
                    {reward.leveledUp && (
                      <p className="text-slate-200">
                        Naik ke <span className="font-bold text-neon-cyan">Level {reward.newLevel}</span>
                        {" "}sebagai {getRankTitle(reward.newLevel)}
                      </p>
                    )}
                    {reward.newBadge && badge && (
                      <p className="text-slate-300">
                        Lencana baru terbuka: <span className="font-semibold text-white">{badge.name}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-2xl font-black">Jawabanmu benar!</h2>
                    <p className="text-slate-400">
                      Misi ini sudah pernah kamu selesaikan, jadi tidak ada XP tambahan.
                    </p>
                  </>
                )}

                <div className="flex flex-wrap justify-center gap-3 pt-2 sm:justify-start">
                  {nextMission ? (
                    <Link href={`/missions/${nextMission.id}`} className="btn-3d">
                      Misi Berikutnya
                    </Link>
                  ) : (
                    <Link href="/profile" className="btn-3d">
                      Lihat Profil
                    </Link>
                  )}
                  <Link
                    href="/world-map"
                    className="glass inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-display font-semibold transition hover:bg-white/10"
                  >
                    <MapIcon className="h-4 w-4" />
                    Peta Dunia
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}