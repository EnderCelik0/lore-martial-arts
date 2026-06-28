import type { MetadataRoute } from "next";
import { getAllActivePages } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";

// DB ile aynı ISR aralığı — saatte bir yeniden üretilir.
export const revalidate = 3600;

function pageUrl(language: string, slug: string) {
  return slug
    ? `${SITE_URL}/${language}/${slug}`
    : `${SITE_URL}/${language}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllActivePages();

  return pages.map((page) => ({
    url: pageUrl(page.language, page.slug),
    lastModified: new Date(page.updated_at),
    // Ana sayfalar daha yüksek öncelik, alt sayfalar biraz düşük.
    changeFrequency: "weekly" as const,
    priority: page.slug === "" ? 1 : 0.8,
    // tr/en ana sayfaları arasında hreflang ilişkisi (mevcut canonical
    // stratejisiyle tutarlı). Slug eşleşmesi diller arası garanti olmadığı
    // için yalnızca ana sayfalarda dil alternatifi veriyoruz.
    ...(page.slug === ""
      ? {
          alternates: {
            languages: {
              tr: `${SITE_URL}/tr`,
              en: `${SITE_URL}/en`,
            },
          },
        }
      : {}),
  }));
}
