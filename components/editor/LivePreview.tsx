"use client";

import { useEffect, useMemo, useState } from "react";
import { MonitorPlay, RotateCw, Terminal } from "lucide-react";

import { LANGUAGE_LABELS } from "@/lib/data/suggestions";
import { buildPreviewDocument, isPreviewable } from "@/lib/preview";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

interface LivePreviewProps {
  language: Language;
  code: string;
  /** Markup contoh untuk preview CSS (opsional). */
  html?: string;
  className?: string;
  minHeight?: number;
}

export default function LivePreview({
  language,
  code,
  html,
  className,
  minHeight = 320,
}: LivePreviewProps) {
  const [debouncedCode, setDebouncedCode] = useState(code);
  const [runKey, setRunKey] = useState(0);

  // Tunda pembaruan agar iframe tidak dimuat ulang di setiap ketukan
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCode(code), 350);
    return () => clearTimeout(timer);
  }, [code]);

  const previewable = isPreviewable(language);

  const srcDoc = useMemo(
    () => (previewable ? buildPreviewDocument(language, debouncedCode, { html }) : ""),
    [previewable, language, debouncedCode, html]
  );

  const HeaderIcon = language === "javascript" ? Terminal : MonitorPlay;

  return (
    <div className={cn("neu-inset flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <HeaderIcon className="h-4 w-4 text-neon-cyan" />
          <span className="font-display font-semibold">
            {language === "javascript" ? "Output" : "Live Preview"}
          </span>
          {previewable && (
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 animate-pulse-glow rounded-full bg-neon-lime" />
              langsung
            </span>
          )}
        </div>

        {previewable && (
          <button
            type="button"
            onClick={() => setRunKey((key) => key + 1)}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Jalankan ulang
          </button>
        )}
      </div>

      {previewable ? (
        <iframe
          key={runKey}
          title="Hasil kode"
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          style={{ minHeight }}
          className="w-full flex-1 border-0 bg-transparent"
        />
      ) : (
        <div
          style={{ minHeight }}
          className="grid flex-1 place-items-center p-8 text-center"
        >
          <div className="max-w-sm space-y-2">
            <p className="font-display text-lg font-bold">
              Preview {LANGUAGE_LABELS[language]} belum tersedia di browser
            </p>
            <p className="text-sm leading-relaxed text-slate-400">
              Bahasa ini butuh server atau proses build, jadi tidak bisa dijalankan
              langsung di sini. Kamu tetap bisa menulis kodenya, dan jawabanmu akan
              dicek lewat aturan misi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}