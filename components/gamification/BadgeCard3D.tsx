"use client";

import type { MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ClipboardList,
  Code2,
  Crown,
  Flame,
  Footprints,
  Gem,
  Lock,
  Rocket,
  Shield,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Badge, BadgeRarity } from "@/types";

const EMBLEMS: Record<string, LucideIcon> = {
  footprints: Footprints,
  shield: Shield,
  gem: Gem,
  crown: Crown,
  bolt: Zap,
  star: Star,
  flame: Flame,
  rocket: Rocket,
  trophy: Trophy,
  clipboard: ClipboardList,
  code: Code2,
};

const RARITY: Record<
  BadgeRarity,
  { label: string; gradient: string; glow: string; text: string }
> = {
  common: {
    label: "Umum",
    gradient: "from-slate-300 to-slate-500",
    glow: "shadow-[0_0_24px_rgba(148,163,184,0.45)]",
    text: "text-slate-300",
  },
  rare: {
    label: "Langka",
    gradient: "from-neon-cyan to-arcane-500",
    glow: "shadow-glow-cyan",
    text: "text-neon-cyan",
  },
  epic: {
    label: "Epik",
    gradient: "from-arcane-400 to-neon-pink",
    glow: "shadow-glow-arcane",
    text: "text-arcane-300",
  },
  legendary: {
    label: "Legendaris",
    gradient: "from-neon-gold to-neon-pink",
    glow: "shadow-glow-gold",
    text: "text-neon-gold",
  },
};

interface BadgeCard3DProps {
  badge: Badge;
  unlocked: boolean;
  className?: string;
}

/** Kartu lencana dengan medali 3D yang melayang dan miring mengikuti kursor. */
export default function BadgeCard3D({ badge, unlocked, className }: BadgeCard3DProps) {
  const reduceMotion = useReducedMotion();
  const rarity = RARITY[badge.rarity];
  const Emblem = EMBLEMS[badge.emblem] ?? Star;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      role="group"
      aria-label={`${badge.name}, ${unlocked ? "sudah terbuka" : "masih terkunci"}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }}
      className={cn(
        "neu-card flex flex-col items-center gap-3 p-6 text-center",
        !unlocked && "opacity-70",
        className
      )}
    >
      {/* Medali */}
      <div className="relative" style={{ transform: "translateZ(50px)" }}>
        {unlocked && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 animate-pulse-glow rounded-full bg-gradient-to-br blur-xl",
              rarity.gradient
            )}
          />
        )}
        <span className="absolute inset-0 translate-y-2 rounded-full bg-black/50" />
        <div
          className={cn(
            "relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br",
            unlocked ? cn(rarity.gradient, rarity.glow) : "from-slate-600 to-slate-800"
          )}
        >
          <span className="absolute inset-1.5 rounded-full border border-white/30" />
          <span className="absolute inset-x-5 top-2 h-6 rounded-t-full bg-white/30" />
          {unlocked ? (
            <Emblem className="relative h-10 w-10 text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)]" />
          ) : (
            <Lock className="relative h-8 w-8 text-slate-400" />
          )}
        </div>
      </div>

      {/* Teks */}
      <div className="space-y-1.5" style={{ transform: "translateZ(24px)" }}>
        <h3 className="font-display text-base font-bold">{badge.name}</h3>
        <span
          className={cn(
            "inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
            unlocked ? rarity.text : "text-slate-500"
          )}
        >
          {rarity.label}
        </span>
        <p className="text-xs leading-relaxed text-slate-400">{badge.description}</p>
      </div>
    </motion.div>
  );
}