import type { Metadata, Viewport } from "next";
import { Orbitron, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

import LevelUpOverlay from "@/components/gamification/LevelUpOverlay";
import AmbientBackground from "@/components/layout/AmbientBackground";
import Navbar from "@/components/layout/Navbar";

import "./globals.css";

const display = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CodeQuest | Gamified Full-Stack Learning Platform",
    template: "%s | CodeQuest",
  },
  description:
    "Belajar coding dari nol hingga Full-Stack Developer lewat petualangan RPG. Kumpulkan XP, naik level, buka lencana, dan lihat kodemu menjadi objek 3D nyata.",
  keywords: [
    "belajar coding",
    "full-stack developer",
    "gamifikasi",
    "Next.js",
    "React",
    "Laravel",
    "Tailwind CSS",
  ],
  applicationName: "CodeQuest",
  authors: [{ name: "CodeQuest" }],
  openGraph: {
    title: "CodeQuest | Gamified Full-Stack Learning Platform",
    description:
      "Petualangan RPG untuk menjadi Full-Stack Developer. Editor kode pintar, preview 3D, dan simulasi integrasi dunia nyata.",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`dark ${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="relative min-h-screen bg-void-950 text-slate-100">
        {/* Latar ambient: grid, orb cahaya, partikel melayang */}
        <AmbientBackground />

        {/* Lapisan konten utama */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
            {children}
          </main>

          <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
            <p>
              <span className="text-gradient font-display font-semibold">CodeQuest</span>{" "}
              · Belajar coding sebagai petualangan · © {new Date().getFullYear()}
            </p>
          </footer>
        </div>

        {/* Overlay perayaan level-up, muncul di atas semua halaman */}
        <LevelUpOverlay />
      </body>
    </html>
  );
}