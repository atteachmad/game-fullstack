"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Braces,
  CreditCard,
  Map as MapIcon,
  PenTool,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { formatNumber } from "@/lib/utils";
import { MAX_LEVEL } from "@/lib/xp";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

/* ============================================================
 * DATA STATIS HALAMAN
 * ============================================================ */

const WELCOME_MISSION_ID = "welcome-bonus";
const WELCOME_BADGE_ID = "first-step";
const WELCOME_XP = 25;

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glow: string;
}

const FEATURES: Feature[] = [
  {
    title: "Peta Petualangan RPG",
    description:
      "Jalur belajar dari nol hingga Full-Stack Developer disajikan sebagai peta dunia game. Tiap zona adalah satu teknologi.",
    icon: MapIcon,
    gradient: "from-arcane-500 to-neon-cyan",
    glow: "shadow-glow-arcane",
  },
  {
    title: "XP, Level, dan Lencana",
    description:
      "Selesaikan misi, kumpulkan XP, naik level, dan buka lencana langka dengan animasi yang memuaskan.",
    icon: Trophy,
    gradient: "from-neon-gold to-neon-pink",
    glow: "shadow-glow-gold",
  },
  {
    title: "Editor Kode Pintar",
    description:
      "HTML, CSS, JavaScript, PHP, React, Vue, Laravel, dan Next.js dengan kotak saran otomatis untuk pemula.",
    icon: Braces,
    gradient: "from-neon-cyan to-arcane-500",
    glow: "shadow-glow-cyan",
  },
  {
    title: "Preview Objek 3D Nyata",
    description:
      "Kode tombolmu menjadi sakelar mekanis taktil. Kode formulirmu menjadi papan klip kertas 3D.",
    icon: Boxes,
    gradient: "from-neon-lime to-neon-cyan",
    glow: "shadow-glow-lime",
  },
  {
    title: "Playground Wireframe",
    description:
      "Coret wireframe dan mockup dulu sebelum menulis kode, seperti desainer profesional.",
    icon: PenTool,
    gradient: "from-neon-pink to-arcane-500",
    glow: "shadow-glow-arcane",
  },
  {
    title: "Simulasi Integrasi Dunia Nyata",
    description:
      "Midtrans, Xendit, Stripe, WhatsApp Business, Mailchimp, dan Live Chat lengkap dengan kode siap pakai.",
    icon: CreditCard,
    gradient: "from-neon-gold to-neon-cyan",
    glow: "shadow-glow-gold",
  },
];

interface JourneyZone {
  name: string;
  tech: string;
  levels: string;
  gradient: string;
}

const JOURNEY: JourneyZone[] = [
  { name: "Lembah HTML", tech: "Struktur halaman web", levels: "Lv 1-3", gradient: "from-neon-lime to-neon-cyan" },
  { name: "Gunung CSS", tech: "Gaya, layout, dan animasi", levels: "Lv 4-7", gradient: "from-neon-cyan to-arcane-500" },
  { name: "Kuil JavaScript", tech: "Logika dan interaktivitas", levels: "Lv 8-12", gradient: "from-neon-gold to-neon-pink" },
  { name: "Kerajaan React dan Next.js", tech: "Frontend modern", levels: "Lv 13-20", gradient: "from-arcane-400 to-neon-cyan" },
  { name: "Benteng Backend", tech: "PHP, Laravel, dan API", levels: "Lv 21-30", gradient: "from-neon-pink to-arcane-600" },
  { name: "Menara Full-Stack", tech: "Database, deploy, dan integrasi", levels: "Lv 31+", gradient: "from-neon-gold to-neon-lime" },
];

const STATS = [
  { value: "6", label: "Zona Petualangan" },
  { value: "8", label: "Bahasa & Framework" },
  { value: "6", label: "Simulasi Integrasi" },
  { value: String(MAX_LEVEL), label: "Level untuk Ditaklukkan" },
];

/* ============================================================
 * KEYCAP 3D INTERAKTIF (demo gamifikasi pertama)
 * ============================================================ */

