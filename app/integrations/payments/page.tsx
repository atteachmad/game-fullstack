import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

import PaymentLab from "@/components/integrations/PaymentLab";
import Icon3D from "@/components/ui/Icon3D";

export const metadata: Metadata = {
  title: "Payment Gateway",
  description:
    "Simulasi pembayaran Midtrans, Xendit, dan Stripe dengan kartu kredit 3D, plus kode siap pakai untuk Next.js.",
};

export default function PaymentsPage() {
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
          <Icon3D icon={CreditCard} tone="cyan" size="lg" floating />
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">
              Payment <span className="text-gradient">Gateway</span>
            </h1>
            <p className="mt-1 text-slate-400">
              Coba pembayaran berhasil dan gagal, lalu pelajari kode di baliknya.
            </p>
          </div>
        </div>
      </header>

      <PaymentLab />
    </div>
  );
}