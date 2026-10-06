import type { Metadata } from "next";
import { User } from "lucide-react";

import ProfileDashboard from "@/components/gamification/ProfileDashboard";
import Icon3D from "@/components/ui/Icon3D";

export const metadata: Metadata = {
  title: "Profil",
  description: "Lihat level, XP, statistik misi, dan koleksi lencana 3D milikmu.",
};

export default function ProfilePage() {
  return (
    <div className="space-y-10">
      <header className="flex items-center gap-5">
        <Icon3D icon={User} tone="pink" size="lg" floating />
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">
            Profil <span className="text-gradient">Petualang</span>
          </h1>
          <p className="mt-1 text-slate-400">Pantau perjalananmu menuju Full-Stack Developer.</p>
        </div>
      </header>

      <ProfileDashboard />
    </div>
  );
}