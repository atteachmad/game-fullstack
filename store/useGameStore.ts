"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { RewardResult } from "@/types";
import { getLevelFromXp } from "@/lib/xp";

interface GameState {
  xp: number;
  completedMissionIds: string[];
  unlockedBadgeIds: string[];
  /** Level baru yang menunggu animasi level-up (tidak disimpan ke storage) */
  pendingLevelUp: number | null;

  addXp: (amount: number) => { leveledUp: boolean; newLevel: number };
  unlockBadge: (badgeId: string) => boolean;
  completeMission: (
    missionId: string,
    xpReward: number,
    badgeId?: string
  ) => RewardResult;
  dismissLevelUp: () => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      completedMissionIds: [],
      unlockedBadgeIds: [],
      pendingLevelUp: null,

      addXp: (amount) => {
        const safeAmount = Math.max(0, Math.floor(amount));
        const previousXp = get().xp;
        const previousLevel = getLevelFromXp(previousXp);
        const nextXp = previousXp + safeAmount;
        const newLevel = getLevelFromXp(nextXp);
        const leveledUp = newLevel > previousLevel;

        set({
          xp: nextXp,
          pendingLevelUp: leveledUp ? newLevel : get().pendingLevelUp,
        });

        return { leveledUp, newLevel };
      },

      unlockBadge: (badgeId) => {
        if (get().unlockedBadgeIds.includes(badgeId)) return false;
        set({ unlockedBadgeIds: [...get().unlockedBadgeIds, badgeId] });
        return true;
      },

      completeMission: (missionId, xpReward, badgeId) => {
        if (get().completedMissionIds.includes(missionId)) {
          return {
            awarded: false,
            leveledUp: false,
            newLevel: getLevelFromXp(get().xp),
            newBadge: false,
          };
        }

        set({ completedMissionIds: [...get().completedMissionIds, missionId] });

        const { leveledUp, newLevel } = get().addXp(xpReward);
        const newBadge = badgeId ? get().unlockBadge(badgeId) : false;

        return { awarded: true, leveledUp, newLevel, newBadge };
      },

      dismissLevelUp: () => set({ pendingLevelUp: null }),

      resetProgress: () =>
        set({
          xp: 0,
          completedMissionIds: [],
          unlockedBadgeIds: [],
          pendingLevelUp: null,
        }),
    }),
    {
      name: "codequest-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        xp: state.xp,
        completedMissionIds: state.completedMissionIds,
        unlockedBadgeIds: state.unlockedBadgeIds,
      }),
    }
  )
);

/**
 * Hook untuk mencegah hydration mismatch.
 * Tampilkan nilai default sampai data dari localStorage selesai dimuat.
 */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useGameStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    setHydrated(useGameStore.persist.hasHydrated());
    return unsubscribe;
  }, []);

  return hydrated;
}