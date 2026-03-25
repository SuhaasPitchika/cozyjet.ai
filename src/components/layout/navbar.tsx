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
        className="bg-sky-200/20 backdrop-blur-3xl border border-sky-100/50 max-w-4xl w-full h-20 flex items-center justify-between px-10 rounded-full shadow-[0_12px_48px_0_rgba(186,230,253,0.3)] ring-1 ring-white/60"
      >
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Image
              src="/cozyjet-logo.png"
              alt="CozyJet Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <span className="font-pixel text-xl font-bold tracking-tighter text-black uppercase">
            CozyJet
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Button
            asChild
            className="bg-black text-white hover:bg-black/90 px-10 h-14 rounded-full font-pixel text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-xl"
          >
            <Link href="/auth">Launch Studio</Link>
          </Button>
        </div>
      </motion.nav>
    </div>
  );
}
