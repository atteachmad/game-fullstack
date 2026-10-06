import type { PaymentProvider } from "@/types";

/* ============================================================
 * Skema database tiruan.
 * Bentuknya sengaja mirip tabel SQL, sehingga mudah dipindah ke
 * Prisma, Drizzle, Supabase, atau database apa pun.
 * ============================================================ */

export type PaymentStatus = "success" | "failed";
export type PaymentCurrency = "IDR" | "USD";

export type PaymentScenario =
  | "success"
  | "declined"
  | "insufficient_funds"
  | "expired_card";

export type CrmChannel = "whatsapp" | "mailchimp" | "livechat";

export interface UserRecord {
  id: string;
  displayName: string;
  xp: number;
  completedMissionIds: string[];
  unlockedBadgeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  provider: PaymentProvider;
  amount: number;
  currency: PaymentCurrency;
  scenario: PaymentScenario;
  status: PaymentStatus;
  failureCode?: string;
  failureMessage?: string;
  /** Nomor referensi gaya penyedia, mis. ORDER-xxxx atau pi_xxxx. */
  reference: string;
  createdAt: string;
}

export interface CrmEventRecord {
  id: string;
  userId: string;
  channel: CrmChannel;
  action: string;
  /** Tujuan yang sudah disamarkan (nomor telepon atau email). */
  target: string;
  payload: Record<string, string>;
  status: "delivered" | "queued";
  createdAt: string;
}

export interface Database {
  users: UserRecord[];
  payments: PaymentRecord[];
  crmEvents: CrmEventRecord[];
}

/**
 * Kontrak akses data. Seluruh route hanya bicara lewat antarmuka ini,
 * jadi untuk pindah ke database asli cukup menulis satu implementasi baru.
 * Semua method async agar cocok dengan database sungguhan.
 */
export interface Repository {
  getUser(id: string): Promise<UserRecord | null>;
  updateUser(
    id: string,
    patch: Partial<Omit<UserRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<UserRecord | null>;
  resetUser(id: string): Promise<UserRecord | null>;

  listPayments(userId: string, limit?: number): Promise<PaymentRecord[]>;
  createPayment(input: Omit<PaymentRecord, "id" | "createdAt">): Promise<PaymentRecord>;

  listCrmEvents(userId: string, channel?: CrmChannel, limit?: number): Promise<CrmEventRecord[]>;
  createCrmEvent(input: Omit<CrmEventRecord, "id" | "createdAt">): Promise<CrmEventRecord>;
}

/* ============================================================
 * Skenario simulasi pembayaran (dipakai API dan tampilan 7B)
 * ============================================================ */

export interface ScenarioInfo {
  label: string;
  status: PaymentStatus;
  code?: string;
  message?: string;
}

export const PAYMENT_SCENARIOS: Record<PaymentScenario, ScenarioInfo> = {
  success: { label: "Pembayaran berhasil", status: "success" },
  declined: {
    label: "Kartu ditolak",
    status: "failed",
    code: "card_declined",
    message: "Kartu ditolak oleh bank penerbit.",
  },
  insufficient_funds: {
    label: "Saldo tidak cukup",
    status: "failed",
    code: "insufficient_funds",
    message: "Saldo kartu tidak mencukupi untuk transaksi ini.",
  },
  expired_card: {
    label: "Kartu kedaluwarsa",
    status: "failed",
    code: "expired_card",
    message: "Masa berlaku kartu sudah habis.",
  },
};

export const PAYMENT_CURRENCY: Record<PaymentProvider, PaymentCurrency> = {
  midtrans: "IDR",
  xendit: "IDR",
  stripe: "USD",
};