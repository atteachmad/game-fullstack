"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type ItemKind =
  | "heading"
  | "text"
  | "label"
  | "input"
  | "textarea"
  | "select"
  | "check"
  | "button";

interface PaperItem {
  kind: ItemKind;
  text: string;
  inputType?: string;
}

const MAX_ITEMS = 14;

function clip(text: string, max = 44): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

/** Membaca HTML pengguna dan mengambil elemen yang akan tampil di kertas. */
function parseHtml(html: string): PaperItem[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const scope: ParentNode = doc.querySelector("form") ?? doc.body;
  const items: PaperItem[] = [];

  scope
    .querySelectorAll("h1, h2, h3, p, label, input, textarea, select, button")
    .forEach((element) => {
      const tag = element.tagName.toLowerCase();

      if (tag === "h1" || tag === "h2" || tag === "h3") {
        items.push({ kind: "heading", text: clip(element.textContent ?? "") });
      } else if (tag === "p") {
        items.push({ kind: "text", text: clip(element.textContent ?? "", 70) });
      } else if (tag === "label") {
        items.push({ kind: "label", text: clip(element.textContent ?? "") });
      } else if (tag === "textarea") {
        items.push({
          kind: "textarea",
          text: clip(element.getAttribute("placeholder") ?? ""),
        });
      } else if (tag === "select") {
        items.push({ kind: "select", text: clip(element.getAttribute("name") ?? "pilih") });
      } else if (tag === "button") {
        items.push({ kind: "button", text: clip(element.textContent ?? "Kirim", 24) || "Kirim" });
      } else if (tag === "input") {
        const type = (element.getAttribute("type") ?? "text").toLowerCase();
        if (type === "hidden") return;
        if (type === "submit" || type === "button") {
          items.push({
            kind: "button",
            text: clip(element.getAttribute("value") ?? "Kirim", 24),
          });
        } else if (type === "checkbox" || type === "radio") {
          items.push({
            kind: "check",
            text: clip(element.getAttribute("name") ?? element.getAttribute("value") ?? type),
            inputType: type,
          });
        } else {
          items.push({
            kind: "input",
            text: clip(element.getAttribute("placeholder") ?? ""),
            inputType: type,
          });
        }
      }
    });

  return items.slice(0, MAX_ITEMS);
}

function PaperRow({ item }: { item: PaperItem }) {
  switch (item.kind) {
    case "heading":
      return <h4 className="font-display text-base font-bold text-slate-800">{item.text}</h4>;
    case "text":
      return <p className="text-xs text-slate-500">{item.text}</p>;
    case "label":
      return (
        <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          {item.text}
        </p>
      );
    case "input":
      return (
        <div className="flex h-8 items-end border-b-2 border-slate-400/70 pb-1 text-xs italic text-slate-400">
          {item.inputType === "password" ? "••••••••" : item.text || "..."}
        </div>
      );
    case "textarea":
      return (
        <div className="h-16 rounded-md border-2 border-slate-300 p-1.5 text-xs italic text-slate-400">
          {item.text}
        </div>
      );
    case "select":
      return (
        <div className="flex h-8 items-center justify-between rounded-md border-2 border-slate-300 px-2 text-xs text-slate-500">
          <span>{item.text}</span>
          <span aria-hidden="true">▾</span>
        </div>
      );
    case "check":
      return (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span
            aria-hidden="true"
            className={cn(
              "h-4 w-4 border-2 border-slate-400",
              item.inputType === "radio" ? "rounded-full" : "rounded"
            )}
          />
          {item.text}
        </div>
      );
    case "button":
      return (
        <motion.div
          whileHover={{ y: -1 }}
          whileTap={{ y: 3 }}
          className="mt-2 inline-block cursor-pointer rounded-lg bg-arcane-600 px-4 py-1.5 font-display text-xs font-bold text-white shadow-[0_4px_0_0_#3b1d8f]"
        >
          {item.text}
        </motion.div>
      );
  }
}

