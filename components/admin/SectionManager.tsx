"use client";

import { useRef, useState, useTransition } from "react";
import { Reorder, useDragControls } from "motion/react";
import { toast } from "sonner";
import {
  deleteSection,
  reorderSections,
  updateSectionText,
} from "@/lib/actions/sections";
import ImageUploader from "@/components/admin/ImageUploader";
import { Textarea } from "@/components/ui/textarea";
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

  // Sürükleme bittiğinde güncel sırayı kaydetmek için referans
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  function handleUploaded(section: Section) {
    setSections((prev) => [...prev, section]);
  }

  function persistOrder() {
    const ids = sectionsRef.current.map((s) => s.id);
    startTransition(async () => {
      const res = await reorderSections(pageId, ids);
      if (res?.error) toast.error("Sıralama kaydedilemedi");
      else toast.success("Sıralama kaydedildi");
    });
  }

  function handleSaveText(id: string, value: string, original: string) {
    if (value === original) return;
    startTransition(async () => {
      const res = await updateSectionText(id, value);
      if (res?.error) {
        toast.error("Kaydedilemedi");
        return;
      }
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, seo_text: value } : s)),
      );
      toast.success("Açıklama kaydedildi");
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
          Görselleri sıralamak için tutamaçtan{" "}
          <span aria-hidden>⠿</span> tutup sürükleyin. Sayfada yukarıdan aşağıya
          bu sırayla görünürler.
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
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              pending={pendingId === section.id}
              onDragEnd={persistOrder}
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
  pending,
  onDragEnd,
  onSaveText,
  onDelete,
}: {
  section: Section;
  pending: boolean;
  onDragEnd: () => void;
  onSaveText: (id: string, value: string, original: string) => void;
  onDelete: (id: string) => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={section}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
    >
      {/* Sürükleme tutamacı */}
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="flex flex-none cursor-grab touch-none items-center justify-center rounded-md px-2 py-3 text-xl text-muted-foreground hover:bg-accent active:cursor-grabbing sm:py-0"
        aria-label="Sürükleyerek taşı"
        title="Sürükleyerek taşı"
      >
        ⠿
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={section.image_url}
        alt={section.image_alt || ""}
        className="h-24 w-24 flex-none rounded border border-border object-cover"
      />

      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Görsel açıklaması (Google için — sitede görünmez)
        </label>
        <Textarea
          defaultValue={section.seo_text}
          rows={3}
          placeholder="Bu görselde ne anlatılıyor? Kısaca yazın."
          onBlur={(e) => onSaveText(section.id, e.target.value, section.seo_text)}
        />
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
