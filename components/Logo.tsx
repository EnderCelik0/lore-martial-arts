import Image from "next/image";
import { cn } from "@/lib/utils";

// Lore Martial Arts marka logosu (koyu çizim, şeffaf zemin).
// Koyu zeminlerde okunması için açık bir kapsayıcı (chip) içinde kullan.
export default function Logo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/lore-martial-arts-logo.png"
      alt="Lore Martial Arts"
      width={1395}
      height={1373}
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
    />
  );
}
