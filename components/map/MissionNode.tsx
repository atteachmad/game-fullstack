"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, Swords } from "lucide-react";

import { cn, formatNumber } from "@/lib/utils";
import type { MissionStatus } from "@/lib/progress";
import type { Difficulty, Language, Mission } from "@/types";

const LANGUAGE_LABEL: Record<Language, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  php: "PHP",
  react: "React",
  vue: "Vue",
  laravel: "Laravel",
  nextjs: "Next.js",
};

const DIFFICULTY_STYLE: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: "Mudah", className: "text-neon-lime" },
  medium: { label: "Sedang", className: "text-neon-cyan" },
  hard: { label: "Sulit", className: "text-neon-pink" },
  boss: { label: "Bos", className: "text-neon-gold" },
};

const COIN_STYLE: Record<MissionStatus, { face: string; edge: string; glow: string }> = {
  completed: {
    face: "from-neon-lime to-emerald-600",
    edge: "bg-[#14532d]",
    glow: "shadow-glow-lime",
  },
  available: {
    face: "from-arcane-400 to-arcane-700",
    edge: "bg-[#3b1d8f]",
    glow: "shadow-glow-arcane",
  },
  locked: {
    face: "from-slate-600 to-slate-800",
    edge: "bg-[#171a38]",
    glow: "",
  },
};

const STATUS_TEXT: Record<MissionStatus, string> = {
  completed: "selesai",
  available: "tersedia",
  locked: "terkunci",
};

interface MissionNodeProps {
  mission: Mission;
  status: MissionStatus;
  index: number;
  /** Posisi horizontal dalam persen (0 sampai 100). */
  x: number;
  /** Posisi vertikal dalam piksel. */
  y: number;
}

/** Simpul misi di peta: koin 3D yang bisa ditekan, dengan label di bawahnya. */
export default function MissionNode({ mission, status, index, x, y }: MissionNodeProps) {
  const coin = COIN_STYLE[status];
  const difficulty = DIFFICULTY_STYLE[mission.difficulty];
  const locked = status === "locked";
  const Icon = status === "completed" ? Check : locked ? Lock : Swords;

  const content: ReactNode = (
    <>
      <motion.span
        className="relative block h-20 w-20"
        whileHover={locked ? undefined : { y: -5, scale: 1.06 }}
        whileTap={locked ? undefined : { y: 3, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
      >
        {/* Cincin denyut untuk misi yang siap dikerjakan */}
        {status === "available" && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-arcane-300"
            animate={{ scale: [1, 1.7], opacity: [0.8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* Tepi tebal koin */}
        <span className={cn("absolute inset-0 translate-y-2 rounded-full", coin.edge)} />
        {/* Muka koin */}
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br",
            coin.face,
            coin.glow
          )}
        />
        <span className="absolute inset-1.5 rounded-full border border-white/30" />
        <span className="absolute inset-x-5 top-2 h-6 rounded-t-full bg-white/30" />

        <span className="relative grid h-full w-full place-items-center">
          <Icon
            className={cn(
              "h-8 w-8 drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)]",
              locked ? "text-slate-400" : "text-white"
            )}
          />
        </span>
      </motion.span>

      <span
        className={cn(
          "flex flex-col items-center gap-1.5 rounded-xl bg-void-900/85 px-2.5 py-2 text-center backdrop-blur",
          locked && "opacity-60"
        )}
      >
        <span className="font-display text-sm font-bold leading-tight">{mission.title}</span>
        <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px]">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-slate-200">
            {LANGUAGE_LABEL[mission.language]}
          </span>
          <span className={cn("font-semibold", difficulty.className)}>{difficulty.label}</span>
          <span className="tabular-nums text-neon-gold">
            +{formatNumber(mission.xpReward)} XP
          </span>
        </span>
      </span>
    </>
  );

  return (
    <div
      className="absolute z-10 w-40 -translate-x-1/2 -translate-y-10"
      style={{ left: `${x}%`, top: y }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          delay: Math.min(index, 6) * 0.08,
          type: "spring",
          stiffness: 220,
          damping: 20,
        }}
      >
        {locked ? (
          <div
            role="group"
            aria-label={`${mission.title}, ${STATUS_TEXT[status]}`}
            title="Selesaikan misi sebelumnya untuk membuka misi ini"
            className="flex cursor-not-allowed flex-col items-center gap-3"
          >
            {content}
          </div>
        ) : (
          <Link
            href={`/missions/${mission.id}`}
            aria-label={`${mission.title}, ${STATUS_TEXT[status]}, ${mission.xpReward} XP`}
            className="flex flex-col items-center gap-3 outline-offset-4"
          >
            {content}
          </Link>
        )}
      </motion.div>
    </div>
  );
}