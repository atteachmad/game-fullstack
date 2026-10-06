import { asString, fail, ok, readJson, sleep } from "@/lib/api";
import { DEMO_USER_ID, repository } from "@/lib/mock-db";
import type { CrmChannel } from "@/lib/mock-db/schema";

export const dynamic = "force-dynamic";

const CHANNELS: readonly CrmChannel[] = ["whatsapp", "mailchimp", "livechat"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?\d{8,15}$/;

const MAILCHIMP_AUTOMATIONS = {
  welcome: {
    name: "Welcome Series",
    steps: ["Email sambutan (segera)", "Tips belajar (hari ke-2)", "Ajakan misi pertama (hari ke-4)"],
  },
  cart_abandoned: {
    name: "Pengingat Keranjang",
    steps: ["Pengingat lembut (1 jam)", "Kode diskon (24 jam)"],
  },
  course_completed: {
    name: "Selamat Lulus",
    steps: ["Sertifikat digital (segera)", "Rekomendasi kursus lanjutan (hari ke-3)"],
  },
} as const;

type MailchimpTrigger = keyof typeof MAILCHIMP_AUTOMATIONS;

function isChannel(value: unknown): value is CrmChannel {
  return typeof value === "string" && (CHANNELS as readonly string[]).includes(value);
}

function isTrigger(value: unknown): value is MailchimpTrigger {
  return typeof value === "string" && value in MAILCHIMP_AUTOMATIONS;
}

function maskPhone(phone: string): string {
  return phone.slice(0, 4) + "*".repeat(Math.max(0, phone.length - 6)) + phone.slice(-2);
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  return name.slice(0, 1) + "***@" + domain;
}

/** Balasan otomatis sederhana berdasarkan kata kunci pesan. */
function pickReply(message: string, who: "bot" | "agent"): string {
  const text = message.toLowerCase();
  const prefix = who === "agent" ? "Halo, Dimas dari tim support di sini. " : "";

  if (/harga|biaya|bayar|paket/.test(text)) {
    return prefix + "Paket Pro mulai dari Rp149.000 per bulan. Mau saya kirimkan detail lengkapnya?";
  }
  if (/halo|hai|pagi|siang|malam/.test(text)) {
    return prefix + "Selamat datang di CodeQuest! Ada yang bisa kami bantu untuk petualangan codingmu?";
  }
  if (/error|gagal|bug|masalah/.test(text)) {
    return prefix + "Maaf atas kendalanya. Boleh ceritakan langkah yang kamu lakukan sebelum error muncul?";
  }
  return prefix + "Terima kasih atas pesanmu. Tim kami akan menjawab secepatnya.";
}

async function record(
  channel: CrmChannel,
  action: string,
  target: string,
  payload: Record<string, string>
) {
  return repository.createCrmEvent({
    userId: DEMO_USER_ID,
    channel,
    action,
    target,
    payload,
    status: "delivered",
  });
}

/** GET /api/crm/simulate?channel=whatsapp  riwayat simulasi terbaru. */
export async function GET(request: Request) {
  const channel = new URL(request.url).searchParams.get("channel");
  if (channel && !isChannel(channel)) return fail("Parameter channel tidak dikenal.");

  const events = await repository.listCrmEvents(DEMO_USER_ID, channel ?? undefined, 10);
  return ok({ events });
}

/**
 * POST /api/crm/simulate
 * whatsapp: { channel, to, message }
 * mailchimp: { channel, email, trigger: "welcome" | "cart_abandoned" | "course_completed" }
 * livechat: { channel, message, visitorName? }
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("Body harus berupa objek JSON.");
  if (!isChannel(body.channel)) return fail("Channel harus whatsapp, mailchimp, atau livechat.");

  await sleep(300 + Math.floor(Math.random() * 300));

  switch (body.channel) {
    case "whatsapp": {
      const rawPhone = typeof body.to === "string" ? body.to.replace(/[\s-]/g, "") : "";
      const message = asString(body.message, 1, 500);
      if (!PHONE_PATTERN.test(rawPhone)) return fail("Nomor tujuan harus 8 sampai 15 digit, boleh diawali +.");
      if (!message) return fail("Pesan wajib diisi, maksimal 500 karakter.");

      const messageId = "wamid." + globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
      const event = await record("whatsapp", "message_sent", maskPhone(rawPhone), { messageId, message });

      return ok(
        {
          event,
          simulation: {
            messaging_product: "whatsapp",
            messages: [{ id: messageId }],
            deliveryStatus: ["sent", "delivered", "read"],
            autoReply: pickReply(message, "bot"),
          },
        },
        201
      );
    }

    case "mailchimp": {
      const email = asString(body.email, 3, 120);
      if (!email || !EMAIL_PATTERN.test(email)) return fail("Alamat email tidak valid.");
      if (!isTrigger(body.trigger)) return fail("Trigger harus welcome, cart_abandoned, atau course_completed.");

      const automation = MAILCHIMP_AUTOMATIONS[body.trigger];
      const event = await record("mailchimp", "automation_triggered", maskEmail(email), {
        trigger: body.trigger,
        automation: automation.name,
      });

      return ok(
        {
          event,
          simulation: {
            status: "subscribed",
            automation: automation.name,
            scheduledSteps: automation.steps,
          },
        },
        201
      );
    }

    case "livechat": {
      const message = asString(body.message, 1, 500);
      if (!message) return fail("Pesan wajib diisi, maksimal 500 karakter.");

      const visitorName = body.visitorName === undefined ? "Pengunjung" : asString(body.visitorName, 1, 40);
      if (!visitorName) return fail("Nama pengunjung maksimal 40 karakter.");

      const event = await record("livechat", "message_received", visitorName, { message });

      return ok(
        {
          event,
          simulation: {
            agent: "Dimas",
            reply: pickReply(message, "agent"),
            typingDelayMs: 900,
          },
        },
        201
      );
    }
  }
}