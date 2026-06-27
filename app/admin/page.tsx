import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageRowActions from "@/components/admin/PageRowActions";
import type { Page } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .order("language", { ascending: true })
    .order("display_order", { ascending: true });

  const { data: sectionRows } = await supabase.from("sections").select("page_id");

  const counts = new Map<string, number>();
  for (const row of sectionRows ?? []) {
    counts.set(row.page_id, (counts.get(row.page_id) ?? 0) + 1);
  }

  const list = (pages ?? []) as Page[];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-primary">
            SAYFALAR
          </h1>
          <p className="text-sm text-muted-foreground">
            Yayındaki sayfaları yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">Yeni Sayfa Ekle</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Dil</TableHead>
              <TableHead>Sayfa</TableHead>
              <TableHead>Adres</TableHead>
              <TableHead className="w-24 text-center">Görsel</TableHead>
              <TableHead className="w-24">Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Henüz sayfa yok. “Yeni Sayfa Ekle” ile başlayın.
                </TableCell>
              </TableRow>
            )}

            {list.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <Badge variant={page.language === "tr" ? "default" : "secondary"}>
                    {page.language.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  /{page.language}
                  {page.slug ? `/${page.slug}` : ""}
                  {!page.slug && (
                    <span className="ml-1 font-sans not-italic text-xs">
                      (ana sayfa)
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {counts.get(page.id) ?? 0}
                </TableCell>
                <TableCell>
                  {page.is_active ? (
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Pasif
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <PageRowActions id={page.id} title={page.title} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
