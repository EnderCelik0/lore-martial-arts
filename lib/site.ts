// Site geneli sabitler ve salon bilgisi — JSON-LD, sitemap, robots ve
// metadata bunları tek yerden okur. İşletme sahibi yalnızca burayı günceller.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://loremartialarts.com";

export const SITE_NAME = "Lore Martial Arts";

// ⚠️ DOLDURULACAK: Aşağıdaki değerleri salonun gerçek bilgileriyle değiştir.
// Boş bırakılan alanlar JSON-LD çıktısından otomatik çıkarılır.
export const GYM = {
  legalName: "Lore Martial Arts",
  // İletişim
  telephone: "+90 000 000 00 00",
  email: "info@loremartialarts.com",
  // Adres
  address: {
    streetAddress: "",
    addressLocality: "İstanbul",
    addressRegion: "İstanbul",
    postalCode: "",
    addressCountry: "TR",
  },
  // Harita konumu (Google Maps'ten enlem/boylam)
  geo: {
    latitude: 0,
    longitude: 0,
  },
  openingHours: [
    {
      days: ["Tuesday", "Thursday", "Saturday"],
      opens: "20:30",
      closes: "22:00",
    },
    { days: ["Saturday"], opens: "18:30", closes: "20:00" },
  ],
  // Sosyal medya profilleri (sameAs) — varsa ekle, yoksa boş bırak
  sameAs: [
    // "https://www.instagram.com/loremartialarts",
    // "https://www.youtube.com/@loremartialarts",
  ],
  // Sunulan spor dalı
  sport: "Brazilian Jiu-Jitsu",
} as const;

// Dil bazlı kısa açıklama — JSON-LD ve fallback metadata için.
export const GYM_DESCRIPTION: Record<"tr" | "en", string> = {
  tr: "Antalya'da Brezilya Jiu-Jitsu (BJJ) salonu. Yeni başlayanlar ve ileri seviye için dersler.",
  en: "Brazilian Jiu-Jitsu (BJJ) academy in Antalya. Classes for beginners and advanced practitioners.",
};
