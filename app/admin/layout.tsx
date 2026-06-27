import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/admin/Sidebar";
import MobileBar from "@/components/admin/MobileBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware login dışındaki tüm /admin route'larında user garantisi verir.
  // User yoksa burası login sayfasıdır — kabuk (sidebar) gösterilmez.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row text-foreground">
      <Sidebar />
      <MobileBar />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
