export interface Page {
  id: string;
  slug: string;
  language: "tr" | "en";
  title: string;
  meta_description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  page_id: string;
  image_url: string;
  image_public_id: string;
  image_alt: string;
  seo_text: string;
  image_width: number | null;
  image_height: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PageWithSections extends Page {
  sections: Section[];
}
