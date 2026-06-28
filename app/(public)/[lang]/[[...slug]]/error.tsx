"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// İçerik sayfası hata sınırı — Supabase/veri hatası burada yakalanır.
export default function ContentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-card px-8 py-12 text-center shadow-2xl shadow-black/20">
        <p className="font-display text-3xl text-primary">Bir hata oluştu</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sayfa yüklenirken bir sorun yaşandı · Something went wrong
        </p>
        {error.message && (
          <p className="mt-3 font-mono text-xs break-words text-destructive">
            {error.message}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={reset}>Tekrar Dene</Button>
          <Button asChild variant="outline">
            <Link href="/">Ana Sayfa</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
