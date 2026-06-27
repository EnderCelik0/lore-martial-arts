import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SectionManager from "@/components/admin/SectionManager";
import { Badge } from "@/components/ui/badge";
import type { Page, Section } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SectionsPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .maybeSingle();

  if (!page) notFound();

  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("page_id", pageId)
    .order("display_order", { ascending: true });

  const p = page as Page;
  const previewPath = `/${p.language}${p.slug ? `/${p.slug}` : ""}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Sayfalar
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="font-display text-3xl tracking-wide text-primary">
              {p.title}
            </h1>
            <Badge variant={p.language === "tr" ? "default" : "secondary"}>
              {p.language.toUpperCase()}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {previewPath}
          </p>
        </div>

        <Link
          href={previewPath}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border bg-card px-4 py-2 text-sm shadow-sm transition-colors hover:bg-accent"
        >
          Siteyi Önizle ↗
        </Link>
      </div>

      <SectionManager
        pageId={pageId}
        initialSections={(sections ?? []) as Section[]}
      />
    </div>
  );
}
