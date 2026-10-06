"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Map as MapIcon,
  Menu,
  PenTool,
  Plug,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn, formatNumber } from "@/lib/utils";
import { getLevelProgress, getRankTitle } from "@/lib/xp";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/world-map", label: "Peta Dunia", icon: MapIcon },
  { href: "/playground", label: "Playground", icon: PenTool },
  { href: "/integrations", label: "Integrasi", icon: Plug },
  { href: "/profile", label: "Profil", icon: User },
];

/* ---------- Status pemain: level, gelar, dan XP bar ---------- */
function PlayerStatus({ className }: { className?: string }) {
  const hydrated = useHasHydrated();
  const storedXp = useGameStore((state) => state.xp);
  const xp = hydrated ? storedXp : 0;

  const { level, progress, xpIntoLevel, xpForNext, isMaxLevel } =
    getLevelProgress(xp);

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="group"
      aria-label={`Level ${level}, ${formatNumber(xp)} XP`}
    >
      <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-arcane-gradient font-display text-base font-bold text-white shadow-glow-arcane [transform:rotate(-6deg)]">
        <span className="absolute inset-x-1 top-1 h-3 rounded-t-lg bg-white/25" />
        <span className="relative">{level}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3 text-[11px]">
          <span className="truncate font-display font-semibold text-slate-200">
            {getRankTitle(level)}
          </span>
          <span className="shrink-0 tabular-nums text-slate-400">
            {isMaxLevel
              ? "MAX"
              : `${formatNumber(xpIntoLevel)} / ${formatNumber(xpForNext)} XP`}
          </span>
        </div>
        <div className="xp-track mt-1 h-2.5">
          <motion.div
            className="xp-fill animate-shimmer"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Logo permata 3D ---------- */
function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3"
      aria-label="CodeQuest, kembali ke beranda"
    >
      <span className="relative grid h-10 w-10 place-items-center transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
        <span className="absolute inset-0 rotate-45 rounded-xl bg-arcane-gradient shadow-glow-arcane" />
        <span className="absolute inset-1 rotate-45 rounded-lg bg-gradient-to-br from-white/30 to-transparent" />
        <span className="relative font-display text-sm font-black text-white">
          {"</>"}
        </span>
      </span>
      <span className="font-display text-lg font-bold tracking-wide">
        Code<span className="text-gradient">Quest</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tutup menu mobile setiap kali pindah halaman
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-void-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Navigasi desktop */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-white" : "text-slate-400 hover:text-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-xl bg-arcane-600/30 shadow-[0_0_18px_rgba(139,92,246,0.45)] ring-1 ring-arcane-400/40"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status pemain (desktop) */}
        <PlayerStatus className="hidden w-60 md:flex" />

        {/* Tombol menu mobile */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center rounded-xl bg-void-800 shadow-neu-sm transition-transform active:scale-95 lg:hidden"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/10 bg-void-900/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-2 px-4 py-4 sm:px-6">
              <PlayerStatus className="mb-3 md:hidden" />
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-arcane-600/30 text-white ring-1 ring-arcane-400/40"
                        : "text-slate-300 hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}