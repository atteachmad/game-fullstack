"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { parseSwitchSpec } from "@/lib/visual-parse";
import { cn } from "@/lib/utils";

const CAP_WIDTH = 176;
const CAP_HEIGHT = 88;

interface MechanicalSwitch3DProps {
  /** Kode CSS pengguna. Bentuk sakelar mengikuti kode ini. */
  code: string;
  className?: string;
}

function getFeedback(depth: number, hasPress: boolean): { text: string; tone: string } {
  if (depth === 0) {
    return {
      text: "Tombolmu masih datar. Tambahkan box-shadow padat di bawahnya agar punya ketebalan.",
      tone: "text-neon-gold",
    };
  }
  if (!hasPress) {
    return {
      text: "Sudah tebal, tetapi belum turun saat ditekan. Tambahkan transform di :active.",
      tone: "text-neon-cyan",
    };
  }
  return {
    text: "Sakelar mekanis sempurna! Coba tekan dan rasakan kliknya.",
    tone: "text-neon-lime",
  };
}

/** Sakelar mekanis taktil yang bentuknya dibangun dari CSS yang diketik pengguna. */
export default function MechanicalSwitch3D({ code, className }: MechanicalSwitch3DProps) {
  const reduceMotion = useReducedMotion();
  const spec = useMemo(() => parseSwitchSpec(code), [code]);

  const [pressed, setPressed] = useState(false);
  const [on, setOn] = useState(false);

  const feedback = getFeedback(spec.depth, spec.hasPressEffect);
  const travel = pressed ? spec.pressTravel : 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") setPressed(true);
  };

  const release = () => setPressed(false);

  return (
    <div className={cn("neu-inset overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 text-xs">
        <span className="font-display font-semibold text-slate-200">Sakelar 3D dari kodemu</span>
        <span className="text-slate-500">tekan tombolnya</span>
      </div>

      <div className="scene-3d grid place-items-center px-4 py-10">
        <div
          className="preserve-3d"
          style={{ transform: "rotateX(34deg) rotateZ(-5deg)" }}
        >
          {/* Rumah sakelar */}
          <div className="relative rounded-3xl bg-void-700 p-7 shadow-neu">
            {/* LED indikator */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute right-5 top-4 h-3 w-3 rounded-full transition-all duration-200",
                on
                  ? "bg-neon-lime shadow-[0_0_14px_rgba(163,230,53,0.95)]"
                  : "bg-slate-700"
              )}
            />

            {/* Sumur tombol */}
            <div className="rounded-2xl bg-void-900 p-6 shadow-neu-inset">
              <div
                className="relative"
                style={{ width: CAP_WIDTH, height: CAP_HEIGHT + spec.depth }}
              >
                {/* Bayangan di lantai sumur */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 rounded-full bg-black/60 blur-md"
                  style={{ top: CAP_HEIGHT + spec.depth - 6, height: 12 }}
                />

                {/* Sisi tebal tombol */}
                <span
                  aria-hidden="true"
                  className="absolute left-0"
                  style={{
                    top: spec.depth,
                    width: CAP_WIDTH,
                    height: CAP_HEIGHT,
                    borderRadius: spec.radius,
                    backgroundColor: spec.sideColor,
                  }}
                />

                {/* Tutup tombol */}
                <motion.button
                  type="button"
                  aria-pressed={on}
                  aria-label={`Sakelar, saat ini ${on ? "menyala" : "mati"}`}
                  onClick={() => setOn((value) => !value)}
                  onPointerDown={() => setPressed(true)}
                  onPointerUp={release}
                  onPointerLeave={release}
                  onPointerCancel={release}
                  onKeyDown={handleKeyDown}
                  onKeyUp={release}
                  onBlur={release}
                  animate={{ y: travel }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 700, damping: 32 }
                  }
                  className="absolute left-0 top-0 grid cursor-pointer select-none place-items-center font-display text-xl font-bold text-white outline-offset-4"
                  style={{
                    width: CAP_WIDTH,
                    height: CAP_HEIGHT,
                    borderRadius: spec.radius,
                    backgroundColor: spec.color,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      borderRadius: spec.radius,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 55%)",
                    }}
                  />
                  <span className="relative drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                    {on ? "ON" : "OFF"}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hasil pembacaan kode */}
      <div className="space-y-3 border-t border-white/5 px-4 py-4">
        <ul className="flex flex-wrap gap-2 text-[11px]">
          <li className="rounded-full bg-white/5 px-2.5 py-1 text-slate-300">
            Ketebalan: <b className="text-white">{spec.depth}px</b>
          </li>
          <li className="rounded-full bg-white/5 px-2.5 py-1 text-slate-300">
            Efek tekan:{" "}
            <b className={spec.hasPressEffect ? "text-neon-lime" : "text-slate-500"}>
              {spec.hasPressEffect ? `turun ${spec.pressTravel}px` : "belum ada"}
            </b>
          </li>
          <li className="rounded-full bg-white/5 px-2.5 py-1 text-slate-300">
            Sudut: <b className="text-white">{spec.radius}px</b>
          </li>
        </ul>
        <p role="status" className={cn("text-sm", feedback.tone)}>
          {feedback.text}
        </p>
      </div>
    </div>
  );
}