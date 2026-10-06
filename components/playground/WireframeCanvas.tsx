"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GRID_SIZE,
  MIN_SHAPE_SIZE,
  SHAPE_DEFINITIONS,
  constrainShape,
  snap,
} from "@/lib/data/wireframe";
import { clamp, cn } from "@/lib/utils";
import type { WireframeShape } from "@/types";

interface DragState {
  id: string;
  mode: "move" | "resize";
  pointerId: number;
  startX: number;
  startY: number;
  origin: WireframeShape;
}

/* ---------- Tampilan visual tiap jenis bentuk ---------- */
function ShapeView({ shape }: { shape: WireframeShape }) {
  const label = shape.label ?? "";

  switch (shape.type) {
    case "rectangle":
    case "circle":
      return (
        <div
          className={cn(
            "grid h-full w-full place-items-center overflow-hidden border-2 border-dashed border-slate-400/70 bg-white/5 px-2 text-center text-xs text-slate-300",
            shape.type === "circle" ? "rounded-full" : "rounded-lg"
          )}
        >
          <span className="truncate">{label}</span>
        </div>
      );

    case "text":
      return (
        <div className="flex h-full w-full items-center overflow-hidden rounded border border-dashed border-slate-500/40 px-2 text-sm font-semibold text-slate-100">
          <span className="truncate">{label}</span>
        </div>
      );

    case "button":
      return (
        <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-xl bg-arcane-600 px-2 font-display text-sm font-bold text-white shadow-[0_4px_0_0_#3b1d8f]">
          <span className="pointer-events-none absolute inset-x-2 top-0.5 h-1/3 rounded-t-lg bg-white/25" />
          <span className="relative truncate">{label}</span>
        </div>
      );

    case "input":
      return (
        <div className="flex h-full w-full items-center overflow-hidden rounded-md border-2 border-slate-400/70 bg-void-900 px-3 text-sm italic text-slate-500">
          <span className="truncate">{label}</span>
        </div>
      );

    case "image":
      return (
        <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-lg border-2 border-slate-400/70 bg-void-900 text-slate-500">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="relative max-w-[90%] truncate rounded bg-void-900/90 px-2 py-0.5 text-xs text-slate-300">
            {label}
          </span>
        </div>
      );
  }
}

interface WireframeCanvasProps {
  shapes: WireframeShape[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onShapesChange: (shapes: WireframeShape[]) => void;
  className?: string;
}

/**
 * Kanvas wireframe berukuran logis 800 x 520 yang diskalakan mengikuti lebar layar.
 * Mendukung seret, ubah ukuran (snap ke grid), dan keyboard (panah dan Delete).
 */
export default function WireframeCanvas({
  shapes,
  selectedId,
  onSelect,
  onShapesChange,
  className,
}: WireframeCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const update = () => setScale(Math.min(1, element.clientWidth / CANVAS_WIDTH));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const replaceShape = (next: WireframeShape) =>
    onShapesChange(shapes.map((shape) => (shape.id === next.id ? next : shape)));

  const beginDrag = (
    event: PointerEvent<HTMLElement>,
    shape: WireframeShape,
    mode: DragState["mode"]
  ) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    onSelect(shape.id);

    dragRef.current = {
      id: shape.id,
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: shape,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = (event.clientX - drag.startX) / scale;
    const dy = (event.clientY - drag.startY) / scale;
    const { origin } = drag;

    if (drag.mode === "move") {
      replaceShape(
        constrainShape({ ...origin, x: snap(origin.x + dx), y: snap(origin.y + dy) })
      );
    } else {
      replaceShape(
        constrainShape({
          ...origin,
          width: clamp(snap(origin.width + dx), MIN_SHAPE_SIZE, CANVAS_WIDTH - origin.x),
          height: clamp(snap(origin.height + dy), MIN_SHAPE_SIZE, CANVAS_HEIGHT - origin.y),
        })
      );
    }
  };

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, shape: WireframeShape) => {
    const step = event.shiftKey ? GRID_SIZE * 2 : GRID_SIZE;
    let dx = 0;
    let dy = 0;

    switch (event.key) {
      case "ArrowLeft":
        dx = -step;
        break;
      case "ArrowRight":
        dx = step;
        break;
      case "ArrowUp":
        dy = -step;
        break;
      case "ArrowDown":
        dy = step;
        break;
      case "Delete":
      case "Backspace":
        event.preventDefault();
        onShapesChange(shapes.filter((item) => item.id !== shape.id));
        onSelect(null);
        return;
      default:
        return;
    }

    event.preventDefault();
    replaceShape(constrainShape({ ...shape, x: shape.x + dx, y: shape.y + dy }));
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("neu-inset relative mx-auto w-full max-w-[800px] overflow-hidden", className)}
      style={{ height: CANVAS_HEIGHT * scale }}
    >
      <div
        role="application"
        aria-label="Kanvas wireframe. Pilih elemen lalu geser dengan mouse atau tombol panah."
        className="bg-grid absolute left-0 top-0 touch-none"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          backgroundSize: "16px 16px",
        }}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) onSelect(null);
        }}
      >
        {shapes.length === 0 && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center px-8 text-center text-sm text-slate-500">
            Kanvas masih kosong. Tambahkan elemen dari panel kiri atau pilih template.
          </p>
        )}

        {shapes.map((shape) => {
          const selected = shape.id === selectedId;
          const name = SHAPE_DEFINITIONS[shape.type].name;

          return (
            <div
              key={shape.id}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              aria-label={`${name}${shape.label ? `: ${shape.label}` : ""}`}
              onPointerDown={(event) => beginDrag(event, shape, "move")}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onFocus={() => onSelect(shape.id)}
              onKeyDown={(event) => handleKeyDown(event, shape)}
              className={cn(
                "absolute cursor-grab touch-none select-none rounded-lg outline-none active:cursor-grabbing",
                selected && "z-10 ring-2 ring-neon-cyan shadow-[0_0_20px_rgba(34,211,238,0.45)]"
              )}
              style={{
                left: shape.x,
                top: shape.y,
                width: shape.width,
                height: shape.height,
              }}
            >
              <ShapeView shape={shape} />

              {selected && (
                <span
                  aria-hidden="true"
                  onPointerDown={(event) => beginDrag(event, shape, "resize")}
                  className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize touch-none rounded bg-neon-cyan shadow-glow-cyan"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}