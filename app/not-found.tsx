import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Zona Tak Dikenal",
};

export default function NotFound() {
  return (
    <section className="grid min-h-[60vh] place-items-center text-center">
      <div className="space-y-6">
        <div className="scene-3d mx-auto w-fit animate-float">
          <div className="relative grid h-28 w-28 place-items-center rounded-3xl bg-arcane-gradient shadow-glow-arcane [transform:rotateX(18deg)_rotateZ(-8deg)]">
            <span className="absolute inset-x-2 top-2 h-8 rounded-t-2xl bg-white/25" />
            <Compass className="relative h-14 w-14 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        <h1 className="text-gradient font-display text-7xl font-black">404</h1>

        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Zona Tak Dikenal</h2>
          <p className="mx-auto max-w-md text-slate-400">
            Kamu tersesat di wilayah yang belum ada di peta. Halaman ini mungkin
            belum dibuat atau sudah pindah. Mari kembali ke jalur petualangan.
          </p>
        </div>

        <Link href="/" className="btn-3d">
          Kembali ke Beranda
        </Link>
      </div>
    </section>
  );
}