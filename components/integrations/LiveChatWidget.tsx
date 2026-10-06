"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

import { XpPop, useSimReward } from "@/components/integrations/SimReward";
import { postJson } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const XP = 30;

interface ChatLine {
  id: number;
  from: "visitor" | "agent";
  text: string;
}

interface LiveChatResult {
  simulation: { agent: string; reply: string; typingDelayMs: number };
}

const GREETING: ChatLine = {
  id: 0,
  from: "agent",
  text: "Halo! Ada yang bisa kami bantu? Coba tanya soal harga atau laporkan error.",
};

export default function LiveChatWidget() {
  const [open, setOpen] = useState(true);
  const [lines, setLines] = useState<ChatLine[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextId = useRef(1);
  const timers = useRef<number[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const { claim, justAwarded } = useSimReward("sim-livechat", XP);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [lines, typing, open]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setLines((previous) => [...previous, { id: nextId.current++, from: "visitor", text }]);
    setDraft("");
    setSending(true);
    setError(null);

    const response = await postJson<LiveChatResult>("/api/crm/simulate", {
      channel: "livechat",
      message: text,
      visitorName: "Pengunjung",
    });
    setSending(false);

    if (!response.ok || !response.data) {
      setError(response.error ?? "Pesan gagal dikirim.");
      return;
    }

    claim();
    const { reply, typingDelayMs } = response.data.simulation;
    setTyping(true);
    timers.current.push(
      window.setTimeout(() => {
        setTyping(false);
        setLines((previous) => [...previous, { id: nextId.current++, from: "agent", text: reply }]);
      }, Math.min(Math.max(typingDelayMs, 300), 3000))
    );
  };

  return (
    <div className="space-y-4">
      {/* Situs tiruan tempat widget menempel */}
      <div className="neu-inset relative h-[30rem] overflow-hidden" aria-label="Contoh situs dengan widget live chat">
        <div className="space-y-4 p-6" aria-hidden="true">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-neon-red/70" />
            <span className="h-3 w-3 rounded-full bg-neon-gold/70" />
            <span className="h-3 w-3 rounded-full bg-neon-lime/70" />
            <span className="ml-3 h-6 flex-1 rounded-full bg-white/5" />
          </div>
          <div className="h-8 w-2/3 rounded-lg bg-white/10" />
          <div className="h-3 w-full rounded bg-white/5" />
          <div className="h-3 w-5/6 rounded bg-white/5" />
          <div className="h-3 w-4/6 rounded bg-white/5" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="h-24 rounded-xl bg-white/5" />
            <div className="h-24 rounded-xl bg-white/5" />
            <div className="h-24 rounded-xl bg-white/5" />
          </div>
        </div>

        {/* Widget */}
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3">
          <AnimatePresence>
            {open && (
              <motion.section
                key="panel"
                aria-label="Obrolan langsung"
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                style={{ transformOrigin: "bottom right" }}
                className="flex h-80 w-72 max-w-[calc(100vw-5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-void-800 shadow-neu"
              >
                <div className="flex items-center gap-3 bg-arcane-gradient px-4 py-3 text-white">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/25 text-xs font-bold">D</span>
                  <div>
                    <p className="text-sm font-semibold">Dimas · Support</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-lime" /> online
                    </p>
                  </div>
                </div>

                <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
                  {lines.map((line) => (
                    <div
                      key={line.id}
                      className={cn("flex", line.from === "visitor" ? "justify-end" : "justify-start")}
                    >
                      <p
                        className={cn(
                          "max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm",
                          line.from === "visitor"
                            ? "rounded-br-sm bg-arcane-600 text-white"
                            : "rounded-bl-sm bg-void-700 text-slate-100"
                        )}
                      >
                        {line.text}
                      </p>
                    </div>
                  ))}

                  {typing && (
                    <div className="flex items-center gap-1 pl-1" aria-label="Dimas sedang mengetik">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-2 w-2 animate-pulse-glow rounded-full bg-slate-400"
                          style={{ animationDelay: `${dot * 0.2}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/10 p-2.5">
                  <input
                    type="text"
                    value={draft}
                    maxLength={500}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Tulis pesan..."
                    aria-label="Isi pesan live chat"
                    className="min-w-0 flex-1 rounded-full bg-void-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-arcane-400/60"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    aria-label="Kirim pesan"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-arcane-600 text-white transition active:scale-95 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </motion.section>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Tutup obrolan" : "Buka obrolan"}
            className="relative grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(180deg,#a67bff_0%,#7c3aed_100%)] text-white shadow-[0_5px_0_0_#3b1d8f,0_10px_16px_rgba(0,0,0,0.5)] transition-all hover:brightness-110 active:translate-y-1 active:shadow-[0_1px_0_0_#3b1d8f]"
          >
            {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-slate-400">
          Tekan gelembung di pojok kanan bawah untuk membuka atau menutup obrolan.
        </p>
        <XpPop show={justAwarded} xp={XP} />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-neon-red/10 px-4 py-3 text-sm text-neon-red ring-1 ring-neon-red/40">
          {error}
        </p>
      )}
    </div>
  );
}