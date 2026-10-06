import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type Button3DVariant = "primary" | "success" | "danger" | "gold" | "ghost";
export type Button3DSize = "sm" | "md" | "lg";

const VARIANTS: Record<Button3DVariant, string> = {
  primary:
    "bg-[linear-gradient(180deg,#a67bff_0%,#7c3aed_100%)] text-white " +
    "shadow-[0_6px_0_0_#3b1d8f,0_12px_18px_rgba(0,0,0,0.5)] " +
    "active:shadow-[0_1px_0_0_#3b1d8f,0_3px_6px_rgba(0,0,0,0.5)]",
  success:
    "bg-[linear-gradient(180deg,#bef264_0%,#65a30d_100%)] text-void-950 " +
    "shadow-[0_6px_0_0_#3f6212,0_12px_18px_rgba(0,0,0,0.5)] " +
    "active:shadow-[0_1px_0_0_#3f6212,0_3px_6px_rgba(0,0,0,0.5)]",
  danger:
    "bg-[linear-gradient(180deg,#fda4af_0%,#e11d48_100%)] text-white " +
    "shadow-[0_6px_0_0_#881337,0_12px_18px_rgba(0,0,0,0.5)] " +
    "active:shadow-[0_1px_0_0_#881337,0_3px_6px_rgba(0,0,0,0.5)]",
  gold:
    "bg-[linear-gradient(180deg,#fde68a_0%,#f59e0b_100%)] text-void-950 " +
    "shadow-[0_6px_0_0_#92400e,0_12px_18px_rgba(0,0,0,0.5)] " +
    "active:shadow-[0_1px_0_0_#92400e,0_3px_6px_rgba(0,0,0,0.5)]",
  ghost:
    "border border-white/10 bg-void-700 text-slate-100 " +
    "shadow-[0_6px_0_0_#0a0c1a,0_12px_18px_rgba(0,0,0,0.45)] " +
    "active:shadow-[0_1px_0_0_#0a0c1a,0_3px_6px_rgba(0,0,0,0.45)]",
};

const SIZES: Record<Button3DSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Button3DVariant;
  size?: Button3DSize;
  icon?: ReactNode;
  loading?: boolean;
}

/**
 * Tombol bergaya sakelar mekanis: punya "ketebalan" dari bayangan padat
 * dan turun fisik ketika ditekan. Beri jarak bawah (mis. mb-2) bila perlu.
 */
const Button3D = forwardRef<HTMLButtonElement, Button3DProps>(function Button3D(
  {
    variant = "primary",
    size = "md",
    icon,
    loading = false,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex select-none items-center justify-center gap-2 rounded-2xl font-display font-semibold",
        "transition-all duration-100 hover:-translate-y-px hover:brightness-110 active:translate-y-[5px]",
        "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {/* Kilap atas */}
      <span className="pointer-events-none absolute inset-x-2 top-1 h-1/3 rounded-t-xl bg-white/25" />
      {loading ? <Loader2 className="relative h-4 w-4 animate-spin" /> : icon}
      <span className="relative">{children}</span>
    </button>
  );
});

export default Button3D;