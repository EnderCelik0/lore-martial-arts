"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import Logo from "@/components/Logo";

const buttons = [
  { code: "tr", src: "/tr-button.png", alt: "Türkçe" },
  { code: "en", src: "/en-button.png", alt: "English" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function LanguageSelector() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-8"
    >
      <motion.div variants={fadeUp}>
        <Logo priority className="h-56 w-56 sm:h-120 sm:w-120" />
      </motion.div>

      <motion.div
        variants={container}
        className="flex items-center justify-center gap-6"
      >
        {buttons.map((b) => (
          <motion.div
            key={b.code}
            variants={fadeUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link href={`/${b.code}`} aria-label={b.alt}>
              <Image
                src={b.src}
                alt={b.alt}
                width={145}
                height={162}
                priority
                className="h-20 w-auto sm:h-24"
              />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
