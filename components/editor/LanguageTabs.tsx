"use client";

import { useId, type KeyboardEvent } from "react";
import { motion } from "framer-motion";

import { ALL_LANGUAGES, LANGUAGE_LABELS } from "@/lib/data/suggestions";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

interface LanguageTabsProps {
  value: Language;
  onChange: (language: Language) => void;
  languages?: readonly Language[];
  className?: string;
}

/** Tab pemilih bahasa dengan pil bercahaya yang bergeser halus. Mendukung tombol panah. */
export default function LanguageTabs({
  value,
  onChange,
  languages = ALL_LANGUAGES,
  className,
}: LanguageTabsProps) {
  const uid = useId();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();

    const step = event.key === "ArrowRight" ? 1 : -1;
    const index = languages.indexOf(value);
    const next = languages[(index + step + languages.length) % languages.length];

    onChange(next);
    document.getElementById(`${uid}-${next}`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Pilih bahasa pemrograman"
      onKeyDown={handleKeyDown}
      className={cn("neu-inset no-scrollbar flex gap-1 overflow-x-auto p-1.5", className)}
    >
      {languages.map((language) => {
        const active = language === value;
        return (
          <button
            key={language}
            id={`${uid}-${language}`}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(language)}
            className={cn(
              "relative shrink-0 rounded-xl px-4 py-2 font-display text-sm font-semibold transition-colors",
              active ? "text-white" : "text-slate-400 hover:text-white"
            )}
          >
            {active && (
              <motion.span
                layoutId={`${uid}-pill`}
                className="absolute inset-0 rounded-xl bg-arcane-600/40 shadow-[0_0_18px_rgba(139,92,246,0.5)] ring-1 ring-arcane-400/50"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{LANGUAGE_LABELS[language]}</span>
          </button>
        );
      })}
    </div>
  );
}