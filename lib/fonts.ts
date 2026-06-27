import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";

// Başlıklar / display — Gang of Three
export const gangOfThree = localFont({
  src: "../fonts/gangOfThree.ttf",
  variable: "--font-display",
  display: "swap",
});

// İkincil başlık / etiket vurgusu — Mangat
export const mangat = localFont({
  src: [
    { path: "../fonts/mangat.ttf", weight: "400", style: "normal" },
    { path: "../fonts/mangatb.ttf", weight: "700", style: "normal" },
    { path: "../fonts/mangati.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-accent",
  display: "swap",
});

// Gövde / açıklama metinleri — Geist
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
