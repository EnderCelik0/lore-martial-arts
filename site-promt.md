# Claude Code Prompt — loremartialarts.com

---

## Görev

Aşağıdaki spesifikasyonlara göre **loremartialarts.com** adlı BJJ tanıtım sitesini sıfırdan oluştur. Tüm dosyaları yaz, kurulum adımlarını tamamla ve çalışır hale getir.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **UI Bileşenleri**: shadcn/ui (admin paneli için)
- **Veritabanı + Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Görsel Depolama**: Cloudinary
- **Deploy Hedefi**: Vercel
- **Dil**: TypeScript (strict mode)

---

## Kritik: Next.js 16 Kuralları

Bu projede Next.js 16 kullanılıyor. Aşağıdaki kurallara her yerde kesinlikle uy:

- `params` ve `searchParams` artık asenkrondur. Server Component, Route Handler ve `generateMetadata` içinde mutlaka `await` edilmelidir:

```typescript
// DOGRU
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string[] }>;
}) {
  const { lang, slug } = await params;
}

// YANLIS — derleme hatası verir
export default async function Page({ params }) {
  const { lang, slug } = params;
}
```

- `cookies()` ve `headers()` da `await` gerektirir:

```typescript
const cookieStore = await cookies();
```

- `generateMetadata` içinde de `params` `await` edilmeli:

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  // ...
}
```

---

## Genel Proje Yapısı

Bu site iki ana bölümden oluşur:

1. **Public Site** — Ziyaretçilerin gördüğü BJJ tanıtım sayfası
2. **Admin Panel** (`/admin`) — Müşterinin (non-technical) kendi başına görsel yükleyip içerik yönettiği alan

### Temel mantık şu şekilde çalışır:

- Ana sayfa (`/`) → TR ve EN butonları gösterir
- Butona tıklanınca ilgili dil route'una yönlendirir (`/tr` veya `/en`)
- Her route'ta admin paneli üzerinden yüklenmiş **tasarım görselleri** tam genişlikte sırayla gösterilir
- Her görselin arkasında, **kullanıcının görmediği ama arama motorlarının okuduğu** `sr-only` HTML metni bulunur
- Admin panelinde müşteri: görsel yükler, o görseldeki yazıları girer, hangi sayfaya ait olduğunu seçer

---

## Dizin Yapısı

```
loremartialarts/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  # Ana sayfa — TR/EN seçim ekranı
│   │   ├── [lang]/
│   │   │   └── [...slug]/
│   │   │       └── page.tsx          # İçerik sayfası (dinamik)
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout (auth guard)
│   │   ├── login/
│   │   │   └── page.tsx              # Giriş sayfası
│   │   ├── page.tsx                  # Dashboard — sayfa listesi
│   │   ├── pages/
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Yeni sayfa oluştur
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Sayfa düzenle
│   │   └── sections/
│   │       └── [pageId]/
│   │           └── page.tsx          # Görselleri yönet
│   └── api/
│       └── revalidate/
│           └── route.ts              # On-demand revalidation
├── components/
│   ├── admin/
│   │   ├── ImageUploader.tsx         # Cloudinary yükleme bileşeni
│   │   ├── SectionManager.tsx        # Yukarı/aşağı sıralama + CRUD
│   │   ├── PageForm.tsx              # Sayfa oluştur/düzenle formu
│   │   └── Sidebar.tsx               # Admin sol menü
│   └── public/
│       ├── LanguageSelector.tsx      # Ana sayfa TR/EN kartları
│       └── ContentSection.tsx        # Görsel + sr-only metin
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client (cookies)
│   │   └── middleware.ts             # Auth middleware helper
│   ├── actions/
│   │   └── cloudinary.ts            # Cloudinary Server Actions (imza + silme)
│   ├── cloudinary.ts                 # Cloudinary config + helpers
│   └── types.ts                      # Tüm TypeScript tipleri
├── middleware.ts                      # Route koruma
├── .env.local.example
└── supabase/
    └── schema.sql                     # Veritabanı şeması
