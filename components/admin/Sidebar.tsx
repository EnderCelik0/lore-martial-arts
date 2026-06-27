"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const items = [{ href: "/admin", label: "Sayfalar" }];

  return (
    <aside className="hidden md:flex md:sticky md:top-0 h-screen w-60 flex-none flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 py-6">
        <Link href="/admin" className="block">
          <span className="font-display text-xl tracking-wide text-sidebar-foreground">
            Admin Panel
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((it) => {
          const active =
            it.href === "/admin"
              ? pathname === "/admin" ||
                pathname.startsWith("/admin/pages") ||
                pathname.startsWith("/admin/sections")
              : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>

      <form action={signOut} className="p-3">
        <button
          type="submit"
          className="w-full rounded-md px-3 py-2 text-left text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          Çıkış Yap
        </button>
      </form>
    </aside>
  );
}
