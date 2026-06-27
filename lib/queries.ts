import { createClient } from "@/lib/supabase/server";
import type { Page, PageWithSections, Section } from "@/lib/types";

// Public sayfa + section'larını dil ve slug'a göre getirir.
// RLS public read policy'si yalnızca is_active = true sayfaları döndürür.
export async function getPage(
  lang: string,
  slug: string,
): Promise<PageWithSections | null> {
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("language", lang)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!page) return null;

  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("page_id", (page as Page).id)
    .order("display_order", { ascending: true });

  return { ...(page as Page), sections: (sections ?? []) as Section[] };
}

// Navbar için: ilgili dilin aktif alt sayfaları (ana sayfa hariç).
// display_order sırasıyla döner. title = navbarda görünen etiket.
export async function getNavPages(
  lang: string,
): Promise<{ slug: string; title: string }[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pages")
    .select("slug, title")
    .eq("language", lang)
    .eq("is_active", true)
    .neq("slug", "")
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });

  return (data ?? []) as { slug: string; title: string }[];
}
