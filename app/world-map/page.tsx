import type { Metadata } from "next";
import { Map as MapIcon } from "lucide-react";

import XPBar from "@/components/gamification/XPBar";
import WorldMap from "@/components/map/WorldMap";
import Icon3D from "@/components/ui/Icon3D";

export const metadata: Metadata = {
  title: "Peta Dunia",
  description:
    "Jelajahi peta petualangan dari Lembah HTML hingga Menara Full-Stack. Selesaikan misi untuk membuka zona baru.",
};

export default function WorldMapPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-center gap-5">
        <Icon3D icon={MapIcon} tone="cyan" size="lg" floating />
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">
            Peta <span className="text-gradient">Dunia</span>
          </h1>
          <p className="mt-1 text-slate-400">
            Selesaikan misi satu per satu untuk membuka jalan menuju Full-Stack.
          </p>
        </div>
      </header>

      <XPBar />

      <WorldMap />
    </div>
  );
}