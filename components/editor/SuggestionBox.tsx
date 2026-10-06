"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

import type { CodeSuggestion } from "@/lib/data/suggestions";
import { cn } from "@/lib/utils";

interface SuggestionBoxProps {
  suggestions: CodeSuggestion[];
  /** Kata yang sedang diketik di posisi kursor. */
  query: string;
  onPick: (suggestion: CodeSuggestion) => void;
  className?: string;
}

/**
 * Kotak saran untuk pemula: menampilkan potongan kode yang cocok dengan kata
 * yang sedang diketik. Klik satu saran untuk menyisipkannya ke editor.
 */
export default function SuggestionBox({
  suggestions,
  query,
  onPick,
  className,
}: SuggestionBoxProps) {
  return (
    <section
      aria-label="Saran kode"
      className={cn("neu-card space-y-3 p-4", className)}
    >
      <div className="flex items-center gap-2 text-xs">
        <Lightbulb className="h-4 w-4 text-neon-gold" />
        <span className="font-display font-semibold text-slate-200">Saran kode</span>
        <span className="text-slate-500">
          {query ? `untuk "${query}"` : "untuk memulai"}
        </span>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-sm text-slate-400">
          Belum ada saran yang cocok. Teruskan mengetik, atau hapus beberapa huruf.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {suggestions.map((suggestion) => (
              <motion.li
                key={suggestion.label}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  type="button"
                  title={suggestion.info}
                  // Cegah editor kehilangan fokus saat chip diklik
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onPick(suggestion)}
                  className="group flex flex-col items-start rounded-xl bg-void-700 px-3 py-2 text-left shadow-[0_4px_0_0_#0a0c1a] transition-all hover:-translate-y-px hover:bg-arcane-600/30 active:translate-y-[3px] active:shadow-none"
                >
                  <span className="font-mono text-sm font-semibold text-neon-cyan">
                    {suggestion.label}
                  </span>
                  <span className="text-[11px] text-slate-400">{suggestion.detail}</span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <p className="text-[11px] text-slate-500">
        Tip: saat popup saran muncul di editor, tekan <kbd className="rounded bg-white/10 px-1">Tab</kbd> atau{" "}
        <kbd className="rounded bg-white/10 px-1">Enter</kbd> untuk menerima, lalu{" "}
        <kbd className="rounded bg-white/10 px-1">Tab</kbd> untuk pindah ke isian berikutnya.
      </p>
    </section>
  );
}