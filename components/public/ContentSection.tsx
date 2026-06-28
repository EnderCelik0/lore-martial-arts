import type { Section } from "@/lib/types";

export default function ContentSection({
  section,
  index,
}: {
  section: Section;
  index: number;
}) {
  return (
    <section className="relative w-full flex items-center justify-center">
      {/* Müşteri tasarım görseli — orijinal oran korunur, dönüşüm yok.
          gap-0 ile üst üste birleşik dizilir, kolon shadow ile panodan ayrışır. */}
      {/* width/height verilince tarayıcı aspect-ratio'yu rezerve eder → CLS yok.
          CSS (h-auto max-w-full) boyutu responsive tutar, oran korunur. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={section.image_url}
        alt={section.image_alt || ""}
        width={section.image_width ?? undefined}
        height={section.image_height ?? undefined}
        className="block h-auto max-w-full"
        loading={index === 0 ? "eager" : "lazy"}
        fetchPriority={index === 0 ? "high" : undefined}
        decoding="async"
      />
      {section.seo_text && <div className="sr-only">{section.seo_text}</div>}
    </section>
  );
}
