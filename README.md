# Panduan Struktur Folder Proyek

```text
... gamified-fullstack-platform/
├── app/
│   ├── api/
│   │   ├── progress/route.ts
│   │   ├── missions/route.ts
│   │   ├── badges/route.ts
│   │   ├── payments/simulate/route.ts
│   │   └── crm/simulate/route.ts
│   ├── world-map/page.tsx          # Peta RPG perjalanan belajar
│   ├── missions/[id]/page.tsx      # Halaman misi + editor + preview
│   ├── playground/page.tsx         # Wireframe & mockup
│   ├── integrations/
│   │   ├── page.tsx
│   │   ├── payments/page.tsx
│   │   └── omnichannel/page.tsx
│   ├── profile/page.tsx            # XP, level, badges
│   ├── layout.tsx
│   ├── page.tsx                    # Landing / dashboard
│   ├── not-found.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── AmbientBackground.tsx
│   ├── gamification/
│   │   ├── XPBar.tsx
│   │   ├── LevelUpOverlay.tsx
│   │   ├── BadgeCard3D.tsx
│   │   └── ParticleBurst.tsx
│   ├── map/
│   │   ├── WorldMap.tsx
│   │   └── MissionNode.tsx
│   ├── editor/
│   │   ├── CodeEditor.tsx
│   │   ├── SuggestionBox.tsx
│   │   ├── LivePreview.tsx
│   │   └── LanguageTabs.tsx
│   ├── three-d/
│   │   ├── MechanicalSwitch3D.tsx
│   │   ├── Clipboard3D.tsx
│   │   └── Scene.tsx
│   ├── playground/
│   │   ├── WireframeCanvas.tsx
│   │   └── ShapeToolbar.tsx
│   ├── integrations/
│   │   ├── CreditCardSim.tsx
│   │   ├── WhatsAppSim.tsx
│   │   ├── MailchimpSim.tsx
│   │   ├── LiveChatWidget.tsx
│   │   └── CodeSnippetBlock.tsx
│   └── ui/
│       ├── Button3D.tsx
│       ├── Card3D.tsx
│       └── Icon3D.tsx
├── lib/
│   ├── mock-db/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── seed.ts
│   ├── data/
│   │   ├── missions.ts
│   │   ├── badges.ts
│   │   ├── snippets.ts
│   │   └── suggestions.ts
│   ├── utils.ts
│   └── xp.ts
├── store/
│   └── useGameStore.ts             # Zustand: XP, level, badge
├── types/
│   └── index.ts
├── public/
│   └── favicon.ico
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json ...
```
# CodeQuest: Gamified Full-Stack Learning Platform

Platform belajar coding bergaya RPG, dari nol hingga Full-Stack Developer.
Selesaikan misi, kumpulkan XP, naik level, buka lencana, dan lihat kodemu
berubah menjadi objek 3D.

## Fitur

- **Peta dunia RPG** dengan zona, simpul misi 3D, dan sistem buka kunci berurutan.
- **XP, level, dan lencana** dengan animasi level-up dan ledakan partikel.
- **Editor kode** (CodeMirror) untuk HTML, CSS, JavaScript, PHP, React, Vue, Laravel, dan Next.js, dengan saran kode otomatis berbahasa Indonesia.
- **Live preview** dalam iframe sandbox untuk HTML, CSS, dan JavaScript.
- **Visual 3D dari kode:** CSS tombol menjadi sakelar mekanis, formulir HTML menjadi papan klip kertas.
- **Playground wireframe:** seret, ubah ukuran, template, dan ekspor ke kerangka HTML.
- **Modul integrasi:** simulasi Midtrans, Xendit, Stripe, WhatsApp Business, Mailchimp, dan Live Chat, lengkap dengan kode siap pakai.

## Teknologi

Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand,
CodeMirror, dan Lucide Icons.

## Menjalankan di Komputer

Butuh Node.js 18.18 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

Perintah lain:

```bash
npm run build   # build produksi (jalankan sebelum deploy)
npm run start   # menjalankan hasil build
npm run lint    # pemeriksaan kode
```

## Struktur Folder

| Folder | Isi |
| --- | --- |
| `app/` | Halaman dan API Routes (App Router) |
| `components/` | Komponen UI, gamifikasi, editor, 3D, playground, integrasi |
| `lib/data/` | Data misi, lencana, saran kode, snippet integrasi |
| `lib/mock-db/` | Database tiruan dan antarmuka `Repository` |
| `store/` | State XP, level, dan lencana (Zustand) |
| `types/` | Tipe TypeScript bersama |

## Menambah Misi Baru

Semua misi ada di `lib/data/missions.ts`. Tambahkan satu objek ke `MISSIONS`,
lalu daftarkan ID-nya di `missionIds` milik sebuah zona di `ZONES`.

```ts
{
  id: "html-link",
  title: "Tautan Pertamamu",
  description: "Buat tautan ke situs lain.",
  zoneId: "html-valley",
  language: "html",
  difficulty: "easy",
  xpReward: 50,
  visual: "none",
  starterCode: "<!-- tulis kodemu -->",
  hint: 'Gunakan <a href="https://contoh.com">teks</a>.',
  checks: [
    { type: "regex", value: "<a\\s+href=", message: "Tambahkan tautan dengan tag <a href>." },
  ],
}
```

Misi dibuka berurutan sesuai urutan zona, lalu urutan di dalam zona.

## Penyimpanan Data: Penting

Ada dua jenis penyimpanan, dan keduanya sementara:

1. **Progres pemain** (XP, misi, lencana) disimpan di `localStorage` browser
   lewat Zustand. Data hidup per perangkat dan per browser.
2. **Mock database server** (`lib/mock-db`) dipakai oleh API Routes. Di
   Vercel (serverless), memorinya tidak dibagi antar-instance dan hilang
   saat instance berhenti. Cukup untuk demo dan belajar.

Saat ini website belum memakai API progres. Keduanya berjalan terpisah.

## Pindah ke Database Asli

Seluruh API Routes hanya bicara lewat antarmuka `Repository` di
`lib/mock-db/schema.ts`. Langkah migrasi:

1. Pilih database (misalnya Postgres lewat Supabase atau Neon, dengan Prisma atau Drizzle).
2. Tulis objek baru yang memenuhi antarmuka `Repository` (semua method sudah `async`).
3. Ganti isi `export const repository` di `lib/mock-db/index.ts` dengan implementasi baru.
4. Tambahkan login (misalnya Auth.js atau Clerk) dan ganti `DEMO_USER_ID` dengan ID pengguna aktif.
5. Ubah store Zustand agar memanggil `/api/progress` saat misi selesai.
6. Simpan kunci rahasia di Environment Variables Vercel, bukan di kode.

## Keamanan

- Preview kode berjalan di iframe `sandbox="allow-scripts"` tanpa `allow-same-origin`.
- API pembayaran simulasi tidak pernah menerima nomor kartu.
- Semua input API divalidasi di server.
- Belum ada autentikasi dan pembatasan laju permintaan. Tambahkan keduanya sebelum dipakai pengguna sungguhan.

## Deploy ke Vercel

1. Push repositori ke GitHub.
2. Di vercel.com, pilih **Add New, Project**, lalu impor repositori.
3. Biarkan pengaturan bawaan (Framework: Next.js). Tidak ada environment variable yang wajib.
4. Klik **Deploy**.