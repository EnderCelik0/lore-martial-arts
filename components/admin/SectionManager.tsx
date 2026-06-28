"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Reorder, useDragControls } from "motion/react";
import { toast } from "sonner";
import {
  deleteSection,
  reorderSections,
  updateSectionText,
} from "@/lib/actions/sections";
import ImageUploader from "@/components/admin/ImageUploader";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Section } from "@/lib/types";

export default function SectionManager({
  pageId,
  initialSections,
}: {
  pageId: string;
  initialSections: Section[];
}) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Sürükleme bittiğinde güncel sırayı kaydetmek için referans (drag sırasında
  // onReorder state'i günceller; onDragEnd closure'ı taze değere ref'ten erişir)
  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  function handleUploaded(section: Section) {
    setSections((prev) => [...prev, section]);
  }

  // Verilen sırayı sunucuya yazar (hem drag hem buton bunu kullanır).
  function persist(list: Section[]) {
    const ids = list.map((s) => s.id);
    startTransition(async () => {
      const res = await reorderSections(pageId, ids);
      if (res?.error) toast.error("Sıralama kaydedilemedi");
      else toast.success("Sıralama kaydedildi");
    });
  }

  // Buton ile taşıma (mobil + masaüstü). dir: -1 yukarı, +1 aşağı.
  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    persist(next);
  }

  function handleSaveText(id: string, seo_text: string, image_alt: string) {
    startTransition(async () => {
      const res = await updateSectionText(id, seo_text, image_alt);
      if (res?.error) {
        toast.error("Kaydedilemedi");
        return;
      }
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, seo_text, image_alt } : s)),
      );
      toast.success("Kaydedildi");
    });
  }

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const res = await deleteSection(id);
      setPendingId(null);
      if (res?.error) {
        toast.error("Silinemedi");
        return;
      }
      setSections((prev) => prev.filter((s) => s.id !== id));
      toast.success("Görsel silindi");
    });
  }

  return (
    <div className="space-y-6">
      {sections.length > 1 && (
        <p className="text-sm text-muted-foreground">
          Sırayı değiştirmek için ▲ ▼ butonlarını kullanın. Masaüstünde{" "}
          <span aria-hidden>⠿</span> tutamaçtan tutup sürükleyebilirsiniz. Sayfada
          yukarıdan aşağıya bu sırayla görünürler.
        </p>
      )}

      {sections.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
          Henüz görsel yok. Aşağıdan ilk görseli yükleyin.
        </p>
      ) : (
        <Reorder.Group
          as="div"
          axis="y"
          values={sections}
          onReorder={setSections}
          className="space-y-4"
        >
          {sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
              pending={pendingId === section.id}
              onDragEnd={() => persist(sectionsRef.current)}
              onMove={move}
              onSaveText={handleSaveText}
              onDelete={handleDelete}
            />
          ))}
        </Reorder.Group>
      )}

      <ImageUploader pageId={pageId} onUploaded={handleUploaded} />
    </div>
  );
}

function SectionCard({
  section,
  index,
  isFirst,
  isLast,
  pending,
  onDragEnd,
  onMove,
  onSaveText,
  onDelete,
}: {
  section: Section;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  pending: boolean;
  onDragEnd: () => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onSaveText: (id: string, seo_text: string, image_alt: string) => void;
  onDelete: (id: string) => void;
}) {
  const controls = useDragControls();
  const seoRef = useRef<HTMLTextAreaElement>(null);
  const altRef = useRef<HTMLInputElement>(null);

  // İki alandan biri blur olunca, ikisi de değişmişse tek seferde kaydet.
  function save() {
    const seo = seoRef.current?.value ?? "";
    const alt = altRef.current?.value ?? "";
    if (seo === section.seo_text && alt === section.image_alt) return;
    onSaveText(section.id, seo, alt);
  }

  return (
    <Reorder.Item
      as="div"
      value={section}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-start"
    >
      {/* Sıralama kontrolleri: butonlar her yerde, drag tutamacı sadece masaüstü */}
      <div className="flex flex-none items-center gap-1 sm:flex-col">
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={isFirst}
          onClick={() => onMove(index, -1)}
          aria-label="Yukarı taşı"
          title="Yukarı taşı"
        >
          ▲
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={isLast}
          onClick={() => onMove(index, 1)}
          aria-label="Aşağı taşı"
          title="Aşağı taşı"
        >
          ▼
        </Button>
        {/* Drag tutamacı — yalnızca masaüstünde (md+) görünür */}
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          className="hidden cursor-grab touch-none items-center justify-center rounded-md px-2 py-1 text-xl text-muted-foreground hover:bg-accent active:cursor-grabbing md:flex"
          aria-label="Sürükleyerek taşı"
          title="Sürükleyerek taşı"
        >
          ⠿
        </button>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={section.image_url}
        alt={section.image_alt || ""}
        className="h-24 w-24 flex-none rounded border border-border object-cover"
      />

      <div className="flex-1 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Görsel açıklaması (Google için — sitede görünmez)
          </label>
          <Textarea
            ref={seoRef}
            defaultValue={section.seo_text}
            rows={3}
            placeholder="Bu görselde ne anlatılıyor? Kısaca yazın."
            onBlur={save}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Alt metin (görsel yüklenmezse / ekran okuyucu için görülen yazı)
          </label>
          <Input
            ref={altRef}
            defaultValue={section.image_alt}
            placeholder="Örn: Beyaz kemerli sporcu çalışıyor"
            onBlur={save}
          />
        </div>
      </div>

      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => onDelete(section.id)}
        className="flex-none"
      >
        Sil
      </Button>
    </Reorder.Item>
  );
}