```

---

## Veritabanı Şeması

`supabase/schema.sql` dosyasını oluştur ve Supabase dashboard'unda çalıştır:

```sql
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
```

---

## Environment Variables

`.env.local.example` dosyası:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=********

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=********

# Revalidation
REVALIDATION_SECRET=********

# Site
NEXT_PUBLIC_SITE_URL=https://loremartialarts.com
```

---

## Public Site Detayları

### Ana Sayfa (`/`)

**Tam ekran, siyah arka plan, dikey ortalanmış içerik.**

Şunları içermelidir:

- Ortada logo/site adı (`LOREM MARTIAL ARTS`) — minimal, tipografik
- Altında iki büyük buton veya tıklanabilir kart: **TR** ve **EN**
- TR'ye tıklanınca `/tr` route'una, EN'e tıklanınca `/en` route'una yönlendir
- Animasyon: hover'da butonlar hafifçe büyür (`scale-105`), geçiş `duration-300`
- Sayfa `<title>`: `Lorem Martial Arts — Brazilian Jiu-Jitsu`
- Sayfa tamamen statik, Supabase'e istek atmaz

### İçerik Sayfası (`/[lang]/[...slug]`)

Örnek URL'ler: `/tr`, `/en`, `/tr/hakkimizda`, `/en/about`

**Veri akışı:**

1. URL'den `lang` ve `slug` parametrelerini `await params` ile al
2. `/tr` gibi tek segment URL'lerde slug yoksa `''` (boş string) kabul et
3. Supabase'den ilgili `page` kaydını çek (`language` + `slug` eşleşmesi)
4. O page'e bağlı `sections` kayıtlarını `display_order` sırasıyla çek
5. Her section için: `image_url` → görsel, `seo_text` → sr-only div

**Sayfa render yapısı:**

```tsx
<section className="relative w-full">
  <img
    src={section.image_url}
    alt={section.image_alt || ""}
    className="w-full h-auto block"
    loading={index === 0 ? "eager" : "lazy"}
  />
  <div className="sr-only">{section.seo_text}</div>
</section>
```

**Önemli noktalar:**

- Görseller `width: 100%`, `height: auto` — tasarım oranını koru
- Görseller arası boşluk yok (`gap-0`) — tasarımlar birbiriyle birleşik görünür
- `generateMetadata` içinde `await params` kullanılmalı
- Sayfa bulunamazsa `notFound()` çağır
- ISR ile cache'lenir: `export const revalidate = 3600`
- Header: sol'da logo (ana sayfaya link), sağda TR/EN dil geçiş linkleri

**Dil geçişi:**

- Header'daki dil butonları her zaman `/tr` ve `/en` ana sayfalarına gitsin (en basit ve güvenli çözüm)

---

## Admin Panel Detayları

### Login (`/admin/login`)

- Supabase Auth ile email + şifre girişi
- Başarılı girişte `/admin`'e yönlendir
- Hata durumunda Türkçe hata mesajı göster
- Tasarım: siyah/beyaz, minimalist, ortada login kartı

### Auth Guard (Middleware)

`middleware.ts` ile `/admin/*` path'lerini koru:

```typescript
// /admin/login hariç tüm /admin/* route'ları için:
// Supabase session yoksa /admin/login'e yönlendir
// Supabase session varsa /admin/login'e erişince /admin'e yönlendir
```

### Dashboard (`/admin`)

**Sol sidebar** (sabit):

- Logo / site adı
- Menü: Sayfalar, Çıkış Yap

**Ana alan — Sayfa Listesi:**

