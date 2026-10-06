import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type Icon3DTone = "arcane" | "cyan" | "gold" | "lime" | "pink";
export type Icon3DSize = "sm" | "md" | "lg";

const TONES: Record<Icon3DTone, { gradient: string; glow: string }> = {
  arcane: { gradient: "from-arcane-400 to-arcane-700", glow: "shadow-glow-arcane" },
  cyan: { gradient: "from-neon-cyan to-arcane-500", glow: "shadow-glow-cyan" },
  gold: { gradient: "from-neon-gold to-neon-pink", glow: "shadow-glow-gold" },
  lime: { gradient: "from-neon-lime to-neon-cyan", glow: "shadow-glow-lime" },
  pink: { gradient: "from-neon-pink to-arcane-500", glow: "shadow-glow-arcane" },
};

const SIZES: Record<Icon3DSize, { box: string; icon: string; gloss: string }> = {
  sm: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5", gloss: "inset-x-1 top-1 h-3.5 rounded-t-lg" },
  md: { box: "h-14 w-14 rounded-2xl", icon: "h-7 w-7", gloss: "inset-x-1.5 top-1.5 h-5 rounded-t-xl" },
  lg: { box: "h-20 w-20 rounded-3xl", icon: "h-10 w-10", gloss: "inset-x-2 top-2 h-7 rounded-t-2xl" },
};

interface Icon3DProps {
  icon: LucideIcon;
  tone?: Icon3DTone;
  size?: Icon3DSize;
  floating?: boolean;
  /** Jika diisi, ikon dibaca screen reader. Jika kosong, ikon dianggap dekoratif. */
  label?: string;
  className?: string;
}

/** Ikon Lucide yang dimodifikasi: ubin gradasi, kilap, tepi tebal, dan cahaya. */
export default function Icon3D({
  icon: Icon,
  tone = "arcane",
  size = "md",
  floating = false,
  label,
  className,
}: Icon3DProps) {
  const t = TONES[tone];
  const s = SIZES[size];

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("relative inline-grid shrink-0 place-items-center", s.box, floating && "animate-float", className)}
    >
      {/* Bayangan tepi tebal di bawah ubin */}
      <span className={cn("absolute inset-0 translate-y-1.5 bg-black/50", s.box)} />
      {/* Ubin utama */}
      <span className={cn("absolute inset-0 bg-gradient-to-br", t.gradient, t.glow, s.box)} />
      {/* Kilap */}
      <span className={cn("absolute bg-white/30", s.gloss)} />
      <Icon className={cn("relative text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.45)]", s.icon)} />
    </span>
  );
}