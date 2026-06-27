import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-card px-8 py-12 text-center shadow-2xl shadow-black/20">
        <p className="font-display text-7xl text-primary">404</p>
        <p className="mt-2 text-muted-foreground">
          Sayfa bulunamadı · Page not found
        </p>
        <Button asChild className="mt-6">
          <Link href="/">ANA SAYFA · HOME</Link>
        </Button>
      </div>
    </main>
  );
}
