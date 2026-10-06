import type { Language } from "@/types";

export type IntegrationId =
  | "midtrans"
  | "xendit"
  | "stripe"
  | "whatsapp"
  | "mailchimp"
  | "livechat";

export type IntegrationCategory = "payment" | "omnichannel";

export interface IntegrationMeta {
  id: IntegrationId;
  name: string;
  category: IntegrationCategory;
  tagline: string;
  docsUrl: string;
}

export interface IntegrationSnippet {
  id: string;
  integration: IntegrationId;
  title: string;
  description: string;
  language: Language;
  filename: string;
  code: string;
  notes: string[];
}

export const INTEGRATIONS: IntegrationMeta[] = [
  {
    id: "midtrans",
    name: "Midtrans",
    category: "payment",
    tagline: "Gerbang pembayaran lokal: kartu, e-wallet, transfer bank, dan QRIS.",
    docsUrl: "https://docs.midtrans.com",
  },
  {
    id: "xendit",
    name: "Xendit",
    category: "payment",
    tagline: "Invoice dan pembayaran untuk bisnis di Asia Tenggara.",
    docsUrl: "https://docs.xendit.co",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "payment",
    tagline: "Standar global pembayaran online dengan Checkout siap pakai.",
    docsUrl: "https://docs.stripe.com",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "omnichannel",
    tagline: "Kirim pesan ke pelanggan lewat WhatsApp Cloud API.",
    docsUrl: "https://developers.facebook.com/docs/whatsapp",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "omnichannel",
    tagline: "Otomatisasi email: tambah pelanggan dan picu alur kampanye.",
    docsUrl: "https://mailchimp.com/developer",
  },
  {
    id: "livechat",
    name: "Live Chat",
    category: "omnichannel",
    tagline: "Widget obrolan langsung untuk melayani pengunjung situsmu.",
    docsUrl: "https://developer.mozilla.org/docs/Web/API/Fetch_API",
  },
];

