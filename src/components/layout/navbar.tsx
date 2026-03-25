"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Navbar() {
  return (
    <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white/30 backdrop-blur-2xl border border-white/50 max-w-4xl w-full h-20 flex items-center justify-between px-8 rounded-full shadow-[0_12px_48px_0_rgba(186,230,253,0.25)] ring-1 ring-white/40"
      >
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/cozyjet-logo.png"
              alt="CozyJet Logo"
              width={64}
              height={64}
              className="object-contain"
              style={{ width: "64px", height: "64px" }}
            />
          </div>
          <span className="font-pixel text-xl font-bold tracking-tighter text-black uppercase">
            CozyJet
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Button
            asChild
            className="bg-black text-white hover:bg-black/90 px-10 h-12 rounded-full font-pixel text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-xl"
          >
            <Link href="/auth">Launch Studio</Link>
          </Button>
        </div>
      </motion.nav>
    </div>
  );
}
