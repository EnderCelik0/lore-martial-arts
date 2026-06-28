// JSON-LD structured data'yı <script> olarak basar. Next.js'in önerdiği
// pattern: dangerouslySetInnerHTML ile serialize edilmiş JSON.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