export const SNIPPETS: IntegrationSnippet[] = [
  {
    id: "midtrans-snap",
    integration: "midtrans",
    title: "Midtrans Snap: bayar dengan popup",
    description: "Server membuat token transaksi, lalu browser membuka popup pembayaran Midtrans.",
    language: "nextjs",
    filename: "app/api/midtrans/route.ts",
    code: [
      '// 1) SERVER: app/api/midtrans/route.ts',
      'import midtransClient from "midtrans-client";',
      "",
      "const snap = new midtransClient.Snap({",
      "  isProduction: false, // ubah ke true hanya saat sudah live",
      "  serverKey: process.env.MIDTRANS_SERVER_KEY,",
      "  clientKey: process.env.MIDTRANS_CLIENT_KEY,",
      "});",
      "",
      "export async function POST(request: Request) {",
      "  const { amount, name, email } = await request.json();",
      "",
      "  const transaction = await snap.createTransaction({",
      '    transaction_details: { order_id: "ORDER-" + Date.now(), gross_amount: amount },',
      "    customer_details: { first_name: name, email },",
      "  });",
      "",
      "  return Response.json({ token: transaction.token });",
      "}",
      "",
      "// 2) BROWSER: panggil popup setelah mendapat token",
      '// <script src="https://app.sandbox.midtrans.com/snap/snap.js"',
      '//         data-client-key="ISI_CLIENT_KEY_SANDBOX"></script>',
      'const res = await fetch("/api/midtrans", {',
      '  method: "POST",',
      '  headers: { "Content-Type": "application/json" },',
      '  body: JSON.stringify({ amount: 149000, name: "Budi", email: "budi@contoh.com" }),',
      "});",
      "const { token } = await res.json();",
      "",
      "window.snap.pay(token, {",
      '  onSuccess: () => console.log("Pembayaran berhasil"),',
      '  onPending: () => console.log("Menunggu pembayaran"),',
      '  onError: () => console.log("Pembayaran gagal"),',
      '  onClose: () => console.log("Popup ditutup"),',
      "});",
    ].join("\n"),
    notes: [
      "Server Key bersifat rahasia. Simpan di environment variable, jangan di kode browser.",
      "Mulai dari akun Sandbox Midtrans. Kartu uji tersedia di dokumentasi resmi.",
      "Status pembayaran yang final harus diverifikasi lewat notifikasi webhook, bukan callback browser.",
      "Paket npm: npm install midtrans-client",
    ],
  },
  {
    id: "xendit-invoice",
    integration: "xendit",
    title: "Xendit Invoice: tautan pembayaran",
    description: "Server membuat invoice lewat REST API, lalu pelanggan diarahkan ke halaman bayar Xendit.",
    language: "nextjs",
    filename: "app/api/xendit/route.ts",
    code: [
      "export async function POST(request: Request) {",
      "  const { amount, email } = await request.json();",
      "",
      "  // Xendit memakai Basic Auth: secret key sebagai username, password kosong",
      '  const auth = Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64");',
      "",
      '  const res = await fetch("https://api.xendit.co/v2/invoices", {',
      '    method: "POST",',
      "    headers: {",
      '      Authorization: "Basic " + auth,',
      '      "Content-Type": "application/json",',
      "    },",
      "    body: JSON.stringify({",
      '      external_id: "INV-" + Date.now(),',
      "      amount,",
      "      payer_email: email,",
      '      description: "Paket Belajar Pro",',
      "    }),",
      "  });",
      "",
      "  const invoice = await res.json();",
      "  // Arahkan pelanggan ke invoice.invoice_url",
      "  return Response.json({ url: invoice.invoice_url });",
      "}",
    ].join("\n"),
    notes: [
      "Gunakan secret key mode Test saat belajar.",
      "Daftarkan URL webhook di dashboard Xendit untuk menerima status pembayaran yang final.",
      "Tidak butuh paket tambahan karena memakai fetch bawaan.",
    ],
  },
  {
    id: "stripe-checkout",
    integration: "stripe",
    title: "Stripe Checkout: halaman bayar siap pakai",
    description: "Server membuat sesi Checkout, lalu pelanggan dialihkan ke halaman pembayaran milik Stripe.",
    language: "nextjs",
    filename: "app/api/stripe/route.ts",
    code: [
      'import Stripe from "stripe";',
      "",
      "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);",
      "",
      "export async function POST(request: Request) {",
      "  const origin = new URL(request.url).origin;",
      "",
      "  const session = await stripe.checkout.sessions.create({",
      '    mode: "payment",',
      "    line_items: [",
      "      {",
      "        price_data: {",
      '          currency: "usd",',
      '          product_data: { name: "Paket Belajar Pro" },',
      "          unit_amount: 2000, // satuan sen: 2000 = USD 20.00",
      "        },",
      "        quantity: 1,",
      "      },",
      "    ],",
      '    success_url: origin + "/sukses",',
      '    cancel_url: origin + "/batal",',
      "  });",
      "",
      "  return Response.json({ url: session.url });",
      "}",
    ].join("\n"),
    notes: [
      "Gunakan kunci yang diawali sk_test_ saat belajar. Kartu uji klasik: 4242 4242 4242 4242.",
      "Jumlah dikirim dalam satuan terkecil mata uang (sen untuk USD).",
      "Aktivasi pesanan sebaiknya lewat webhook checkout.session.completed.",
      "Paket npm: npm install stripe",
    ],
  },
  {
    id: "whatsapp-cloud",
    integration: "whatsapp",
    title: "WhatsApp Cloud API: kirim pesan",
    description: "Mengirim pesan teks ke pelanggan lewat Graph API milik Meta.",
    language: "javascript",
    filename: "lib/whatsapp.js",
    code: [
      "export async function kirimWhatsApp(to, text) {",
      '  const url = "https://graph.facebook.com/v21.0/" + process.env.WA_PHONE_NUMBER_ID + "/messages";',
      "",
      "  const res = await fetch(url, {",
      '    method: "POST",',
      "    headers: {",
      '      Authorization: "Bearer " + process.env.WA_ACCESS_TOKEN,',
      '      "Content-Type": "application/json",',
      "    },",
      "    body: JSON.stringify({",
      '      messaging_product: "whatsapp",',
      "      to, // format internasional tanpa +, contoh: 6281234567890",
      '      type: "text",',
      "      text: { body: text },",
      "    }),",
      "  });",
      "",
      "  return res.json();",
      "}",
      "",
      'kirimWhatsApp("6281234567890", "Halo! Misi barumu sudah menunggu.");',
    ].join("\n"),
    notes: [
      "Pesan teks bebas hanya bisa dikirim dalam 24 jam setelah pelanggan membalas. Di luar itu wajib memakai template pesan yang disetujui Meta.",
      "Nomor dan token didapat dari WhatsApp Business Platform di Meta for Developers.",
      "Versi Graph API berganti berkala. Cek dokumentasi untuk versi terbaru.",
    ],
  },
  {
    id: "mailchimp-subscribe",
    integration: "mailchimp",
    title: "Mailchimp: tambah pelanggan dan picu otomatisasi",
    description: "Menambahkan pelanggan ke audiens dengan tag. Tag itu bisa memicu alur email otomatis.",
    language: "javascript",
    filename: "lib/mailchimp.js",
    code: [
      "export async function tambahPelanggan(email) {",
      "  const apiKey = process.env.MAILCHIMP_API_KEY;",
      '  // Kunci API berakhiran -us21 dan sejenisnya: bagian itu adalah datacenter',
      '  const dc = apiKey.split("-")[1];',
      '  const auth = Buffer.from("anystring:" + apiKey).toString("base64");',
      "",
      '  const url = "https://" + dc + ".api.mailchimp.com/3.0/lists/" + process.env.MAILCHIMP_LIST_ID + "/members";',
      "",
      "  const res = await fetch(url, {",
      '    method: "POST",',
      "    headers: {",
      '      Authorization: "Basic " + auth,',
      '      "Content-Type": "application/json",',
      "    },",
      "    body: JSON.stringify({",
      "      email_address: email,",
      '      status: "subscribed",',
      '      tags: ["new-learner"], // pemicu untuk alur Welcome Series',
      "    }),",
      "  });",
      "",
      "  return res.json();",
      "}",
    ].join("\n"),
    notes: [
      "Buat alur otomatis di dashboard Mailchimp dengan pemicu tag new-learner.",
      "Pelanggan baru wajib memberi persetujuan menerima email. Patuhi aturan anti-spam.",
      "Bila email sudah terdaftar, API mengembalikan error. Gunakan endpoint PUT untuk memperbarui.",
    ],
  },
  {
    id: "livechat-widget",
    integration: "livechat",
    title: "Widget Live Chat sederhana",
    description: "Gelembung obrolan yang bisa ditempel di situs mana pun dan mengirim pesan ke API-mu.",
    language: "html",
    filename: "chat-widget.html",
    code: [
      '<button id="chat-toggle" aria-label="Buka obrolan">Chat</button>',
      '<div id="chat-box" hidden>',
      '  <div id="chat-log"></div>',
      '  <input id="chat-input" type="text" placeholder="Tulis pesan..." />',
      "</div>",
      "",
      "<script>",
      '  const toggle = document.getElementById("chat-toggle");',
      '  const box = document.getElementById("chat-box");',
      '  const log = document.getElementById("chat-log");',
      '  const input = document.getElementById("chat-input");',
      "",
      '  toggle.addEventListener("click", () => {',
      "    box.hidden = !box.hidden;",
      "  });",
      "",
      "  function tambahPesan(teks, dari) {",
      '    const baris = document.createElement("div");',
      "    baris.className = dari;",
      "    baris.textContent = teks; // textContent aman dari injeksi HTML",
      "    log.appendChild(baris);",
      "  }",
      "",
      '  input.addEventListener("keydown", async (event) => {',
      '    if (event.key !== "Enter" || !input.value.trim()) return;',
      "",
      "    const pesan = input.value.trim();",
      '    tambahPesan(pesan, "saya");',
      '    input.value = "";',
      "",
      '    const res = await fetch("/api/crm/simulate", {',
      '      method: "POST",',
      '      headers: { "Content-Type": "application/json" },',
      '      body: JSON.stringify({ channel: "livechat", message: pesan }),',
      "    });",
      "    const json = await res.json();",
      '    if (json.ok) tambahPesan(json.data.simulation.reply, "agen");',
      "  });",
      "</script>",
    ].join("\n"),
    notes: [
      "Selalu pakai textContent, bukan innerHTML, untuk menampilkan pesan pengguna.",
      "Untuk obrolan sungguhan, ganti endpoint dengan layanan seperti Crisp, Tawk.to, atau server WebSocket sendiri.",
      "Tambahkan CSS agar tampil sebagai gelembung melayang di pojok layar.",
    ],
  },
];

export function getIntegration(id: IntegrationId): IntegrationMeta | undefined {
  return INTEGRATIONS.find((item) => item.id === id);
}

export function getIntegrationsByCategory(category: IntegrationCategory): IntegrationMeta[] {
  return INTEGRATIONS.filter((item) => item.category === category);
}

export function getSnippetsFor(integration: IntegrationId): IntegrationSnippet[] {
  return SNIPPETS.filter((snippet) => snippet.integration === integration);
}