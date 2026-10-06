"use client";

import { useId } from "react";
import {
  Circle,
  Copy,
  Image as ImageIcon,
  LayoutTemplate,
  MousePointerClick,
  Square,
  TextCursorInput,
  Trash2,
  Type,
  type LucideIcon,
} from "lucide-react";

import Button3D from "@/components/ui/Button3D";
import { SHAPE_DEFINITIONS, SHAPE_ORDER, TEMPLATES } from "@/lib/data/wireframe";
import type { WireframeShape, WireframeShapeType } from "@/types";

const SHAPE_ICONS: Record<WireframeShapeType, LucideIcon> = {
  rectangle: Square,
  circle: Circle,
  text: Type,
  button: MousePointerClick,
  input: TextCursorInput,
  image: ImageIcon,
};

interface ShapeToolbarProps {
  selected: WireframeShape | null;
  shapeCount: number;
  maxShapes: number;
  onAdd: (type: WireframeShapeType) => void;
  onLabelChange: (label: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onApplyTemplate: (templateId: string) => void;
  onClear: () => void;
}

export default function ShapeToolbar({
  selected,
  shapeCount,
  maxShapes,
  onAdd,
  onLabelChange,
  onDuplicate,
  onDelete,
  onApplyTemplate,
  onClear,
}: ShapeToolbarProps) {
  const labelId = useId();
  const full = shapeCount >= maxShapes;

  return (
    <aside className="space-y-5" aria-label="Alat wireframe">
      {/* ---------- Tambah elemen ---------- */}
      <section className="neu-card space-y-3 p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-sm font-bold">Tambah elemen</h2>
          <span className="text-xs tabular-nums text-slate-500">
            {shapeCount} / {maxShapes}
          </span>
        </div>

        <ul className="grid grid-cols-2 gap-2">
          {SHAPE_ORDER.map((type) => {
            const Icon = SHAPE_ICONS[type];
            return (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => onAdd(type)}
                  disabled={full}
                  className="flex w-full items-center gap-2 rounded-xl bg-void-700 px-3 py-2.5 text-left text-sm shadow-[0_4px_0_0_#0a0c1a] transition-all hover:-translate-y-px hover:bg-arcane-600/30 active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-40"
                >
                  <Icon className="h-4 w-4 shrink-0 text-neon-cyan" />
                  {SHAPE_DEFINITIONS[type].name}
                </button>
              </li>
            );
          })}
        </ul>

        {full && (
          <p role="status" className="text-xs text-neon-gold">
            Batas elemen tercapai. Hapus satu elemen untuk menambah yang baru.
          </p>
        )}
      </section>

      {/* ---------- Elemen terpilih ---------- */}
      <section className="neu-card space-y-3 p-5" aria-live="polite">
        <h2 className="font-display text-sm font-bold">Elemen terpilih</h2>

        {selected ? (
          <>
            <p className="text-xs text-slate-400">
              {SHAPE_DEFINITIONS[selected.type].name} · {selected.width} x {selected.height}
            </p>

            <div className="space-y-1.5">
              <label htmlFor={labelId} className="text-xs font-semibold text-slate-300">
                Label
              </label>
              <input
                id={labelId}
                type="text"
                maxLength={60}
                value={selected.label ?? ""}
                onChange={(event) => onLabelChange(event.target.value)}
                className="neu-inset w-full px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-arcane-400/60"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button3D
                variant="ghost"
                size="sm"
                icon={<Copy className="relative h-4 w-4" />}
                onClick={onDuplicate}
                disabled={full}
              >
                Gandakan
              </Button3D>
              <Button3D
                variant="danger"
                size="sm"
                icon={<Trash2 className="relative h-4 w-4" />}
                onClick={onDelete}
              >
                Hapus
              </Button3D>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">
            Klik sebuah elemen di kanvas untuk mengubah label, menggandakan, atau menghapusnya.
          </p>
        )}
      </section>

      {/* ---------- Template ---------- */}
      <section className="neu-card space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold">
          <LayoutTemplate className="h-4 w-4 text-neon-pink" />
          Template cepat
        </h2>
        <ul className="space-y-2">
          {TEMPLATES.map((template) => (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => onApplyTemplate(template.id)}
                className="w-full rounded-xl bg-void-700 px-3 py-2.5 text-left transition hover:bg-arcane-600/30"
              >
                <span className="block text-sm font-semibold text-slate-100">{template.name}</span>
                <span className="block text-[11px] leading-snug text-slate-400">
                  {template.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClear}
          disabled={shapeCount === 0}
          className="text-xs text-slate-500 underline-offset-2 transition hover:text-neon-red hover:underline disabled:pointer-events-none disabled:opacity-40"
        >
          Kosongkan kanvas
        </button>
      </section>
    </aside>
  );
}