const BURST_COUNT = 14;

function HeroKeycap() {
  const hydrated = useHasHydrated();
  const completeMission = useGameStore((state) => state.completeMission);
  const claimedInStore = useGameStore((state) =>
    state.completedMissionIds.includes(WELCOME_MISSION_ID)
  );
  const claimed = hydrated && claimedInStore;

  const [burstKey, setBurstKey] = useState(0);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    if (!showReward) return;
    const timer = setTimeout(() => setShowReward(false), 1800);
    return () => clearTimeout(timer);
  }, [showReward]);

  const handlePress = () => {
    if (claimed) return;
    const result = completeMission(WELCOME_MISSION_ID, WELCOME_XP, WELCOME_BADGE_ID);
    if (result.awarded) {
      setBurstKey((key) => key + 1);
      setShowReward(true);
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
      {/* Cahaya di belakang keycap */}
      <div className="absolute inset-0 -z-10 animate-pulse-glow rounded-full bg-arcane-600/30 blur-3xl" />

      <div className="scene-3d animate-float">
        <div
          className="preserve-3d"
          style={{ transform: "rotateX(24deg) rotateZ(-8deg)" }}
        >
          {/* Dudukan sakelar */}
          <div className="neu-card relative p-6">
            <div className="rounded-2xl bg-void-900 p-5 shadow-neu-inset">
              <div className="relative">
                {/* Partikel ledakan saat klaim */}
                {burstKey > 0 &&
                  Array.from({ length: BURST_COUNT }, (_, i) => {
                    const angle = (i / BURST_COUNT) * Math.PI * 2;
                    const distance = 110;
                    return (
                      <motion.span
                        key={`${burstKey}-${i}`}
                        className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-neon-cyan shadow-glow-cyan"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos(angle) * distance,
                          y: Math.sin(angle) * distance,
                          opacity: 0,
                          scale: 0.2,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    );
                  })}

                <button
                  type="button"
                  onClick={handlePress}
                  disabled={claimed}
                  aria-label={
                    claimed
                      ? "Bonus selamat datang sudah diklaim"
                      : `Tekan untuk klaim bonus ${WELCOME_XP} XP`
                  }
                  className="group relative block h-32 w-44 rounded-3xl bg-arcane-900/60 outline-offset-4 disabled:cursor-default"
                >
                  <span
                    className={
                      "absolute inset-0 grid place-items-center rounded-3xl font-display text-lg font-bold text-white transition-all duration-100 " +
                      "bg-[linear-gradient(180deg,#b794ff_0%,#7c3aed_100%)] " +
                      "shadow-[0_14px_0_0_#3b1d8f,0_26px_32px_rgba(0,0,0,0.55)] " +
                      "group-hover:brightness-110 " +
                      "group-active:translate-y-3 group-active:shadow-[0_2px_0_0_#3b1d8f,0_6px_12px_rgba(0,0,0,0.5)] " +
                      (claimed
                        ? "from-slate-500 !bg-[linear-gradient(180deg,#4b5280_0%,#2b2f55_100%)] !shadow-[0_4px_0_0_#171a38,0_8px_14px_rgba(0,0,0,0.5)] translate-y-2.5"
                        : "")
                    }
                  >
                    <span className="pointer-events-none absolute inset-x-3 top-2 h-5 rounded-t-2xl bg-white/25" />
                    <span className="relative">
                      {claimed ? "KLAIM ✓" : `+${WELCOME_XP} XP`}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teks +XP melayang */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            key="reward"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -60, scale: 1.1 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute top-6 font-display text-2xl font-black text-gradient-gold text-glow"
          >
            +{WELCOME_XP} XP · Lencana Langkah Pertama!
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-10 text-center text-sm text-slate-400">
        {claimed
          ? "Bonus pertamamu sudah diklaim. Lanjut ke Peta Dunia!"
          : "Tekan sakelar di atas untuk klaim XP pertamamu."}
      </p>
    </div>
  );
}

