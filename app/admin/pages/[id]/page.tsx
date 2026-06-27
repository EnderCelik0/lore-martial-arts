import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageForm from "@/components/admin/PageForm";
import type { Page } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!page) notFound();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Sayfalar
      </Link>
      <h1 className="mb-6 mt-2 font-display text-3xl tracking-wide text-primary">
        SAYFAYI DÜZENLE
      </h1>
      <div className="max-w-2xl rounded-lg border bg-card p-6 shadow-sm">
        <PageForm page={page as Page} />
      </div>
    </div>
  );
}
