"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { generateCloudinarySignature } from "@/lib/actions/cloudinary";
import { addSection } from "@/lib/actions/sections";
import type { Section } from "@/lib/types";

const FOLDER = "loremartialarts";
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function ImageUploader({
  pageId,
  onUploaded,
}: {
  pageId: string;
  onUploaded: (section: Section) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Geçersiz format. JPG, PNG, WebP veya AVIF yükleyin.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Dosya çok büyük. En fazla 20 MB.");
      return;
    }

    setBusy(true);
    setProgress(0);

    try {
      const { signature, timestamp, api_key, cloud_name } =
        await generateCloudinarySignature(FOLDER);

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", api_key);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", FOLDER);

      const result = await new Promise<{
        secure_url: string;
        public_id: string;
        width: number;
        height: number;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        );
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Cloudinary yükleme hatası"));
          }
        };
        xhr.onerror = () => reject(new Error("Ağ hatası"));
        xhr.send(form);
      });

      const res = await addSection({
        page_id: pageId,
        image_url: result.secure_url,
        image_public_id: result.public_id,
        image_width: result.width,
        image_height: result.height,
      });

      if (res.error || !res.data) {
        toast.error("Kaydedilemedi: " + (res.error ?? "bilinmeyen hata"));
        return;
      }

      onUploaded(res.data);
      toast.success("Görsel yüklendi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yükleme başarısız");
    } finally {
      setBusy(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (busy) return;
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      onClick={() => !busy && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-card p-10 text-center shadow-sm transition-colors ${
        dragOver
          ? "border-primary bg-accent"
          : "border-primary/40 hover:border-primary hover:bg-accent/60"
      } ${busy ? "pointer-events-none opacity-70" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {busy ? (
        <div className="w-full max-w-xs">
          <p className="mb-2 text-sm text-muted-foreground">
            Yükleniyor… %{progress}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-foreground transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium">
            Görsel sürükleyin veya tıklayıp seçin
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP, AVIF · en fazla 20 MB
          </p>
        </>
      )}
    </div>
  );
}
