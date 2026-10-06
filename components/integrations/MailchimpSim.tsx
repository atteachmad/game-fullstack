"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

import { XpPop, useSimReward } from "@/components/integrations/SimReward";
import Button3D from "@/components/ui/Button3D";
import { postJson } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const XP = 30;

type Trigger = "welcome" | "cart_abandoned" | "course_completed";

const TRIGGERS: ReadonlyArray<{ id: Trigger; label: string; description: string }> = [
  { id: "welcome", label: "Pelanggan baru", description: "Seseorang baru mendaftar." },
  { id: "cart_abandoned", label: "Keranjang ditinggalkan", description: "Belanja tidak diselesaikan." },
  { id: "course_completed", label: "Kursus selesai", description: "Pelajar menamatkan kursus." },
];

interface MailchimpResult {
  simulation: {
    status: string;
    automation: string;
    scheduledSteps: string[];
  };
}

export default function MailchimpSim() {
  const [email, setEmail] = useState("budi@contoh.com");
  const [trigger, setTrigger] = useState<Trigger>("welcome");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MailchimpResult["simulation"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runKey, setRunKey] = useState(0);
  const { claim, justAwarded } = useSimReward("sim-mailchimp", XP);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const response = await postJson<MailchimpResult>("/api/crm/simulate", {
      channel: "mailchimp",
      email,
      trigger,
    });
    setLoading(false);

    if (!response.ok || !response.data) {
      setResult(null);
      setError(response.error ?? "Gagal memicu otomatisasi.");
      return;
    }

    setResult(response.data.simulation);
    setRunKey((value) => value + 1);
    claim();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="mc-email" className="font-display text-sm font-bold">
            Email pelanggan
          </label>
          <input
            id="mc-email"
            type="email"
            value={email}
            maxLength={120}
            onChange={(event) => setEmail(event.target.value)}
            className="neu-inset w-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-arcane-400/60"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-2 font-display text-sm font-bold">Pemicu otomatisasi</legend>
          <div role="radiogroup" aria-label="Pemicu otomatisasi" className="space-y-2">
            {TRIGGERS.map((item) => {
              const active = trigger === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTrigger(item.id)}
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-left transition",
                    active
                      ? "bg-arcane-600/40 ring-1 ring-arcane-400/60"
                      : "bg-void-700 hover:bg-white/10"
                  )}
                >
                  <span className="block text-sm font-semibold text-slate-100">{item.label}</span>
                  <span className="block text-xs text-slate-400">{item.description}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <Button3D
            type="submit"
            loading={loading}
            icon={<Send className="relative h-4 w-4" />}
          >
            Picu Otomatisasi
          </Button3D>
          <XpPop show={justAwarded} xp={XP} />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-neon-red/10 px-4 py-3 text-sm text-neon-red ring-1 ring-neon-red/40">
            {error}
          </p>
        )}
      </form>

      {/* ---------- Hasil ---------- */}
      <div className="neu-card relative min-h-[18rem] space-y-5 p-6" aria-live="polite">
        {result ? (
          <>
            <div className="flex items-center gap-4">
              <motion.span
                key={runKey}
                initial={{ y: 20, rotate: -12, opacity: 0 }}
                animate={{ y: 0, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 12 }}
                className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-neon-gold to-neon-pink shadow-glow-gold"
              >
                <span className="absolute inset-x-1.5 top-1.5 h-5 rounded-t-xl bg-white/30" />
                <Mail className="relative h-7 w-7 text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.45)]" />
              </motion.span>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold">{result.automation}</p>
                <p className="text-xs text-neon-lime">Status: {result.status}</p>
              </div>
            </div>

            <ol className="space-y-3" aria-label="Jadwal email otomatis">
              {result.scheduledSteps.map((step, index) => (
                <motion.li
                  key={`${runKey}-${step}`}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.35 }}
                  className="flex items-start gap-3 text-sm text-slate-200"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-arcane-600/50 font-display text-xs font-bold">
                    {index + 1}
                  </span>
                  {step}
                </motion.li>
              ))}
            </ol>
          </>
        ) : (
          <div className="grid h-full min-h-[14rem] place-items-center text-center">
            <p className="max-w-xs text-sm text-slate-400">
              Pilih pemicu lalu tekan tombol. Jadwal email otomatis yang dibuat Mailchimp akan tampil di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}