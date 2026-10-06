"use client";

import { motion } from "framer-motion";

/**
 * Partikel dibuat dengan generator deterministik (bukan Math.random)
 * agar hasil render server dan client identik (tanpa hydration error).
 */
function createParticles(count: number) {
  let seed = 1337;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const colors = ["#22d3ee", "#a78bfa", "#f472b6"];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Number((next() * 100).toFixed(2)),
    top: Number((next() * 100).toFixed(2)),
    size: Number((2 + next() * 4).toFixed(2)),
    duration: Number((6 + next() * 8).toFixed(2)),
    delay: Number((next() * 6).toFixed(2)),
    drift: Math.round(20 + next() * 40),
    color: colors[i % colors.length],
  }));
}

const PARTICLES = createParticles(28);

export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Dasar gradasi void */}
      <div className="absolute inset-0 bg-void-gradient" />

      {/* Grid futuristik yang bergeser pelan */}
      <div className="absolute inset-0 animate-grid-drift bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />

      {/* Orb cahaya raksasa */}
      <motion.div
        className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-arcane-600/30 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-48 top-1/3 h-[34rem] w-[34rem] rounded-full bg-neon-cyan/15 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 left-1/4 h-[30rem] w-[30rem] rounded-full bg-neon-pink/10 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Partikel melayang */}
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          initial={{ opacity: 0 }}
          animate={{ y: [0, -p.drift, 0], opacity: [0, 0.9, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Vinyet tepi layar */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,6,15,0.85)_100%)]" />
    </div>
  );
}