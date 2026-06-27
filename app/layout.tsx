import type { Metadata } from "next";
import "./globals.css";
import { gangOfThree, mangat, geistSans, geistMono } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Lore Martial Arts — Brazilian Jiu-Jitsu",
  description: "Brazilian Jiu-Jitsu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${gangOfThree.variable} ${mangat.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
