"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold">Bir hata oluştu</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        İşlem sırasında beklenmeyen bir sorun yaşandı. Lütfen tekrar deneyin.
      </p>
      {error.message && (
        <p className="font-mono text-xs text-destructive">{error.message}</p>
      )}
      <Button onClick={reset}>Tekrar Dene</Button>
    </div>
  );
}
