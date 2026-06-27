"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";

type NavPage = { slug: string; title: string };

export default function NavBar({
  lang,
  pages,
}: {
  lang: string;
  pages: NavPage[];
}) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  // Aktif sekmeyi URL'den türet — sayfa değişiminde remount olmadan güncellenir
  const pathname = usePathname();
  const currentSlug = pathname.split("/").filter(Boolean).slice(1).join("/");

  // Aşağı scroll → gizle, yukarı scroll → göster
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > prev && latest > 80) setHidden(true);
    else setHidden(false);
  });

  const homeTitle = lang === "en" ? "Home" : "Ana Sayfa";
  const links = [{ slug: "", title: homeTitle }, ...pages];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{
        y: hidden ? "-110%" : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 z-30 w-full"
    >
      <nav className="mx-auto mt-3 flex max-w-5xl items-center justify-center px-3 sm:px-6">
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
          }}
          className="flex items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-black/30 px-2 py-1.5 font-accent text-sm tracking-wide shadow-lg backdrop-blur-md"
        >
          {links.map((p) => {
            const active = currentSlug === p.slug;
            const href = p.slug ? `/${lang}/${p.slug}` : `/${lang}`;
            return (
              <motion.li
                key={p.slug || "home"}
                variants={{
                  hidden: { opacity: 0, y: -8 },
                  show: { opacity: 1, y: 0 },
                }}
                className="flex-none"
              >
                <Link
                  href={href}
                  className={`relative block whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors ${
                    active
                      ? "text-off-white"
                      : "text-off-white/70 hover:text-off-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {p.title}
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>
    </motion.header>
  );
}
