import type { Badge } from "@/types";

export const BADGES: Badge[] = [
  {
    id: "first-step",
    name: "Langkah Pertama",
    description: "Menekan sakelar pertama dan memulai petualangan.",
    rarity: "common",
    emblem: "footprints",
  },
  {
    id: "html-hero",
    name: "Pahlawan HTML",
    description: "Menyelesaikan halaman web pertamamu.",
    rarity: "common",
    emblem: "shield",
  },
  {
    id: "form-scribe",
    name: "Juru Tulis Formulir",
    description: "Membangun formulir yang berubah menjadi papan klip 3D.",
    rarity: "rare",
    emblem: "clipboard",
  },
  {
    id: "switch-smith",
    name: "Pandai Besi Sakelar",
    description: "Menempa tombol CSS menjadi sakelar mekanis yang taktil.",
    rarity: "rare",
    emblem: "bolt",
  },
  {
    id: "css-stylist",
    name: "Penata Gaya",
    description: "Menguasai gradasi dan sudut membulat dengan CSS.",
    rarity: "rare",
    emblem: "gem",
  },
  {
    id: "js-sorcerer",
    name: "Penyihir JavaScript",
    description: "Menghidupkan halaman dengan logika dan interaksi.",
    rarity: "epic",
    emblem: "flame",
  },
  {
    id: "react-knight",
    name: "Ksatria React",
    description: "Menaklukkan komponen dan state di Kerajaan React.",
    rarity: "epic",
    emblem: "rocket",
  },
  {
    id: "full-stack-champion",
    name: "Juara Full-Stack",
    description: "Menyelesaikan seluruh perjalanan dari nol hingga Full-Stack.",
    rarity: "legendary",
    emblem: "crown",
  },
];

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === id);
}