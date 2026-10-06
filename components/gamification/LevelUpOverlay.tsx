"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import ParticleBurst from "@/components/gamification/ParticleBurst";
import Button3D from "@/components/ui/Button3D";
import { getRankTitle } from "@/lib/xp";
import { useGameStore } from "@/store/useGameStore";

const BURST_COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24", "#a3e635"];

export default function LevelUpOverlay() {
  const pendingLevelUp = useGameStore((state) => state.pendingLevelUp);
  const dismissLevelUp = useGameStore((state) => state.dismissLevelUp);
  const [burst, setBurst] = useState(0);

  // Dua ledakan partikel berurutan untuk efek perayaan
  useEffect(() => {
    if (pendingLevelUp === null) return;
    setBurst((b) => b + 1);
    const timer = setTimeout(() => setBurst((b) => b + 1), 450);
    return () => clearTimeout(timer);
  }, [pendingLevelUp]);

  // Tutup dengan Escape dan kunci scroll selama overlay tampil
  useEffect(() => {
    if (pendingLevelUp === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissLevelUp();
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [pendingLevelUp, dismissLevelUp]);

  return (
    <AnimatePresence>
      {pendingLevelUp !== null && (
        <motion.div
          key="level-up-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="level-up-title"
          className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-void-950/85 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Sinar cahaya berputar */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-30"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, rgba(251,191,36,0.55) 0deg 8deg, transparent 8deg 24deg)",
              maskImage: "radial-gradient(circle, black 0%, transparent 55%)",
              WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)",
            }}
          />

          <motion.div
            className="relative flex flex-col items-center text-center"
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            {/* Koin level */}
            <div className="relative grid h-56 w-56 place-items-center">
              <ParticleBurst trigger={burst} count={40} distance={230} size={9} colors={BURST_COLORS} />

              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  className="absolute inset-6 rounded-full border-2 border-neon-gold/70"
                  initial={{ scale: 0.6, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 1.6, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
                />
              ))}

              <motion.div
                className="relative grid h-40 w-40 place-items-center rounded-full bg-gold-gradient shadow-glow-gold"
                style={{ transformPerspective: 800 }}
                initial={{ rotateY: -270, scale: 0 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.1 }}
              >
                <span className="absolute inset-3 rounded-full border-4 border-white/40" />
                <span className="absolute inset-x-8 top-4 h-10 rounded-t-full bg-white/35" />
                <span className="relative font-display text-7xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.45)]">
                  {pendingLevelUp}
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-4 space-y-3"
            >
              <h2
                id="level-up-title"
                className="text-gradient-gold text-glow font-display text-5xl font-black sm:text-6xl"
              >
                LEVEL UP!
              </h2>
              <p className="text-lg text-slate-200">
                Kamu mencapai <span className="font-bold text-neon-gold">Level {pendingLevelUp}</span>
              </p>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-arcane-300">
                <Sparkles className="h-4 w-4" />
                Gelar baru: {getRankTitle(pendingLevelUp)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8"
            >
              <Button3D variant="gold" size="lg" onClick={dismissLevelUp} autoFocus>
                Lanjutkan Petualangan
              </Button3D>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}