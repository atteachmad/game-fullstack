"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Landmark, Mountain, Map as MapIcon, TreePine, Trophy, type LucideIcon } from "lucide-react";

import MissionNode from "@/components/map/MissionNode";
import Icon3D, { type Icon3DTone } from "@/components/ui/Icon3D";
import { ZONES, getMissionById } from "@/lib/data/missions";
import { getMissionStatus, getNextMission, type MissionStatus } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import type { Mission } from "@/types";

const ROW_HEIGHT = 190;
const TOP_PADDING = 80;
const BOTTOM_PADDING = 150;

const EMPTY_IDS: string[] = [];
const SORTED_ZONES = [...ZONES].sort((a, b) => a.order - b.order);

const ZONE_VISUAL: Record<string, { icon: LucideIcon; tone: Icon3DTone }> = {
  "html-valley": { icon: TreePine, tone: "lime" },
  "css-mountain": { icon: Mountain, tone: "cyan" },
  "js-temple": { icon: Landmark, tone: "gold" },
};

function getNodePosition(index: number, total: number) {
  const x = total === 1 ? 50 : index % 2 === 0 ? 28 : 72;
  const y = TOP_PADDING + index * ROW_HEIGHT;
  return { x, y };
}

/** Kurva halus dari satu simpul ke simpul berikutnya. */
function buildSegment(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const midY = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
}

const LEGEND: ReadonlyArray<{ label: string; dot: string }> = [
  { label: "Selesai", dot: "bg-neon-lime" },
  { label: "Siap dikerjakan", dot: "bg-arcane-500" },
  { label: "Terkunci", dot: "bg-slate-600" },
];

export default function WorldMap() {
  const hydrated = useHasHydrated();
  const storedCompleted = useGameStore((state) => state.completedMissionIds);
  const completedIds = hydrated ? storedCompleted : EMPTY_IDS;
  const nextMission = getNextMission(completedIds);

  return (
    <div className="space-y-10">
      {/* ---------- Banner misi berikutnya ---------- */}
      <section className="neu-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        {nextMission ? (
          <>
            <div className="flex items-center gap-4">
              <Icon3D icon={MapIcon} tone="arcane" size="md" floating />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-arcane-300">
                  Misi berikutnya
                </p>
                <h2 className="font-display text-lg font-bold">{nextMission.title}</h2>
                <p className="mt-0.5 max-w-xl text-sm text-slate-400">
                  {nextMission.description}
                </p>
              </div>
            </div>
            <Link href={`/missions/${nextMission.id}`} className="btn-3d shrink-0">
              {completedIds.length > 0 ? "Lanjutkan Misi" : "Mulai Misi Pertama"}
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Icon3D icon={Trophy} tone="gold" size="md" floating />
            <div>
              <h2 className="text-gradient-gold font-display text-lg font-bold">
                Seluruh misi tuntas!
              </h2>
              <p className="text-sm text-slate-400">
                Kamu sudah menaklukkan semua zona yang tersedia. Zona baru akan hadir.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ---------- Legenda ---------- */}
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400" aria-label="Legenda peta">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className={cn("h-3 w-3 rounded-full shadow-neu-sm", item.dot)} />
            {item.label}
          </li>
        ))}
      </ul>

      {/* ---------- Zona-zona ---------- */}
      {SORTED_ZONES.map((zone) => {
        const missions = zone.missionIds
          .map((id) => getMissionById(id))
          .filter((mission): mission is Mission => mission !== undefined);

        const statuses: MissionStatus[] = missions.map((mission) =>
          getMissionStatus(mission.id, completedIds)
        );
        const doneCount = statuses.filter((s) => s === "completed").length;
        const zoneLocked = statuses.every((s) => s === "locked");
        const visual = ZONE_VISUAL[zone.id] ?? { icon: MapIcon, tone: "arcane" as Icon3DTone };

        const positions = missions.map((_, i) => getNodePosition(i, missions.length));
        const mapHeight = TOP_PADDING + (missions.length - 1) * ROW_HEIGHT + BOTTOM_PADDING;

        return (
          <motion.section
            key={zone.id}
            aria-labelledby={`zone-${zone.id}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className={cn("space-y-4", zoneLocked && "opacity-75")}
          >
            {/* Kepala zona */}
            <div className="neu-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <Icon3D icon={visual.icon} tone={zoneLocked ? "arcane" : visual.tone} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-arcane-300">
                    Zona {zone.order}
                  </span>
                  {zoneLocked && (
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Terkunci
                    </span>
                  )}
                </div>
                <h2 id={`zone-${zone.id}`} className="mt-1 font-display text-2xl font-black">
                  {zone.name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">{zone.description}</p>
              </div>

              <div className="w-full sm:w-48">
                <p className="mb-1.5 text-right text-xs tabular-nums text-slate-400">
                  {doneCount} / {missions.length} misi
                </p>
                <div
                  className="xp-track h-3"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={missions.length}
                  aria-valuenow={doneCount}
                  aria-label={`Progres ${zone.name}`}
                >
                  <motion.div
                    className="xp-fill"
                    initial={false}
                    animate={{ width: `${missions.length ? (doneCount / missions.length) * 100 : 0}%` }}
                    transition={{ type: "spring", stiffness: 90, damping: 18 }}
                  />
                </div>
              </div>
            </div>

            {/* Peta zona */}
            <div
              className="neu-inset bg-grid relative overflow-hidden"
              style={{ height: mapHeight }}
            >
              <svg
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
                viewBox={`0 0 100 ${mapHeight}`}
                preserveAspectRatio="none"
              >
                {positions.slice(0, -1).map((from, i) => {
                  const lit = statuses[i] === "completed";
                  return (
                    <path
                      key={`${zone.id}-segment-${i}`}
                      d={buildSegment(from, positions[i + 1])}
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      strokeWidth={lit ? 6 : 4}
                      stroke={lit ? "#a3e635" : "rgba(139,92,246,0.35)"}
                      strokeDasharray={lit ? undefined : "2 14"}
                      style={lit ? { filter: "drop-shadow(0 0 8px rgba(163,230,53,0.8))" } : undefined}
                    />
                  );
                })}
              </svg>

              {missions.map((mission, i) => (
                <MissionNode
                  key={mission.id}
                  mission={mission}
                  status={statuses[i]}
                  index={i}
                  x={positions[i].x}
                  y={positions[i].y}
                />
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}