import { fail, ok, readJson, sleep } from "@/lib/api";
import { DEMO_USER_ID, repository } from "@/lib/mock-db";
import {
  PAYMENT_CURRENCY,
  PAYMENT_SCENARIOS,
  type PaymentRecord,
  type PaymentScenario,
} from "@/lib/mock-db/schema";
import type { PaymentProvider } from "@/types";

export const dynamic = "force-dynamic";

const PROVIDERS: readonly PaymentProvider[] = ["midtrans", "xendit", "stripe"];

function isProvider(value: unknown): value is PaymentProvider {
  return typeof value === "string" && (PROVIDERS as readonly string[]).includes(value);
}

function isScenario(value: unknown): value is PaymentScenario {
  return typeof value === "string" && value in PAYMENT_SCENARIOS;
}

/** Mengembalikan pesan error bila jumlah tidak valid, atau null bila valid. */
function validateAmount(provider: PaymentProvider, amount: unknown): string | null {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "Field amount wajib berupa angka.";
  }
  if (PAYMENT_CURRENCY[provider] === "IDR") {
    if (!Number.isInteger(amount) || amount < 1000 || amount > 100_000_000) {
      return "Jumlah IDR harus bilangan bulat antara 1.000 dan 100.000.000.";
    }
  } else if (amount < 1 || amount > 10_000 || Math.round(amount * 100) !== amount * 100) {
    return "Jumlah USD harus antara 1 dan 10.000 dengan maksimal 2 angka desimal.";
  }
  return null;
}

function makeReference(provider: PaymentProvider): string {
  const token = globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  if (provider === "midtrans") return "ORDER-" + token.toUpperCase();
  if (provider === "xendit") return "inv-" + token;
  return "pi_" + token;
}

/**
 * Respons tiruan yang meniru gaya tiap penyedia, agar pemula terbiasa
 * membaca bentuk data aslinya. Status disederhanakan untuk keperluan belajar.
 */
function buildProviderResponse(payment: PaymentRecord): Record<string, unknown> {
  const success = payment.status === "success";

  switch (payment.provider) {
    case "midtrans":
      return {
        status_code: success ? "200" : "202",
        status_message: success ? "Success, transaction is found" : payment.failureMessage,
        order_id: payment.reference,
        gross_amount: payment.amount.toFixed(2),
        payment_type: "credit_card",
        transaction_status: success ? "settlement" : "deny",
      };
    case "xendit":
      return {
        id: payment.id,
        reference_id: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: success ? "CAPTURED" : "FAILED",
        failure_reason: success ? null : (payment.failureCode ?? "").toUpperCase(),
      };
    case "stripe":
      return {
        id: payment.reference,
        object: "payment_intent",
        amount: Math.round(payment.amount * 100),
        currency: payment.currency.toLowerCase(),
        status: success ? "succeeded" : "requires_payment_method",
        last_payment_error: success
          ? null
          : { code: "card_declined", decline_code: payment.failureCode, message: payment.failureMessage },
      };
  }
}

/** GET /api/payments/simulate: riwayat simulasi terbaru. */
export async function GET() {
  const payments = await repository.listPayments(DEMO_USER_ID, 10);
  return ok({ payments });
}

/**
 * POST /api/payments/simulate
 * body: { provider: "midtrans" | "xendit" | "stripe", amount: number, scenario: string }
 *
 * Sengaja TIDAK menerima nomor kartu. Hasil ditentukan oleh `scenario`,
 * jadi tidak ada data kartu yang pernah lewat atau tersimpan.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("Body harus berupa objek JSON.");

  const { provider, amount, scenario } = body;
  if (!isProvider(provider)) return fail("Provider harus midtrans, xendit, atau stripe.");
  if (!isScenario(scenario)) return fail("Scenario tidak dikenal.");

  const amountError = validateAmount(provider, amount);
  if (amountError) return fail(amountError);

  // Jeda kecil agar animasi "memproses" di tampilan terasa nyata
  await sleep(400 + Math.floor(Math.random() * 400));

  const info = PAYMENT_SCENARIOS[scenario];
  const payment = await repository.createPayment({
    userId: DEMO_USER_ID,
    provider,
    amount: amount as number,
    currency: PAYMENT_CURRENCY[provider],
    scenario,
    status: info.status,
    failureCode: info.code,
    failureMessage: info.message,
    reference: makeReference(provider),
  });

  return ok({ payment, providerResponse: buildProviderResponse(payment) }, 201);
}