/* ============================================================
 * HALAMAN UTAMA
 * ============================================================ */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const hydrated = useHasHydrated();
  const completedCount = useGameStore((state) => state.completedMissionIds.length);
  const shownCompleted = hydrated ? completedCount : 0;

  return (
    <div className="space-y-28">
      {/* ---------- HERO ---------- */}
      <section className="grid items-center gap-14 pt-6 lg:grid-cols-2">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="space-y-7"
        >
          <motion.div
            variants={fadeUp}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-arcane-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Gamified Full-Stack Learning Platform
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl"
          >
            Ubah belajar coding menjadi{" "}
            <span className="text-gradient text-glow">petualangan epik</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            Jelajahi peta dunia dari nol hingga Full-Stack Developer. Tulis kode,
            lihat hasilnya menjadi objek 3D yang nyata, kumpulkan XP, dan buka
            lencana di setiap langkah.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
            <Link href="/world-map" className="btn-3d">
              Mulai Petualangan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/playground"
              className="glass inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-display font-semibold transition hover:bg-white/10"
            >
              <PenTool className="h-4 w-4" />
              Coba Playground
            </Link>
          </motion.div>

          {shownCompleted > 0 && (
            <motion.p variants={fadeUp} className="text-sm text-neon-lime">
              Misi selesai: {formatNumber(shownCompleted)}. Pertahankan momentummu!
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
        >
          <HeroKeycap />
        </motion.div>
      </section>

      {/* ---------- STATISTIK ---------- */}
      <section aria-label="Ringkasan platform">
        <div className="neu-card grid grid-cols-2 gap-6 p-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-gradient font-display text-4xl font-black">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FITUR ---------- */}
      <section className="space-y-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-black sm:text-4xl">
            Semua yang kamu butuhkan, dalam <span className="text-gradient">satu dunia</span>
          </h2>
          <p className="mt-3 text-slate-400">
            Dirancang agar pemula tidak jenuh dan tetap termotivasi dari misi pertama.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                whileHover={{ y: -8, rotateX: 5, rotateY: -5 }}
                style={{ transformPerspective: 900 }}
                className="neu-card group p-6"
              >
                {/* Ikon bergaya 3D: ubin gradasi + kilap + bayangan lantai */}
                <div className="relative mb-5 h-14 w-14">
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} ${feature.glow} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                  />
                  <div className="absolute inset-x-1.5 top-1.5 h-5 rounded-t-xl bg-white/30" />
                  <div className="relative grid h-full w-full place-items-center">
                    <Icon className="h-7 w-7 text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.45)]" />
                  </div>
                </div>

                <h3 className="font-display text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ---------- JALUR PETUALANGAN ---------- */}
      <section className="space-y-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-black sm:text-4xl">
            Enam zona menuju <span className="text-gradient-gold">Full-Stack</span>
          </h2>
          <p className="mt-3 text-slate-400">
            Setiap zona membuka kemampuan baru. Kamu hanya perlu melangkah satu misi pada satu waktu.
          </p>
        </motion.div>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNEY.map((zone, index) => (
            <motion.li
              key={zone.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="neu-card flex items-start gap-4 p-5"
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${zone.gradient} font-display text-lg font-black text-void-950 shadow-neu-sm`}
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-display font-bold">{zone.name}</h3>
                <p className="mt-0.5 text-sm text-slate-400">{zone.tech}</p>
                <p className="mt-2 inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-arcane-300">
                  {zone.levels}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ---------- CTA PENUTUP ---------- */}
      <section>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="neu-card relative overflow-hidden px-6 py-14 text-center"
        >
          <div className="absolute inset-0 bg-arcane-gradient opacity-10" />
          <div className="relative space-y-5">
            <h2 className="text-3xl font-black sm:text-4xl">
              Siap menjadi <span className="text-gradient">pahlawan kode</span>?
            </h2>
            <p className="mx-auto max-w-lg text-slate-400">
              Petualanganmu dimulai dari satu baris kode. Progres tersimpan otomatis di perangkatmu.
            </p>
            <Link href="/world-map" className="btn-3d">
              Buka Peta Dunia
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}