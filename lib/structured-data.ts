import { SITE_URL, SITE_NAME, GYM, GYM_DESCRIPTION } from "@/lib/site";

// schema.org SportsActivityLocation (LocalBusiness alt tipi) JSON-LD üretir.
// BJJ salonu için Google'a işletme tipi, konum, saat ve iletişim sinyali verir.
// Boş bırakılan config alanları çıktıdan otomatik düşürülür.
export function buildLocalBusinessJsonLd(lang: "tr" | "en") {
  const url = `${SITE_URL}/${lang}`;

  const address = pruneEmpty({
    "@type": "PostalAddress",
    streetAddress: GYM.address.streetAddress,
    addressLocality: GYM.address.addressLocality,
    addressRegion: GYM.address.addressRegion,
    postalCode: GYM.address.postalCode,
    addressCountry: GYM.address.addressCountry,
  });

  const geo =
    GYM.geo.latitude && GYM.geo.longitude
      ? {
          "@type": "GeoCoordinates",
          latitude: GYM.geo.latitude,
          longitude: GYM.geo.longitude,
        }
      : undefined;

  const openingHoursSpecification = GYM.openingHours.map((slot) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: slot.days,
    opens: slot.opens,
    closes: slot.closes,
  }));

  return pruneEmpty({
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: GYM.legalName,
    description: GYM_DESCRIPTION[lang],
    url,
    image: `${SITE_URL}/lore-martial-arts-logo.png`,
    logo: `${SITE_URL}/lore-martial-arts-logo.png`,
    telephone: GYM.telephone,
    email: GYM.email,
    sport: GYM.sport,
    address: Object.keys(address).length > 1 ? address : undefined,
    geo,
    openingHoursSpecification: openingHoursSpecification.length
      ? openingHoursSpecification
      : undefined,
    sameAs: GYM.sameAs.length ? [...GYM.sameAs] : undefined,
  });
}

// Boş string / undefined / boş dizi alanları nesneden temizler.
function pruneEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out as T;
}
