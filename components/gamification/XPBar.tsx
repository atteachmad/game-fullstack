"use client";

import { motion } from "framer-motion";

import { cn, formatNumber } from "@/lib/utils";
import { getLevelProgress, getRankTitle } from "@/lib/xp";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

interface XPBarProps {
  className?: string;
}

/** Panel XP besar untuk halaman profil dan dashboard. */
export default function XPBar({ className }: XPBarProps) {
  const hydrated = useHasHydrated();
  const storedXp = useGameStore((state) => state.xp);
  const xp = hydrated ? storedXp : 0;

  const { level, progress, xpIntoLevel, xpForNext, isMaxLevel } = getLevelProgress(xp);
  const remaining = xpForNext - xpIntoLevel;

  return (
    <section
      aria-label="Progres XP"
      className={cn("neu-card flex items-center gap-5 p-6", className)}
    >
      <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-arcane-gradient font-display text-3xl font-black text-white shadow-glow-arcane [transform:rotate(-6deg)]">
        <span className="absolute inset-x-1.5 top-1.5 h-6 rounded-t-xl bg-white/25" />
        <span className="relative drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)]">{level}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h2 className="font-display text-xl font-bold">{getRankTitle(level)}</h2>
          <p className="text-sm tabular-nums text-slate-400">
            Total <span className="font-semibold text-neon-gold">{formatNumber(xp)} XP</span>
          </p>
        </div>

        <div
          className="xp-track mt-3"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label={`Progres menuju level berikutnya`}
        >
          <motion.div
            className="xp-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-400">
          {isMaxLevel
            ? "Level maksimum tercapai. Kamu adalah legenda!"
            : `${formatNumber(remaining)} XP lagi menuju Level ${level + 1}`}
        </p>
      </div>
    </section>
  );
}