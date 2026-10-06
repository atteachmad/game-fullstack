"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const DEFAULT_COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24", "#a3e635"];

interface ParticleBurstProps {
  /** Naikkan angka ini (1, 2, 3, ...) setiap kali ingin meledakkan partikel. */
  trigger: number;
  count?: number;
  distance?: number;
  size?: number;
  colors?: string[];
  className?: string;
}

export default function ParticleBurst({
  trigger,
  count = 18,
  distance = 120,
  size = 8,
  colors = DEFAULT_COLORS,
  className,
}: ParticleBurstProps) {
  // Math.random aman di sini karena partikel hanya dibuat setelah interaksi
  // pengguna (trigger > 0), jadi tidak pernah ikut dirender di server.
  const particles = useMemo(() => {
    if (trigger <= 0) return [];
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const travel = distance * (0.55 + Math.random() * 0.6);
      return {
        id: i,
        x: Math.cos(angle) * travel,
        y: Math.sin(angle) * travel,
        color: colors[i % colors.length],
        scale: 0.6 + Math.random() * 0.9,
        duration: 0.7 + Math.random() * 0.5,
      };
    });
  }, [trigger, count, distance, colors]);

  if (particles.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-1/2 z-20 ${className ?? ""}`}
    >
      {particles.map((p) => (
        <motion.span
          key={`${trigger}-${p.id}`}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            backgroundColor: p.color,
            boxShadow: `0 0 ${size * 2}px ${p.color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: p.scale }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.15 }}
          transition={{ duration: p.duration, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}