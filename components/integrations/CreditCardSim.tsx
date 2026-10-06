"use client";

import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, RotateCcw, ShieldCheck, Wifi, X } from "lucide-react";

import ParticleBurst from "@/components/gamification/ParticleBurst";
import Button3D from "@/components/ui/Button3D";
import { postJson } from "@/lib/client-api";
import {
  PAYMENT_SCENARIOS,
  type PaymentCurrency,
  type PaymentRecord,
  type PaymentScenario,
} from "@/lib/mock-db/schema";
import { cn } from "@/lib/utils";
import type { PaymentProvider, SimulationStatus } from "@/types";

interface PaymentResult {
  payment: PaymentRecord;
  providerResponse: Record<string, unknown>;
}

const PROVIDER_STYLE: Record<PaymentProvider, { name: string; gradient: string }> = {
  midtrans: { name: "Midtrans", gradient: "from-sky-500 to-blue-800" },
  xendit: { name: "Xendit", gradient: "from-blue-500 to-indigo-800" },
  stripe: { name: "Stripe", gradient: "from-violet-500 to-indigo-900" },
};

const DEFAULT_AMOUNT: Record<PaymentProvider, number> = {
  midtrans: 149000,
  xendit: 149000,
  stripe: 20,
};

const CURRENCY: Record<PaymentProvider, PaymentCurrency> = {
  midtrans: "IDR",
  xendit: "IDR",
  stripe: "USD",
};

const SCENARIO_ORDER: readonly PaymentScenario[] = [
  "success",
  "declined",
  "insufficient_funds",
  "expired_card",
];

const BURST_COLORS = ["#a3e635", "#22d3ee", "#fbbf24", "#f472b6"];

/** Sembunyikan sisi belakang kartu saat membelakangi layar (termasuk Safari). */
const FACE: CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

function formatMoney(amount: number, currency: PaymentCurrency): string {
  return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(amount);
}

interface CreditCardSimProps {
  provider: PaymentProvider;
  onResult?: (outcome: "success" | "failed") => void;
}

export default function CreditCardSim({ provider, onResult }: CreditCardSimProps) {
  const reduceMotion = useReducedMotion();

  const [scenario, setScenario] = useState<PaymentScenario>("success");
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);

  const style = PROVIDER_STYLE[provider];
  const amount = DEFAULT_AMOUNT[provider];
  const currency = CURRENCY[provider];
  const flipped = status === "success" || status === "failed";
  const processing = status === "processing";
  const succeeded = status === "success";

  const handlePay = async () => {
    if (processing) return;
    setStatus("processing");
    setError(null);
    setResult(null);

    const response = await postJson<PaymentResult>("/api/payments/simulate", {
      provider,
      amount,
      scenario,
    });

    if (!response.ok || !response.data) {
      setStatus("idle");
      setError(response.error ?? "Simulasi gagal. Coba lagi.");
      return;
    }

    const paid = response.data.payment.status === "success";
    setResult(response.data);
    setStatus(paid ? "success" : "failed");
    if (paid) setBurst((value) => value + 1);
    onResult?.(paid ? "success" : "failed");
  };

  const handleReset = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
  };

  const statusText = processing
    ? "Memproses pembayaran..."
    : succeeded
      ? "Pembayaran berhasil."
      : status === "failed"
        ? `Pembayaran gagal. ${result?.payment.failureMessage ?? ""}`
        : "Pilih skenario lalu tekan bayar.";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ---------- Kartu 3D ---------- */}
      <div className="space-y-5">
        <div className="relative">
          <ParticleBurst trigger={burst} count={30} distance={170} colors={BURST_COLORS} />

          <div
            className={cn(
              "scene-3d mx-auto w-full max-w-sm",
              status === "failed" && "animate-shake-x"
            )}
          >
            <motion.div
              className="preserve-3d relative"
              style={{ aspectRatio: "1.586" }}
              animate={{ rotateY: flipped ? 180 : 0, rotateX: flipped ? 0 : 6 }}
              transition={
                reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 14 }
              }
            >
              {/* Sisi depan */}
              <div
                style={FACE}
                className={cn(
                  "absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-neu",
                  style.gradient
                )}
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />

                <div className="relative flex items-start justify-between">
                  <span className="font-display text-lg font-black">{style.name}</span>
                  <Wifi className="h-6 w-6 rotate-90 opacity-80" />
                </div>

                <div className="relative h-9 w-12 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-600 shadow-inner" />

                <div className="relative">
                  <p className="font-mono text-lg tracking-widest">•••• •••• •••• 4242</p>
                  <div className="mt-2 flex justify-between text-[11px] uppercase tracking-wider opacity-80">
                    <span>Petualang Demo</span>
                    <span>12/34</span>
                  </div>
                </div>

                {processing && (
                  <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-[2px]">
                    <Loader2 className="h-10 w-10 animate-spin" />
                  </div>
                )}
              </div>

              {/* Sisi belakang: hasil */}
              <div
                style={{ ...FACE, transform: "rotateY(180deg)" }}
                className={cn(
                  "absolute inset-0 grid place-items-center overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-center text-white shadow-neu",
                  succeeded ? "from-emerald-500 to-teal-800" : "from-rose-500 to-red-900"
                )}
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                <div className="relative space-y-2">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/20 ring-2 ring-white/50">
                    {succeeded ? <Check className="h-8 w-8" /> : <X className="h-8 w-8" />}
                  </span>
                  <p className="font-display text-xl font-black">
                    {succeeded ? "Pembayaran Berhasil" : "Pembayaran Gagal"}
                  </p>
                  <p className="text-sm opacity-90">
                    {succeeded
                      ? `${formatMoney(amount, currency)} · ${result?.payment.reference ?? ""}`
                      : (result?.payment.failureMessage ?? "")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <p role="status" className="text-center text-sm text-slate-400">
          {statusText}
        </p>
      </div>

      {/* ---------- Kontrol dan respons ---------- */}
      <div className="space-y-5">
        <fieldset className="space-y-2">
          <legend className="mb-2 font-display text-sm font-bold">Pilih skenario</legend>
          <div role="radiogroup" aria-label="Skenario pembayaran" className="grid grid-cols-2 gap-2">
            {SCENARIO_ORDER.map((key) => {
              const active = scenario === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={processing}
                  onClick={() => setScenario(key)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-left text-sm transition disabled:opacity-60",
                    active
                      ? "bg-arcane-600/40 text-white ring-1 ring-arcane-400/60"
                      : "bg-void-700 text-slate-300 hover:bg-white/10"
                  )}
                >
                  {PAYMENT_SCENARIOS[key].label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          {flipped ? (
            <Button3D
              variant="ghost"
              icon={<RotateCcw className="relative h-4 w-4" />}
              onClick={handleReset}
            >
              Coba Skenario Lain
            </Button3D>
          ) : (
            <Button3D variant="success" loading={processing} onClick={handlePay}>
              Bayar {formatMoney(amount, currency)}
            </Button3D>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-neon-red/10 px-4 py-3 text-sm text-neon-red ring-1 ring-neon-red/40">
            {error}
          </p>
        )}

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neon-lime" />
          Ini simulasi murni. Tidak ada uang yang bergerak dan tidak ada data kartu yang dikirim.
          Nomor di kartu hanya hiasan.
        </p>

        {result && (
          <div className="space-y-2">
            <p className="font-display text-sm font-bold">
              Respons tiruan gaya {style.name}
            </p>
            <pre
              tabIndex={0}
              className="neu-inset max-h-64 overflow-auto p-4 font-mono text-xs leading-relaxed text-neon-lime"
            >
              <code>{JSON.stringify(result.providerResponse, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}