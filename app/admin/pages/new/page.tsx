import Link from "next/link";
import PageForm from "@/components/admin/PageForm";

export default function NewPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Sayfalar
      </Link>
      <h1 className="mb-6 mt-2 font-display text-3xl tracking-wide text-primary">
        YENI SAYFA
      </h1>
      <div className="max-w-2xl rounded-lg border bg-card p-6 shadow-sm">
        <PageForm />
      </div>
    </div>
  );
}
