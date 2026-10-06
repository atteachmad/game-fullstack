import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MissionWorkspace from "@/components/editor/MissionWorkspace";
import { MISSIONS, getMissionById } from "@/lib/data/missions";

interface MissionPageProps {
  params: { id: string };
}

/** Semua halaman misi dibuat saat build, jadi cepat dan siap di Vercel. */
export const dynamicParams = false;

export function generateStaticParams() {
  return MISSIONS.map((mission) => ({ id: mission.id }));
}

export function generateMetadata({ params }: MissionPageProps): Metadata {
  const mission = getMissionById(params.id);
  if (!mission) return { title: "Misi tidak ditemukan" };

  return {
    title: mission.title,
    description: mission.description,
  };
}

export default function MissionPage({ params }: MissionPageProps) {
  const mission = getMissionById(params.id);
  if (!mission) notFound();

  return <MissionWorkspace mission={mission} />;
}