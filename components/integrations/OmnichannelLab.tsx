"use client";

import { useState } from "react";

import CodeSnippetBlock from "@/components/integrations/CodeSnippetBlock";
import IntegrationTabs, { type TabItem } from "@/components/integrations/IntegrationTabs";
import LiveChatWidget from "@/components/integrations/LiveChatWidget";
import MailchimpSim from "@/components/integrations/MailchimpSim";
import WhatsAppSim from "@/components/integrations/WhatsAppSim";
import { getIntegration, getSnippetsFor } from "@/lib/data/snippets";

type Channel = "whatsapp" | "mailchimp" | "livechat";

const TABS: TabItem<Channel>[] = [
  { id: "whatsapp", label: "WhatsApp Business" },
  { id: "mailchimp", label: "Mailchimp" },
  { id: "livechat", label: "Live Chat" },
];

export default function OmnichannelLab() {
  const [channel, setChannel] = useState<Channel>("whatsapp");

  const meta = getIntegration(channel);
  const snippets = getSnippetsFor(channel);

  return (
    <div className="space-y-8">
      <IntegrationTabs
        items={TABS}
        value={channel}
        onChange={setChannel}
        label="Pilih kanal komunikasi"
      />

      <div role="tabpanel" className="space-y-8">
        <section className="neu-card space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="font-display text-xl font-bold">Simulasi {meta?.name}</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-400">{meta?.tagline}</p>
          </div>

          {channel === "whatsapp" && <WhatsAppSim />}
          {channel === "mailchimp" && <MailchimpSim />}
          {channel === "livechat" && <LiveChatWidget />}
        </section>

        <section className="space-y-5" aria-label={`Kode siap pakai ${meta?.name}`}>
          <h2 className="font-display text-xl font-bold">
            Kode siap pakai <span className="text-gradient">{meta?.name}</span>
          </h2>
          {snippets.map((snippet) => (
            <CodeSnippetBlock key={snippet.id} snippet={snippet} />
          ))}
        </section>
      </div>
    </div>
  );
}