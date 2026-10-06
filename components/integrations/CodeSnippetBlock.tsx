"use client";

import { useEffect, useState } from "react";
import { Check, ClipboardCopy, Info } from "lucide-react";

import { LANGUAGE_LABELS } from "@/lib/data/suggestions";
import type { IntegrationSnippet } from "@/lib/data/snippets";

type CopyStatus = "idle" | "copied" | "failed";

export default function CodeSnippetBlock({ snippet }: { snippet: IntegrationSnippet }) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <article className="neu-card space-y-4 p-6" aria-label={snippet.title}>
      <header>
        <h3 className="font-display text-lg font-bold">{snippet.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">{snippet.description}</p>
      </header>

      <div className="neu-inset overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-semibold text-slate-200">
              {LANGUAGE_LABELS[snippet.language]}
            </span>
            <span className="truncate font-mono text-slate-400">{snippet.filename}</span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {status === "copied" ? (
              <Check className="h-3.5 w-3.5 text-neon-lime" />
            ) : (
              <ClipboardCopy className="h-3.5 w-3.5" />
            )}
            {status === "copied" ? "Tersalin" : status === "failed" ? "Gagal, salin manual" : "Salin"}
          </button>
        </div>

        <pre tabIndex={0} className="max-h-96 overflow-auto p-4 font-mono text-xs leading-relaxed text-neon-lime">
          <code>{snippet.code}</code>
        </pre>
      </div>

      <ul className="space-y-2" aria-label="Catatan penting">
        {snippet.notes.map((note) => (
          <li key={note} className="flex items-start gap-2 text-sm text-slate-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-neon-cyan" />
            {note}
          </li>
        ))}
      </ul>
    </article>
  );
}