- Tüm sayfaları tablo halinde göster: Dil rozeti (TR / EN), Slug, Başlık, Section sayısı, Durum (aktif/pasif), İşlemler
- "Yeni Sayfa Ekle" butonu (üst sağ)
- Her satırda: Görselleri Yönet, Düzenle, Sil butonları
- Silme işleminde onay dialogu göster (`AlertDialog` kullan)
- Supabase'de silinen page'e bağlı section'lar CASCADE ile otomatik silinir; Cloudinary'deki görseller de Server Action üzerinden silinir

### Yeni Sayfa / Sayfa Düzenle

**Form alanları:**

- **Dil**: Dropdown — Türkçe (tr) / English (en)
- **Slug**: Text input — sadece küçük harf, rakam, tire (`^[a-z0-9-]*$`); boş bırakılırsa dil ana sayfası (`/tr`)
  - Otomatik önizleme: "Bu sayfa şu URL'de yayınlanacak: `/tr/hakkimizda`"
- **Başlık**: Text input — SEO `<title>` için
- **Meta Açıklama**: Textarea — max 160 karakter, karakter sayacı göster
- **Durum**: Toggle — Aktif / Pasif

### Görsel Yönetimi (`/admin/sections/[pageId]`)

Bu sayfa müşterinin en çok kullanacağı yerdir. Dikkatli ve sezgisel tasarla.

**Üst bilgi:**

- Hangi sayfanın düzenlendiğini göster
- "Sayfalar" geri linki
- "Siteyi Önizle" linki (yeni tab'da açılır)

**Section Listesi:**

- Her section bir kart olarak gösterilir
- Kart içeriği:
  - Sol: Küçük görsel önizlemesi (100x100 thumbnail)
  - Orta: SEO metin (düzenlenebilir textarea, `onBlur`'da otomatik kaydet)
  - Sağ: Yukarı/Aşağı taşı butonları, Sil butonu
- Basit yukarı/aşağı butonları kullan (drag-drop kütüphanesi ekleme)

**Yeni Görsel Yükleme:**

- Sayfanın altında büyük noktalı kenarlıklı drop zone
- Kabul edilen formatlar: JPG, PNG, WebP, AVIF
- Max dosya boyutu: 20 MB (client tarafında kontrol et)
- Yükleme akışı:
  1. Kullanıcı dosya seçer
  2. `generateCloudinarySignature` Server Action'ı çağır (imzayı sunucuda üret)
  3. Cloudinary'e direkt signed upload yap
  4. Yükleme tamamlanınca `image_url` ve `image_public_id` Supabase'e kaydet
  5. Section listesi güncellenir
- Yükleme sırasında progress bar göster
- Hata durumunda Türkçe hata mesajı

**Cloudinary Upload Ayarları:**

- Folder: `loremartialarts/`
- Dönüşüm yok — görseli olduğu gibi sakla
- Format: orijinal format korunsun

---

## Cloudinary Server Actions

Cloudinary ile ilgili tüm sunucu işlemleri `/admin/*` route'larından çağrılan Server Action'lar olarak yaz. Ayrı bir API route (`/api/cloudinary/signature`) oluşturma.

`lib/actions/cloudinary.ts`:

```typescript
"use server";

import { cloudinary } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";

// Yalnızca authenticated kullanıcı çağırabilir
export async function generateCloudinarySignature(folder: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
}

export async function deleteCloudinaryImage(publicId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return cloudinary.uploader.destroy(publicId);
}
```

---

## API Routes

### `POST /api/revalidate`

Admin'de değişiklik yapılınca ilgili sayfayı ISR cache'den temizle.

```typescript
// Body: { secret: string, slug: string, language: string }
// secret === process.env.REVALIDATION_SECRET kontrolü yap
// revalidatePath(`/${language}/${slug}`) çağır
```

---

## SEO ve Metadata

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = await getPage(lang, slug?.join("/") ?? "");

  return {
    title: page?.title ?? "Lorem Martial Arts",
    description: page?.meta_description ?? "Brazilian Jiu-Jitsu",
    openGraph: {
      title: page?.title,
      description: page?.meta_description,
      url: `https://loremartialarts.com/${lang}/${slug?.join("/") ?? ""}`,
      siteName: "Lorem Martial Arts",
      locale: lang === "tr" ? "tr_TR" : "en_US",
      type: "website",
    },
    alternates: {
      canonical: `https://loremartialarts.com/${lang}/${slug?.join("/") ?? ""}`,
      languages: {
        tr: "https://loremartialarts.com/tr",
        en: "https://loremartialarts.com/en",
      },
    },
  };
}
```

---

## Supabase Client Kurulumu

`lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}
```

`lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

