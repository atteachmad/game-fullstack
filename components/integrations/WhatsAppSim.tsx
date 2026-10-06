"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, CheckCheck, Clock, Send } from "lucide-react";

import { XpPop, useSimReward } from "@/components/integrations/SimReward";
import { postJson } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const XP = 30;

type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

interface ChatMessage {
  id: number;
  from: "me" | "them";
  text: string;
  status?: MessageStatus;
}

interface WhatsAppResult {
  simulation: {
    messaging_product: string;
    messages: { id: string }[];
    deliveryStatus: string[];
    autoReply: string;
  };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 0, from: "them", text: "Halo! Kirim pesan percobaan dan lihat centangnya berubah." },
];

function StatusIcon({ status }: { status: MessageStatus }) {
  const base = "h-3.5 w-3.5";
  switch (status) {
    case "sending":
      return <Clock className={cn(base, "text-white/60")} aria-label="Mengirim" />;
    case "sent":
      return <Check className={cn(base, "text-white/60")} aria-label="Terkirim" />;
    case "delivered":
      return <CheckCheck className={cn(base, "text-white/60")} aria-label="Diterima" />;
    case "read":
      return <CheckCheck className={cn(base, "text-sky-400")} aria-label="Dibaca" />;
    case "failed":
      return <AlertCircle className={cn(base, "text-neon-red")} aria-label="Gagal" />;
  }
}

export default function WhatsAppSim() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [phone, setPhone] = useState("+62 812 3456 7890");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextId = useRef(1);
  const timers = useRef<number[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const { claim, justAwarded } = useSimReward("sim-whatsapp", XP);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const schedule = (callback: () => void, ms: number) => {
    timers.current.push(window.setTimeout(callback, ms));
  };

  const setStatus = (id: number, status: MessageStatus) =>
    setMessages((previous) =>
      previous.map((message) => (message.id === id ? { ...message, status } : message))
    );

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    const id = nextId.current++;
    setMessages((previous) => [...previous, { id, from: "me", text, status: "sending" }]);
    setDraft("");
    setSending(true);
    setError(null);

    const response = await postJson<WhatsAppResult>("/api/crm/simulate", {
      channel: "whatsapp",
      to: phone,
      message: text,
    });
    setSending(false);

    if (!response.ok || !response.data) {
      setStatus(id, "failed");
      setError(response.error ?? "Pesan gagal dikirim.");
      return;
    }

    claim();
    const reply = response.data.simulation.autoReply;
    setStatus(id, "sent");
    schedule(() => setStatus(id, "delivered"), 700);
    schedule(() => setStatus(id, "read"), 1500);
    schedule(
      () =>
        setMessages((previous) => [
          ...previous,
          { id: nextId.current++, from: "them", text: reply },
        ]),
      2400
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
      {/* ---------- Ponsel ---------- */}
      <div className="scene-3d mx-auto w-full max-w-sm">
        <div
          className="overflow-hidden rounded-[2.5rem] border-[10px] border-void-700 bg-void-900 shadow-neu"
          style={{ transform: "rotateY(-6deg) rotateX(2deg)" }}
        >
          <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 font-display text-sm font-bold">
              CQ
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">CodeQuest Bot</p>
              <p className="text-[11px] text-white/70">{phone || "nomor tujuan"}</p>
            </div>
          </div>

          <div
            ref={listRef}
            className="h-80 space-y-2 overflow-y-auto bg-[#0b141a] p-3"
            aria-live="polite"
            aria-label="Percakapan WhatsApp"
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={cn("flex", message.from === "me" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm text-white shadow",
                    message.from === "me"
                      ? "rounded-br-sm bg-[#005c4b]"
                      : "rounded-bl-sm bg-[#202c33]"
                  )}
                >
                  <p className="break-words">{message.text}</p>
                  {message.status && (
                    <span className="mt-0.5 flex justify-end">
                      <StatusIcon status={message.status} />
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 bg-[#111b21] p-3">
            <input
              type="text"
              value={draft}
              maxLength={500}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ketik pesan..."
              aria-label="Isi pesan WhatsApp"
              className="min-w-0 flex-1 rounded-full bg-[#202c33] px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-[#25d366]/60"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label="Kirim pesan"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25d366] text-void-950 transition active:scale-95 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ---------- Panel penjelasan ---------- */}
      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="wa-phone" className="font-display text-sm font-bold">
            Nomor tujuan
          </label>
          <input
            id="wa-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="neu-inset w-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-arcane-400/60"
          />
          <p className="text-xs text-slate-500">
            Nomor ini hanya dikirim ke API simulasi dan disamarkan sebelum disimpan.
          </p>
        </div>

        <div className="neu-card space-y-3 p-5">
          <h3 className="font-display text-sm font-bold">Arti centang pesan</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-white/60" /> Terkirim ke server WhatsApp</li>
            <li className="flex items-center gap-2"><CheckCheck className="h-4 w-4 text-white/60" /> Sampai di perangkat penerima</li>
            <li className="flex items-center gap-2"><CheckCheck className="h-4 w-4 text-sky-400" /> Sudah dibaca</li>
          </ul>
          <p className="text-xs text-slate-500">
            Di API asli, perubahan status ini datang lewat webhook, bukan dari respons pengiriman.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-neon-red/10 px-4 py-3 text-sm text-neon-red ring-1 ring-neon-red/40">
            {error}
          </p>
        )}

        <XpPop show={justAwarded} xp={XP} />
      </div>
    </div>
  );
}