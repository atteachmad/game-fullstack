import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, ExternalLink, Mail, MessageCircle, Plug, Wallet, Zap } from "lucide-react";

import Icon3D, { type Icon3DTone } from "@/components/ui/Icon3D";
import { INTEGRATIONS, type IntegrationId } from "@/lib/data/snippets";

export const metadata: Metadata = {
  title: "Integrasi",
  description:
    "Pelajari payment gateway (Midtrans, Xendit, Stripe) dan omnichannel (WhatsApp, Mailchimp, Live Chat) lewat simulasi interaktif dan kode siap pakai.",
};

const VISUAL: Record<IntegrationId, { icon: typeof Plug; tone: Icon3DTone }> = {
  midtrans: { icon: CreditCard, tone: "cyan" },
  xendit: { icon: Wallet, tone: "arcane" },
  stripe: { icon: Zap, tone: "pink" },
  whatsapp: { icon: MessageCircle, tone: "lime" },
  mailchimp: { icon: Mail, tone: "gold" },
  livechat: { icon: MessageCircle, tone: "cyan" },
};

const HUBS = [
  {
    href: "/integrations/payments",
    title: "Payment Gateway",
    description:
      "Kartu kredit 3D yang membalik saat pembayaran berhasil atau gagal, lengkap dengan respons API gaya Midtrans, Xendit, dan Stripe.",
    icon: CreditCard,
    tone: "cyan" as Icon3DTone,
  },
  {
    href: "/integrations/omnichannel",
    title: "Omnichannel dan CRM",
    description:
      "Kirim pesan WhatsApp tiruan, picu otomatisasi email Mailchimp, dan coba widget Live Chat di situs contoh.",
    icon: MessageCircle,
    tone: "lime" as Icon3DTone,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-12">
      <header className="flex items-center gap-5">
        <Icon3D icon={Plug} tone="gold" size="lg" floating />
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">
            Modul <span className="text-gradient">Integrasi</span>
          </h1>
          <p className="mt-1 text-slate-400">
            Hubungkan aplikasimu dengan dunia nyata: bayar, kirim pesan, dan layani pelanggan.
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2" aria-label="Pilih modul">
        {HUBS.map((hub) => (
          <Link
            key={hub.href}
            href={hub.href}
            className="neu-card group flex flex-col gap-4 p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <Icon3D icon={hub.icon} tone={hub.tone} size="lg" />
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold">{hub.title}</h2>
              <p className="text-sm leading-relaxed text-slate-400">{hub.description}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-arcane-300">
              Buka modul
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <section className="space-y-6" aria-labelledby="catalog-heading">
        <h2 id="catalog-heading" className="text-2xl font-black">
          Layanan yang <span className="text-gradient-gold">dibahas</span>
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((item) => {
            const visual = VISUAL[item.id];
            return (
              <li key={item.id} className="neu-card flex flex-col gap-3 p-5">
                <Icon3D icon={visual.icon} tone={visual.tone} size="sm" />
                <h3 className="font-display font-bold">{item.name}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.tagline}</p>
                <a
                  href={item.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 text-xs text-arcane-300 underline-offset-2 hover:underline"
                >
                  Dokumentasi resmi
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}