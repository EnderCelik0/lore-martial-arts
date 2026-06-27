import type { Metadata } from "next";
import LanguageSelector from "@/components/public/LanguageSelector";

export const metadata: Metadata = {
  title: "Lore Martial Arts",
  description: "Brazilian Jiu-Jitsu",
};

// Statik sayfa — Supabase'e istek atmaz
export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <LanguageSelector />
    </main>
  );
}
