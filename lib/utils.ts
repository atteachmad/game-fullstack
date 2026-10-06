import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Menggabungkan class Tailwind tanpa konflik. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Format angka gaya Indonesia: 1250 menjadi "1.250" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}