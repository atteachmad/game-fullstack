import type { Mission, Zone } from "@/types";

export const ZONES: Zone[] = [
  {
    id: "html-valley",
    name: "Lembah HTML",
    description: "Tempat semua petualang memulai. Pelajari struktur halaman web.",
    order: 1,
    missionIds: ["html-first-page", "html-clipboard-form"],
  },
  {
    id: "css-mountain",
    name: "Gunung CSS",
    description: "Daki puncak gaya dan tempa tampilan yang memukau.",
    order: 2,
    missionIds: ["css-mechanical-switch", "css-gradient-card"],
  },
  {
    id: "js-temple",
    name: "Kuil JavaScript",
    description: "Hidupkan halamanmu dengan logika dan interaktivitas.",
    order: 3,
    missionIds: ["js-hello-quest", "js-click-counter"],
  },
];

export const MISSIONS: Mission[] = [
  /* ---------------- LEMBAH HTML ---------------- */
  {
    id: "html-first-page",
    title: "Halaman Pertamamu",
    description:
      "Setiap perjalanan dimulai dari satu langkah. Buat judul dan sebuah paragraf untuk halaman web pertamamu.",
    zoneId: "html-valley",
    language: "html",
    difficulty: "easy",
    xpReward: 50,
    badgeId: "html-hero",
    visual: "none",
    starterCode: `<!-- Misi: buat halaman pertamamu -->
<h1>Halo, Dunia!</h1>

<!-- Tambahkan sebuah paragraf <p> di bawah ini -->
`,
    hint: "Paragraf ditulis dengan tag <p>Isi paragraf</p>. Jangan lupa tag penutupnya.",
    checks: [
      {
        type: "includes",
        value: "<h1",
        message: "Tambahkan judul dengan tag <h1>.",
      },
      {
        type: "regex",
        value: "<p[\\s>]",
        message: "Tambahkan sebuah paragraf dengan tag <p>.",
      },
    ],
  },
  {
    id: "html-clipboard-form",
    title: "Papan Klip Pendaftaran",
    description:
      "Bangun formulir pendaftaran petualang. Setelah benar, formulirmu akan tampil sebagai papan klip kertas 3D.",
    zoneId: "html-valley",
    language: "html",
    difficulty: "medium",
    xpReward: 100,
    badgeId: "form-scribe",
    visual: "clipboard",
    starterCode: `<form>
  <label>Nama petualang</label>
  <input type="text" placeholder="Tulis namamu" />

  <!-- Tambahkan tombol untuk mengirim formulir -->
</form>
`,
    hint: 'Gunakan <button type="submit">Kirim</button> di dalam tag <form>.',
    checks: [
      {
        type: "includes",
        value: "<form",
        message: "Formulir harus dibungkus tag <form>.",
      },
      {
        type: "includes",
        value: "<input",
        message: "Tambahkan minimal satu kolom <input>.",
      },
      {
        type: "regex",
        value: "<button[\\s>]|type=[\"']submit[\"']",
        message: "Tambahkan tombol kirim dengan tag <button>.",
      },
    ],
  },

  /* ---------------- GUNUNG CSS ---------------- */
  {
    id: "css-mechanical-switch",
    title: "Tempa Sakelar Mekanis",
    description:
      "Ubah tombol datar menjadi sakelar yang tebal dan taktil. Beri bayangan padat di bawahnya, lalu turunkan saat ditekan.",
    zoneId: "css-mountain",
    language: "css",
    difficulty: "medium",
    xpReward: 120,
    badgeId: "switch-smith",
    visual: "switch",
    starterCode: `button {
  padding: 16px 32px;
  border: none;
  border-radius: 16px;
  color: white;
  background: #7c3aed;
  /* Tambahkan box-shadow agar tombol terlihat tebal */
}

button:active {
  /* Turunkan tombol saat ditekan dengan transform */
}
`,
    hint: "Coba box-shadow: 0 8px 0 #3b1d8f; lalu di :active gunakan transform: translateY(6px);",
    checks: [
      {
        type: "includes",
        value: "box-shadow",
        message: "Tambahkan properti box-shadow untuk memberi ketebalan.",
      },
      {
        type: "includes",
        value: "transform",
        message: "Tambahkan transform di :active agar tombol turun saat ditekan.",
      },
    ],
  },
  {
    id: "css-gradient-card",
    title: "Kartu Berkilau",
    description:
      "Percantik sebuah kartu dengan gradasi warna dan sudut yang membulat.",
    zoneId: "css-mountain",
    language: "css",
    difficulty: "easy",
    xpReward: 80,
    badgeId: "css-stylist",
    visual: "none",
    starterCode: `.card {
  padding: 24px;
  color: white;
  /* Tambahkan background gradasi dan sudut membulat */
}
`,
    hint: "Gunakan background: linear-gradient(135deg, #7c3aed, #22d3ee); dan border-radius: 20px;",
    checks: [
      {
        type: "regex",
        value: "linear-gradient\\s*\\(",
        message: "Gunakan linear-gradient() untuk membuat gradasi.",
      },
      {
        type: "includes",
        value: "border-radius",
        message: "Tambahkan border-radius untuk sudut membulat.",
      },
    ],
  },

  /* ---------------- KUIL JAVASCRIPT ---------------- */
  {
    id: "js-hello-quest",
    title: "Mantra Pertama",
    description:
      "Ucapkan mantra pertamamu: simpan nama dalam variabel dan tampilkan lewat console.",
    zoneId: "js-temple",
    language: "javascript",
    difficulty: "easy",
    xpReward: 60,
    visual: "none",
    starterCode: `const name = "Petualang";

// Tampilkan sapaan dengan console.log
`,
    hint: 'Tulis console.log("Halo, " + name);',
    checks: [
      {
        type: "regex",
        value: "(const|let)\\s+\\w+",
        message: "Deklarasikan variabel dengan const atau let.",
      },
      {
        type: "includes",
        value: "console.log",
        message: "Tampilkan pesan dengan console.log().",
      },
    ],
  },
  {
    id: "js-click-counter",
    title: "Penghitung Sihir",
    description:
      "Buat fungsi yang menambah hitungan setiap kali dipanggil, lalu tampilkan hasilnya.",
    zoneId: "js-temple",
    language: "javascript",
    difficulty: "medium",
    xpReward: 150,
    badgeId: "js-sorcerer",
    visual: "none",
    starterCode: `let count = 0;

function increment() {
  // Tambahkan 1 ke count lalu tampilkan hasilnya
}

increment();
`,
    hint: "Gunakan count++ untuk menambah 1, lalu console.log(count).",
    checks: [
      {
        type: "regex",
        value: "count\\s*(\\+\\+|\\+=\\s*1|=\\s*count\\s*\\+\\s*1)",
        message: "Tambahkan 1 ke count, misalnya dengan count++.",
      },
      {
        type: "regex",
        value: "console\\.log|textContent|innerText",
        message: "Tampilkan hasilnya dengan console.log atau textContent.",
      },
    ],
  },
];

/* ---------- Helper pencarian (siap diganti query database) ---------- */

export function getMissionById(id: string): Mission | undefined {
  return MISSIONS.find((mission) => mission.id === id);
}

export function getZoneById(id: string): Zone | undefined {
  return ZONES.find((zone) => zone.id === id);
}

export function getMissionsByZone(zoneId: string): Mission[] {
  return MISSIONS.filter((mission) => mission.zoneId === zoneId);
}

export const TOTAL_MISSIONS = MISSIONS.length;
export const TOTAL_MISSION_XP = MISSIONS.reduce((sum, m) => sum + m.xpReward, 0);