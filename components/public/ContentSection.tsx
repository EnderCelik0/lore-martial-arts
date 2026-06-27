import type { Section } from "@/lib/types";

export default function ContentSection({
  section,
  index,
}: {
  section: Section;
  index: number;
}) {
  return (
    <section className="relative w-full">
      {/* Müşteri tasarım görseli — orijinal oran korunur, dönüşüm yok.
          gap-0 ile üst üste birleşik dizilir, kolon shadow ile panodan ayrışır. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={section.image_url}
        alt={section.image_alt || ""}
        className="block h-auto max-w-full"
        loading={index === 0 ? "eager" : "lazy"}
      />
      <div className="sr-only">{section.seo_text}</div>
    </section>
  );
}
