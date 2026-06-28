-- Mevcut DB için: sections tablosuna görsel boyutu kolonları ekle.
-- CLS (layout shift) önlemek için <img> width/height değerleri.
-- Supabase SQL editöründe bir kez çalıştır.

ALTER TABLE sections
  ADD COLUMN IF NOT EXISTS image_width INTEGER,
  ADD COLUMN IF NOT EXISTS image_height INTEGER;
