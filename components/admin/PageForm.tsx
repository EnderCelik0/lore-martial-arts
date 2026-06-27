"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createPage, updatePage, type PageInput } from "@/lib/actions/pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Page } from "@/lib/types";

const TR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

// Müşteri Türkçe/serbest yazsın; otomatik geçerli adrese çeviriyoruz.
function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[çğıöşü]/g, (c) => TR_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-");
}

export default function PageForm({ page }: { page?: Page }) {
  const isEdit = !!page;
  const [pending, startTransition] = useTransition();

  const [language, setLanguage] = useState<"tr" | "en">(page?.language ?? "tr");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [title, setTitle] = useState(page?.title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    page?.meta_description ?? "",
  );
  const [isActive, setIsActive] = useState(page?.is_active ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Lütfen bir sayfa başlığı girin.");
      return;
    }

    const cleanSlug = slug.replace(/^-+|-+$/g, "");

    const input: PageInput = {
      language,
      slug: cleanSlug,
      title: title.trim(),
      meta_description: metaDescription.trim(),
      is_active: isActive,
    };

    startTransition(async () => {
      const res = isEdit
        ? await updatePage(page!.id, input)
        : await createPage(input);
      // Başarılı durumda action redirect eder; buraya yalnızca hata düşer.
      if (res?.error) {
        toast.error(
          res.error.includes("duplicate")
            ? "Bu adres bu dilde zaten kullanılıyor. Farklı bir adres deneyin."
            : "Kaydedilemedi. Lütfen tekrar deneyin.",
        );
      }
    });
  }

  const cleanPreviewSlug = slug.replace(/^-+|-+$/g, "");
  const previewUrl = `loremartialarts.com/${language}${
    cleanPreviewSlug ? `/${cleanPreviewSlug}` : ""
  }`;
  const isHome = !cleanPreviewSlug;

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="space-y-2">
        <Label>Sayfa dili</Label>
        <Select
          value={language}
          onValueChange={(v) => setLanguage(v as "tr" | "en")}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
            <SelectItem value="en">🇬🇧 İngilizce</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Bu sayfanın hangi dil bölümünde görüneceğini seçin.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Sayfa başlığı</Label>
        <Input
          id="title"
          value={title}
          placeholder="Örn: Hakkımızda"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground">
          Tarayıcı sekmesinde ve Google sonuçlarında görünen isim.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Sayfa adresi</Label>
        <Input
          id="slug"
          value={slug}
          placeholder="örn: hakkimizda (boş bırakırsanız ana sayfa olur)"
          onChange={(e) => setSlug(slugify(e.target.value))}
        />
        <div className="rounded-md bg-accent/60 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            Sayfanın internet adresi:{" "}
          </span>
          <span className="font-medium text-primary">{previewUrl}</span>
          {isHome && (
            <span className="ml-2 text-xs text-muted-foreground">
              (dilin ana sayfası)
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          İstediğiniz gibi yazın; boşluk ve Türkçe karakterler otomatik
          düzeltilir. Boş bırakırsanız bu sayfa, seçtiğiniz dilin ana sayfası
          olur.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta">Kısa açıklama</Label>
        <Textarea
          id="meta"
          value={metaDescription}
          maxLength={160}
          rows={3}
          placeholder="Google'da başlığın altında görünecek 1-2 cümle."
          onChange={(e) => setMetaDescription(e.target.value)}
        />
        <p className="text-right text-xs text-muted-foreground">
          {metaDescription.length}/160 karakter
        </p>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border bg-accent/40 px-4 py-3">
        <div>
          <Label htmlFor="active" className="cursor-pointer">
            {isActive ? "Sayfa yayında" : "Sayfa gizli"}
          </Label>
          <p className="text-sm text-muted-foreground">
            {isActive
              ? "Ziyaretçiler bu sayfayı görebilir."
              : "Sayfa kimseye görünmez, sadece siz düzenleyebilirsiniz."}
          </p>
        </div>
        <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Kaydediliyor…"
            : isEdit
              ? "Değişiklikleri Kaydet"
              : "Sayfayı Oluştur"}
        </Button>
        <Button asChild type="button" variant="ghost">
          <Link href="/admin">Vazgeç</Link>
        </Button>
      </div>
    </form>
  );
}
