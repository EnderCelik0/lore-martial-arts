"use client";

import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

// Mobil admin üst çubuğu — sidebar yerine (md altı).
export default function MobileBar() {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground">
      <Link
        href="/admin"
        className="font-display text-lg tracking-wide text-sidebar-foreground"
      >
        Admin Panel
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
        >
          Sayfalar
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            Çıkış
          </button>
        </form>
      </div>
    </header>
  );
}
