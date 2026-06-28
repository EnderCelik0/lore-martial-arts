"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteCloudinaryImage } from "@/lib/actions/cloudinary";
import type { Section } from "@/lib/types";

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

async function revalidatePageById(supabase: Awaited<ReturnType<typeof createClient>>, pageId: string) {
  const { data: page } = await supabase
    .from("pages")
    .select("language, slug")
    .eq("id", pageId)
    .single();
  if (page) revalidatePath(publicPath(page.language, page.slug));
}

// Sürükle-bırak sonrası tüm sıralamayı kaydeder.
// orderedIds dizisindeki index = yeni display_order.
export async function reorderSections(pageId: string, orderedIds: string[]) {
  const supabase = await requireSupabase();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("sections")
        .update({ display_order: index })
        .eq("id", id)
        .eq("page_id", pageId),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath(`/admin/sections/${pageId}`);
  await revalidatePageById(supabase, pageId);
  return { success: true };
}

export async function addSection(input: {
  page_id: string;
  image_url: string;
  image_public_id: string;
  image_alt?: string;
  seo_text?: string;
  image_width?: number;
  image_height?: number;
}) {
  const supabase = await requireSupabase();

  // Yeni section'ı listenin sonuna ekle
  const { count } = await supabase
    .from("sections")
    .select("id", { count: "exact", head: true })
    .eq("page_id", input.page_id);

  const { data, error } = await supabase
    .from("sections")
    .insert({
      page_id: input.page_id,
      image_url: input.image_url,
      image_public_id: input.image_public_id,
      image_alt: input.image_alt ?? "",
      seo_text: input.seo_text ?? "",
      image_width: input.image_width ?? null,
      image_height: input.image_height ?? null,
      display_order: count ?? 0,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/admin/sections/${input.page_id}`);
  await revalidatePageById(supabase, input.page_id);
  return { data: data as Section };
}

export async function updateSectionText(id: string, seo_text: string, image_alt?: string) {
  const supabase = await requireSupabase();
  const payload: Record<string, string> = { seo_text };
  if (image_alt !== undefined) payload.image_alt = image_alt;

  const { data, error } = await supabase
    .from("sections")
    .update(payload)
    .eq("id", id)
    .select("page_id")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/admin/sections/${data.page_id}`);
  await revalidatePageById(supabase, data.page_id);
  return { success: true };
}

export async function deleteSection(id: string) {
  const supabase = await requireSupabase();

  const { data: section } = await supabase
    .from("sections")
    .select("page_id, image_public_id")
    .eq("id", id)
    .single();

  if (section?.image_public_id) {
    try {
      await deleteCloudinaryImage(section.image_public_id);
    } catch {}
  }

  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) return { error: error.message };

  if (section) {
    revalidatePath(`/admin/sections/${section.page_id}`);
    await revalidatePageById(supabase, section.page_id);
  }
  return { success: true };
}
