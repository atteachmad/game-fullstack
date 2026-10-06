"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, RotateCcw, Sparkles, Target, TrendingUp, type LucideIcon } from "lucide-react";

import BadgeCard3D from "@/components/gamification/BadgeCard3D";
import XPBar from "@/components/gamification/XPBar";
import Button3D from "@/components/ui/Button3D";
import Icon3D, { type Icon3DTone } from "@/components/ui/Icon3D";
import { BADGES } from "@/lib/data/badges";
import { TOTAL_MISSIONS } from "@/lib/data/missions";
import { countCompletedMissions, getNextMission } from "@/lib/progress";
import { formatNumber } from "@/lib/utils";
import { getLevelFromXp } from "@/lib/xp";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

const EMPTY_IDS: string[] = [];

interface StatCard {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: Icon3DTone;
}

export default function ProfileDashboard() {
  const hydrated = useHasHydrated();
  const storedXp = useGameStore((state) => state.xp);
  const storedCompleted = useGameStore((state) => state.completedMissionIds);
  const storedBadges = useGameStore((state) => state.unlockedBadgeIds);
  const resetProgress = useGameStore((state) => state.resetProgress);

  const [confirmingReset, setConfirmingReset] = useState(false);

  const xp = hydrated ? storedXp : 0;
  const completedIds = hydrated ? storedCompleted : EMPTY_IDS;
  const badgeIds = hydrated ? storedBadges : EMPTY_IDS;

  const unlockedBadgeCount = BADGES.filter((badge) => badgeIds.includes(badge.id)).length;
  const nextMission = getNextMission(completedIds);

  const stats: StatCard[] = [
    { label: "Level", value: String(getLevelFromXp(xp)), icon: TrendingUp, tone: "arcane" },
    { label: "Total XP", value: formatNumber(xp), icon: Sparkles, tone: "gold" },
    {
      label: "Misi selesai",
      value: `${countCompletedMissions(completedIds)} / ${TOTAL_MISSIONS}`,
      icon: Target,
      tone: "lime",
    },
    {
      label: "Lencana",
      value: `${unlockedBadgeCount} / ${BADGES.length}`,
      icon: Award,
      tone: "pink",
    },
  ];

  const handleReset = () => {
    resetProgress();
    setConfirmingReset(false);
  };

  return (
    <div className="space-y-12">
      <XPBar />

      {/* ---------- Statistik ---------- */}
      <section aria-label="Statistik pemain" className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07 }}
            className="neu-card flex items-center gap-4 p-5"
          >
            <Icon3D icon={stat.icon} tone={stat.tone} size="md" />
            <div className="min-w-0">
              <p className="truncate font-display text-2xl font-black tabular-nums">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ---------- Misi berikutnya ---------- */}
      <section className="neu-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        {nextMission ? (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-arcane-300">
                Misi berikutnya
              </p>
              <h2 className="font-display text-lg font-bold">{nextMission.title}</h2>
              <p className="mt-0.5 text-sm text-slate-400">
                Hadiah: +{formatNumber(nextMission.xpReward)} XP
              </p>
            </div>
            <Link href={`/missions/${nextMission.id}`} className="btn-3d shrink-0">
              Kerjakan Sekarang
            </Link>
          </>
        ) : (
          <p className="text-gradient-gold font-display text-lg font-bold">
            Semua misi sudah kamu taklukkan. Hebat!
          </p>
        )}
      </section>

      {/* ---------- Koleksi lencana ---------- */}
      <section className="space-y-6" aria-labelledby="badge-heading">
        <div>
          <h2 id="badge-heading" className="text-2xl font-black sm:text-3xl">
            Koleksi <span className="text-gradient-gold">Lencana</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Arahkan kursor ke lencana untuk memiringkannya. Lencana terkunci terbuka lewat misi tertentu.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BADGES.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (index % 4) * 0.07 }}
            >
              <BadgeCard3D badge={badge} unlocked={badgeIds.includes(badge.id)} className="h-full" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Zona berbahaya: reset ---------- */}
      <section className="neu-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">Atur ulang progres</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Menghapus XP, misi, dan lencana dari perangkat ini. Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>

        {confirmingReset ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <span className="text-sm text-neon-red">Yakin?</span>
            <Button3D variant="danger" size="sm" icon={<RotateCcw className="relative h-4 w-4" />} onClick={handleReset}>
              Ya, hapus
            </Button3D>
            <Button3D variant="ghost" size="sm" onClick={() => setConfirmingReset(false)}>
              Batal
            </Button3D>
          </div>
        ) : (
          <Button3D
            variant="ghost"
            size="sm"
            className="shrink-0"
            icon={<RotateCcw className="relative h-4 w-4" />}
            onClick={() => setConfirmingReset(true)}
          >
            Reset Progres
          </Button3D>
        )}
      </section>
    </div>
  );
}