"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { useGameStore } from "@/store/useGameStore";

/**
 * Memberi XP satu kali untuk percobaan simulasi pertama.
 * `justAwarded` bernilai true sebentar setelah hadiah benar-benar diberikan.
 */
export function useSimReward(missionId: string, xp: number) {
  const completeMission = useGameStore((state) => state.completeMission);
  const [justAwarded, setJustAwarded] = useState(false);

  useEffect(() => {
    if (!justAwarded) return;
    const timer = setTimeout(() => setJustAwarded(false), 2500);
    return () => clearTimeout(timer);
  }, [justAwarded]);

  const claim = useCallback(() => {
    const result = completeMission(missionId, xp);
    if (result.awarded) setJustAwarded(true);
  }, [completeMission, missionId, xp]);

  return { claim, justAwarded };
}

export function XpPop({ show, xp }: { show: boolean; xp: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          role="status"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-neon-gold/15 px-3 py-1 font-display text-sm font-bold text-neon-gold ring-1 ring-neon-gold/40"
        >
          <Sparkles className="h-4 w-4" />+{xp} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}