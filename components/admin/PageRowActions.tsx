"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePage } from "@/lib/actions/pages";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PageRowActions({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const res = await deletePage(id);
      if (res?.error) {
        toast.error("Silinemedi: " + res.error);
        return;
      }
      toast.success("Sayfa silindi");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild size="sm" variant="secondary">
        <Link href={`/admin/sections/${id}`}>Görselleri Yönet</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/pages/${id}`}>Düzenle</Link>
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">
            Sil
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sayfayı sil?</AlertDialogTitle>
            <AlertDialogDescription>
              “{title}” sayfası ve içindeki tüm görseller kalıcı olarak
              silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={pending}
            >
              {pending ? "Siliniyor…" : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
