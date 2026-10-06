"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ClipboardCopy, Download, Sparkles, Trophy } from "lucide-react";

import ParticleBurst from "@/components/gamification/ParticleBurst";
import ShapeToolbar from "@/components/playground/ShapeToolbar";
import WireframeCanvas from "@/components/playground/WireframeCanvas";
import Button3D from "@/components/ui/Button3D";
import {
  CHALLENGE_MISSION_ID,
  CHALLENGE_XP,
  MAX_SHAPES,
  STORAGE_KEY,
  constrainShape,
  createId,
  createShape,
  evaluateChallenge,
  generateHtml,
  instantiateTemplate,
  sanitizeShapes,
} from "@/lib/data/wireframe";
import { cn } from "@/lib/utils";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import type { WireframeShape, WireframeShapeType } from "@/types";

type CopyStatus = "idle" | "copied" | "failed";

export default function PlaygroundBoard() {
  const hydrated = useHasHydrated();
  const completedIds = useGameStore((state) => state.completedMissionIds);
  const completeMission = useGameStore((state) => state.completeMission);

  const [shapes, setShapes] = useState<WireframeShape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [burst, setBurst] = useState(0);

  /* ---------- Muat dan simpan otomatis ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setShapes(sanitizeShapes(JSON.parse(raw)));
    } catch {
      // Data rusak atau storage diblokir: mulai dari kanvas kosong
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes));
      } catch {
        // Abaikan jika penyimpanan penuh atau diblokir
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [shapes, loaded]);

  useEffect(() => {
    if (copyStatus === "idle") return;
    const timer = setTimeout(() => setCopyStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  const selected = useMemo(
    () => shapes.find((shape) => shape.id === selectedId) ?? null,
    [shapes, selectedId]
  );
  const html = useMemo(() => generateHtml(shapes), [shapes]);
  const challenge = useMemo(() => evaluateChallenge(shapes), [shapes]);
  const challengeDone = challenge.every((item) => item.done);
  const claimed = hydrated && completedIds.includes(CHALLENGE_MISSION_ID);

  /* ---------- Aksi kanvas ---------- */
  const handleAdd = (type: WireframeShapeType) => {
    if (shapes.length >= MAX_SHAPES) return;
    const offset = (shapes.length % 8) * 16;
    const shape = createShape(type, 48 + offset, 48 + offset);
    setShapes((previous) => [...previous, shape]);
    setSelectedId(shape.id);
  };

  const handleLabelChange = (label: string) => {
    if (!selectedId) return;
    setShapes((previous) =>
      previous.map((shape) => (shape.id === selectedId ? { ...shape, label } : shape))
    );
  };

  const handleDuplicate = () => {
    if (!selected || shapes.length >= MAX_SHAPES) return;
    const copy = constrainShape({
      ...selected,
      id: createId(),
      x: selected.x + 16,
      y: selected.y + 16,
    });
    setShapes((previous) => [...previous, copy]);
    setSelectedId(copy.id);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setShapes((previous) => previous.filter((shape) => shape.id !== selectedId));
    setSelectedId(null);
  };

  const handleApplyTemplate = (templateId: string) => {
    if (shapes.length > 0 && !window.confirm("Template akan menggantikan wireframe saat ini. Lanjutkan?")) {
      return;
    }
    setShapes(instantiateTemplate(templateId));
    setSelectedId(null);
  };

  const handleClear = () => {
    if (shapes.length === 0) return;
    if (!window.confirm("Hapus semua elemen dari kanvas?")) return;
    setShapes([]);
    setSelectedId(null);
  };

  /* ---------- Ekspor ---------- */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(shapes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wireframe.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Hadiah tantangan ---------- */
  const handleClaim = () => {
    const result = completeMission(CHALLENGE_MISSION_ID, CHALLENGE_XP);
    if (result.awarded) setBurst((value) => value + 1);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <ShapeToolbar
          selected={selected}
          shapeCount={shapes.length}
          maxShapes={MAX_SHAPES}
          onAdd={handleAdd}
          onLabelChange={handleLabelChange}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onApplyTemplate={handleApplyTemplate}
          onClear={handleClear}
        />

        <div className="min-w-0 space-y-4">
          <WireframeCanvas
            shapes={shapes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onShapesChange={setShapes}
          />
          <p className="text-center text-xs text-slate-500">
            Seret elemen untuk memindahkan, tarik kotak biru di sudutnya untuk mengubah ukuran.
            Tombol panah menggeser, Delete menghapus. Tersimpan otomatis di perangkatmu.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---------- Tantangan desainer ---------- */}
        <section className="neu-card relative space-y-4 p-6" aria-labelledby="challenge-title">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-neon-gold" />
            <h2 id="challenge-title" className="font-display text-lg font-bold">
              Tantangan Desainer
            </h2>
          </div>

          <ul className="space-y-2">
            {challenge.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-sm">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                    item.done ? "bg-neon-lime text-void-950" : "bg-void-900 shadow-neu-inset"
                  )}
                >
                  {item.done && <Check className="h-3 w-3" />}
                </span>
                <span className={item.done ? "text-slate-200" : "text-slate-400"}>{item.label}</span>
              </li>
            ))}
          </ul>

          <div className="relative flex flex-wrap items-center gap-4">
            <ParticleBurst trigger={burst} count={22} distance={130} />
            {claimed ? (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm font-semibold text-neon-lime"
              >
                <Check className="h-4 w-4" />
                Hadiah sudah diklaim
              </motion.p>
            ) : (
              <Button3D
                variant="gold"
                icon={<Sparkles className="relative h-4 w-4" />}
                disabled={!challengeDone || !hydrated}
                onClick={handleClaim}
              >
                Klaim +{CHALLENGE_XP} XP
              </Button3D>
            )}
          </div>
        </section>

        {/* ---------- Ekspor ---------- */}
        <section className="neu-card space-y-4 p-6" aria-labelledby="export-title">
          <div>
            <h2 id="export-title" className="font-display text-lg font-bold">
              Dari wireframe ke kode
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Kerangka HTML di bawah dibuat otomatis dari wireframemu. Salin lalu tempel di editor misi.
            </p>
          </div>

          <pre
            tabIndex={0}
            className="neu-inset max-h-56 overflow-auto p-4 font-mono text-xs leading-relaxed text-neon-lime"
          >
            <code>{html}</code>
          </pre>

          <div className="flex flex-wrap items-center gap-3">
            <Button3D
              size="sm"
              icon={<ClipboardCopy className="relative h-4 w-4" />}
              onClick={handleCopy}
              disabled={shapes.length === 0}
            >
              Salin HTML
            </Button3D>
            <Button3D
              variant="ghost"
              size="sm"
              icon={<Download className="relative h-4 w-4" />}
              onClick={handleDownload}
              disabled={shapes.length === 0}
            >
              Unduh JSON
            </Button3D>
            <span role="status" className="text-xs">
              {copyStatus === "copied" && <span className="text-neon-lime">Tersalin!</span>}
              {copyStatus === "failed" && (
                <span className="text-neon-red">Gagal menyalin. Blok teks lalu salin manual.</span>
              )}
            </span>
          </div>

          <Link
            href="/world-map"
            className="inline-block text-sm text-arcane-300 underline-offset-2 hover:underline"
          >
            Siap menulis kode? Buka Peta Dunia
          </Link>
        </section>
      </div>
    </div>
  );
}