interface Clipboard3DProps {
  /** Kode HTML pengguna. Formulir di dalamnya menjadi isi kertas. */
  code: string;
  className?: string;
}

/** Papan klip kertas 3D yang isinya dibangun dari formulir HTML pengguna. */
export default function Clipboard3D({ code, className }: Clipboard3DProps) {
  const reduceMotion = useReducedMotion();
  const [items, setItems] = useState<PaperItem[]>([]);

  // DOMParser hanya ada di browser, jadi parsing dilakukan di dalam effect
  useEffect(() => {
    const timer = setTimeout(() => setItems(parseHtml(code)), 200);
    return () => clearTimeout(timer);
  }, [code]);

  const fieldCount = items.filter((i) =>
    ["input", "textarea", "select", "check"].includes(i.kind)
  ).length;
  const hasButton = items.some((i) => i.kind === "button");

  return (
    <div className={cn("neu-inset overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 text-xs">
        <span className="font-display font-semibold text-slate-200">Papan klip 3D dari kodemu</span>
        <span className="text-slate-500">formulir menjadi kertas</span>
      </div>

      <div className="scene-3d grid place-items-center px-4 py-10">
        <motion.div
          className="preserve-3d relative w-64"
          style={{ rotateX: 8 }}
          animate={reduceMotion ? { rotateY: -10 } : { rotateY: [-14, -4, -14] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Bayangan di lantai */}
          <div
            aria-hidden="true"
            className="absolute inset-x-4 -bottom-6 h-6 rounded-full bg-black/60 blur-xl"
          />

          {/* Papan kayu */}
          <div
            className="relative rounded-2xl p-4 pt-9 shadow-[10px_12px_0_0_rgba(0,0,0,0.35)]"
            style={{ background: "linear-gradient(145deg, #b9824a 0%, #7a4a24 100%)" }}
          >
            {/* Kertas */}
            <div
              className="relative min-h-[18rem] rounded-md px-4 pb-5 pt-8 shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
              style={{
                transform: "translateZ(14px)",
                background:
                  "repeating-linear-gradient(180deg, #fbf7ea 0px, #fbf7ea 27px, #ece5cf 28px)",
              }}
            >
              <div className="space-y-2.5">
                {items.length === 0 ? (
                  <p className="pt-8 text-center text-xs italic text-slate-400">
                    Kertasmu masih kosong. Tulis formulir HTML di editor.
                  </p>
                ) : (
                  items.map((item, index) => (
                    <motion.div
                      key={`${index}-${item.kind}-${item.text}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.04 }}
                    >
                      <PaperRow item={item} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Penjepit logam */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1.5 h-9 w-24 -translate-x-1/2 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              style={{
                transform: "translateX(-50%) translateZ(28px)",
                background: "linear-gradient(180deg, #f3f4f6 0%, #9ca3af 60%, #6b7280 100%)",
              }}
            >
              <span className="absolute inset-x-2 top-1 h-2 rounded-full bg-white/60" />
              <span className="absolute left-1/2 top-5 h-2.5 w-10 -translate-x-1/2 rounded-full bg-black/40" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="space-y-3 border-t border-white/5 px-4 py-4">
        <ul className="flex flex-wrap gap-2 text-[11px]">
          <li className="rounded-full bg-white/5 px-2.5 py-1 text-slate-300">
            Kolom isian: <b className="text-white">{fieldCount}</b>
          </li>
          <li className="rounded-full bg-white/5 px-2.5 py-1 text-slate-300">
            Tombol kirim:{" "}
            <b className={hasButton ? "text-neon-lime" : "text-slate-500"}>
              {hasButton ? "ada" : "belum ada"}
            </b>
          </li>
        </ul>
        <p role="status" className={cn("text-sm", hasButton ? "text-neon-lime" : "text-neon-gold")}>
          {hasButton
            ? "Formulirmu lengkap dan siap dikirim!"
            : "Kertasmu belum punya tombol kirim. Tambahkan tag button di dalam form."}
        </p>
      </div>
    </div>
  );
}