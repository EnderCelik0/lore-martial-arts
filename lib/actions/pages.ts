"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteCloudinaryImage } from "@/lib/actions/cloudinary";

async function requireSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

function publicPath(language: string, slug: string) {
  return slug ? `/${language}/${slug}` : `/${language}`;
}

export interface PageInput {
  language: "tr" | "en";
  slug: string;
  title: string;
  meta_description: string;
  is_active: boolean;
}

export async function createPage(input: PageInput) {
  const supabase = await requireSupabase();
  const { data, error } = await supabase
    .from("pages")
    .insert({
      language: input.language,
      slug: input.slug,
      title: input.title,
      meta_description: input.meta_description,
      is_active: input.is_active,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath(publicPath(input.language, input.slug));
  redirect(`/admin/sections/${data.id}`);
}

export async function updatePage(id: string, input: PageInput) {
  const supabase = await requireSupabase();
  const { error } = await supabase
    .from("pages")
    .update({
      language: input.language,
      slug: input.slug,
      title: input.title,
      meta_description: input.meta_description,
      is_active: input.is_active,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath(publicPath(input.language, input.slug));
  redirect("/admin");
}

export async function deletePage(id: string) {
  const supabase = await requireSupabase();

  // Sayfaya bağlı görselleri Cloudinary'den de sil
  const { data: page } = await supabase
    .from("pages")
    .select("language, slug")
    .eq("id", id)
    .single();

  const { data: sections } = await supabase
    .from("sections")
    .select("image_public_id")
    .eq("page_id", id);

  if (sections) {
    for (const s of sections) {
      if (s.image_public_id) {
        try {
          await deleteCloudinaryImage(s.image_public_id);
        } catch {}
      }
    }
  }

  // sections CASCADE ile otomatik silinir
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  if (page) revalidatePath(publicPath(page.language, page.slug));
  return { success: true };
}
