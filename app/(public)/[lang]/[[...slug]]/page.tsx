import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/queries";
import ContentSection from "@/components/public/ContentSection";

const SITE_URL = "https://loremartialarts.com";

// ISR — sayfa 1 saatte bir yeniden üretilir
export const revalidate = 3600;

type Params = Promise<{ lang: string; slug?: string[] }>;

function normalize(lang: string, slug?: string[]) {
  return { lang, slugStr: slug?.join("/") ?? "" };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const { slugStr } = normalize(lang, slug);
  const page = await getPage(lang, slugStr);

  const url = `${SITE_URL}/${lang}${slugStr ? `/${slugStr}` : ""}`;

  // Başlıkta zaten brand prefix varsa (DB'den gelmiş olabilir) söküp tek sefer ekle
  const pageName = page?.title
    ?.replace(/^\s*lore martial arts\s*[|\-–—]\s*/i, "")
    .trim();
  const fullTitle =
    slugStr && pageName
      ? `Lore Martial Arts | ${pageName}`
      : "Lore Martial Arts";

  return {
    title: fullTitle,
    description: page?.meta_description ?? "Brazilian Jiu-Jitsu",
    openGraph: {
      title: fullTitle,
      description: page?.meta_description ?? "Brazilian Jiu-Jitsu",
      url,
      siteName: "Lore Martial Arts",
      locale: lang === "tr" ? "tr_TR" : "en_US",
      type: "website",
    },
    alternates: {
      canonical: url,
      languages: {
        tr: `${SITE_URL}/tr`,
        en: `${SITE_URL}/en`,
      },
    },
  };
}

export default async function ContentPage({ params }: { params: Params }) {
  const { lang, slug } = await params;

  if (lang !== "tr" && lang !== "en") notFound();

  const { slugStr } = normalize(lang, slug);
  const page = await getPage(lang, slugStr);

  if (!page) notFound();

  return (
    <main className="relative flex w-full justify-center">
      {/* Tasarım görselleri tam ekran kaplamaz — ortalanmış, max 320px kolon.
          Mobilde ekran genişliğine kadar (yatay padding ile) uyum sağlar. */}
      <div className="flex w-full max-w-xs md:max-w-5xl flex-col gap-10 px-4 pt-20 pb-10 sm:px-0">
        {page.sections.map((section, index) => (
          <ContentSection key={section.id} section={section} index={index} />
        ))}
      </div>
    </main>
  );
}
