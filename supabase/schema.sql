-- Dil ve route bilgisi olan sayfalar
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('tr', 'en')),
  title TEXT NOT NULL,
  meta_description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, language)
);

-- Her sayfanın içindeki görsel + SEO metin çiftleri
CREATE TABLE sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_public_id TEXT NOT NULL,
  image_alt TEXT DEFAULT '',
  seo_text TEXT DEFAULT '',
  -- Cloudinary'den gelen orijinal boyut — CLS önlemek için <img> width/height
  image_width INTEGER,
  image_height INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Public okuma
CREATE POLICY "pages_public_read" ON pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "sections_public_read" ON sections
  FOR SELECT USING (true);

-- Admin yazma (sadece authenticated user)
CREATE POLICY "pages_admin_all" ON pages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "sections_admin_all" ON sections
  FOR ALL USING (auth.role() = 'authenticated');

-- Performans için index'ler
CREATE INDEX idx_pages_lang_slug ON pages(language, slug);
CREATE INDEX idx_sections_page_order ON sections(page_id, display_order);
