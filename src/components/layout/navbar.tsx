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
        className="max-w-4xl w-full h-20 flex items-center justify-between px-8 rounded-full"
        style={{
          background: "rgba(8, 18, 48, 0.38)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(100, 160, 255, 0.28)",
          boxShadow: "0 8px 40px rgba(0, 40, 120, 0.22), 0 2px 0 rgba(255,255,255,0.08) inset, 0 0 80px rgba(59,130,246,0.08)",
        }}
      >
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-24 h-24 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/cozyjet-logo.png"
              alt="CozyJet Logo"
              width={96}
              height={96}
              className="object-contain drop-shadow-[0_0_12px_rgba(100,160,255,0.5)]"
              style={{ width: "96px", height: "96px" }}
            />
          </div>
          <span className="font-pixel text-lg font-bold tracking-tighter text-white uppercase"
            style={{ textShadow: "0 0 20px rgba(100,160,255,0.6)" }}>
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
