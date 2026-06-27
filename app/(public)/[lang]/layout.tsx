import NavBar from "@/components/public/NavBar";
import { getNavPages } from "@/lib/queries";

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

  return (
    <>
      <NavBar lang={lang} pages={navPages} />
      {children}
    </>
  );
}