---

## TypeScript Tipleri

`lib/types.ts`:

```typescript
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
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PageWithSections extends Page {
  sections: Section[];
}
```

---

## Cloudinary Konfigürasyonu

`lib/cloudinary.ts`:

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
```

---

## Middleware

`middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## package.json Bağımlılıkları

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.6.0",
    "cloudinary": "^2.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

shadcn/ui kurulumu:

```bash
npx shadcn@latest init
npx shadcn@latest add button input textarea dialog badge table card label select switch alert-dialog toast
```

---

## Kurulum Adımları

```bash
# 1. Bağımlılıkları kur
npm install @supabase/supabase-js @supabase/ssr cloudinary

# 2. shadcn/ui başlat
npx shadcn@latest init

# 3. shadcn bileşenlerini ekle
npx shadcn@latest add button input textarea dialog badge table card label select switch alert-dialog toast

# 4. .env.local oluştur ve değerleri doldur
cp .env.local.example .env.local
```

---

## Önemli Notlar

1. **Görsel boyutu**: Cloudinary URL'lerine `f_auto,q_auto` parametresi ekleme — müşterinin tasarım görseli bozulabilir. Orijinal URL'yi kullan.

2. **Sayfa bulunamazsa**: `notFound()` çağır, `not-found.tsx` sayfası yaz (siyah arka plan, Türkçe/İngilizce "Sayfa bulunamadı" mesajı).

3. **İlk veri**: Admin paneli hazır olunca Supabase'e manuel olarak TR ve EN ana sayfaları için birer `pages` kaydı ekle: `slug: ''`, `language: 'tr'/'en'`.

4. **Cloudinary görsel silme**: Admin'de section silinince `deleteCloudinaryImage` Server Action'ı çağırarak Cloudinary'den de sil.

5. **Cache**: Her section/page mutasyonunun sonunda `revalidatePath` ile ilgili public sayfa cache'ini temizle.

6. **Loading state**: Görsel yüklemesi sırasında butonu devre dışı bırak ve yükleme göstergesi ekle.

7. **Error boundary**: Admin sayfalarına `error.tsx` ekle, hata durumunda Türkçe mesaj göster.

8. **`'use server'` direktifi**: Server Action içeren tüm dosyalar `'use server'` direktifi ile başlamalıdır. Server Action'lar Client Component'lardan doğrudan import edilerek çağrılabilir.

---

## Teslim Kriterleri

- [ ] `npm run dev` hatasız başlar
- [ ] `/` Ana sayfa TR/EN seçim ekranı görünür
- [ ] `/tr` ve `/en` section listesi görünür (henüz içerik yoksa boş sayfa)
- [ ] `/admin/login` giriş formu görünür
- [ ] Supabase'de admin email/şifresi oluşturulunca `/admin`'e giriş yapılabilir
- [ ] Admin panelinde yeni sayfa oluşturulabilir
- [ ] Görsel yüklenebilir, Cloudinary'ye gider, URL Supabase'e kaydedilir
- [ ] SEO metni girilebilir ve kaydedilir
- [ ] Public sayfada görsel görünür, `sr-only` div'in içinde metin vardır
- [ ] `npm run build` hatasız tamamlanır
- [ ] TypeScript hataları sıfırdır (`tsc --noEmit`)
