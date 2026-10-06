import type { Metadata } from "next";
import { PenTool } from "lucide-react";

import PlaygroundBoard from "@/components/playground/PlaygroundBoard";
import Icon3D from "@/components/ui/Icon3D";

export const metadata: Metadata = {
  title: "Playground Wireframe",
  description:
    "Coret wireframe dan mockup tampilan sebelum menulis kode. Seret elemen, pakai template, lalu ekspor menjadi kerangka HTML.",
};

export default function PlaygroundPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-center gap-5">
        <Icon3D icon={PenTool} tone="pink" size="lg" floating />
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">
            Playground <span className="text-gradient">Wireframe</span>
          </h1>
          <p className="mt-1 text-slate-400">
            Rancang tampilan dulu, baru tulis kodenya, seperti desainer profesional.
          </p>
        </div>
      </header>

      <PlaygroundBoard />
    </div>
  );
}