"use client";

import { useState } from "react";

import CodeSnippetBlock from "@/components/integrations/CodeSnippetBlock";
import CreditCardSim from "@/components/integrations/CreditCardSim";
import IntegrationTabs, { type TabItem } from "@/components/integrations/IntegrationTabs";
import { XpPop, useSimReward } from "@/components/integrations/SimReward";
import { getIntegration, getSnippetsFor } from "@/lib/data/snippets";
import type { PaymentProvider } from "@/types";

const PROVIDERS: readonly PaymentProvider[] = ["midtrans", "xendit", "stripe"];

const TABS: TabItem<PaymentProvider>[] = PROVIDERS.map((id) => ({
  id,
  label: getIntegration(id)?.name ?? id,
}));

const SUCCESS_XP = 30;
const FAILURE_XP = 20;

export default function PaymentLab() {
  const [provider, setProvider] = useState<PaymentProvider>("midtrans");
  const success = useSimReward("sim-payment-success", SUCCESS_XP);
  const failure = useSimReward("sim-payment-failure", FAILURE_XP);

  const meta = getIntegration(provider);
  const snippets = getSnippetsFor(provider);

  const handleResult = (outcome: "success" | "failed") => {
    if (outcome === "success") success.claim();
    else failure.claim();
  };

  return (
    <div className="space-y-8">
      <IntegrationTabs
        items={TABS}
        value={provider}
        onChange={setProvider}
        label="Pilih payment gateway"
      />

      <div role="tabpanel" className="space-y-8">
        <section className="neu-card space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Simulasi {meta?.name}</h2>
              <p className="mt-1 max-w-xl text-sm text-slate-400">{meta?.tagline}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <XpPop show={success.justAwarded} xp={SUCCESS_XP} />
              <XpPop show={failure.justAwarded} xp={FAILURE_XP} />
            </div>
          </div>

          {/* key mengatur ulang simulasi saat berganti penyedia */}
          <CreditCardSim key={provider} provider={provider} onResult={handleResult} />
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