import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

import OmnichannelLab from "@/components/integrations/OmnichannelLab";
import Icon3D from "@/components/ui/Icon3D";

export const metadata: Metadata = {
  title: "Omnichannel dan CRM",
  description:
    "Simulasi WhatsApp Business API, otomatisasi email Mailchimp, dan widget Live Chat, lengkap dengan kode siap pakai.",
};

export default function OmnichannelPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Integrasi
        </Link>
        <div className="flex items-center gap-5">
          <Icon3D icon={MessageCircle} tone="lime" size="lg" floating />
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">
              Omnichannel <span className="text-gradient">dan CRM</span>
            </h1>
            <p className="mt-1 text-slate-400">
              Jangkau pelanggan lewat pesan, email, dan obrolan langsung.
            </p>
          </div>
        </div>
      </header>

      <OmnichannelLab />
    </div>
  );
}