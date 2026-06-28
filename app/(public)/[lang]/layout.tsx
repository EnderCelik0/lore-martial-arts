import NavBar from "@/components/public/NavBar";
import JsonLd from "@/components/public/JsonLd";
import { getNavPages } from "@/lib/queries";
import { buildLocalBusinessJsonLd } from "@/lib/structured-data";

// Dil bazlı kalıcı layout — NavBar burada yaşar, alt sayfalar arası
// gezinmede remount olmaz (slide/pill animasyonu korunur).
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const navPages = await getNavPages(lang);
  const isValidLang = lang === "tr" || lang === "en";

  return (
    <>
      {/* Salon LocalBusiness JSON-LD — her public dil sayfasında. */}
      {isValidLang && <JsonLd data={buildLocalBusinessJsonLd(lang)} />}
      <NavBar lang={lang} pages={navPages} />
      {children}
    </>
  );
}
