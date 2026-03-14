"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function Navbar() {
  const logo = PlaceHolderImages.find(img => img.id === "cozyjetlogo");

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-sky-200/20 backdrop-blur-2xl border border-sky-100/50 max-w-2xl w-full h-14 flex items-center justify-between px-6 rounded-full shadow-[0_8px_32px_0_rgba(186,230,253,0.25)] ring-1 ring-white/40"
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
             <Image 
              src={logo?.imageUrl || "https://picsum.photos/seed/cozyjetlogo/100/100"} 
              alt="Logo" 
              width={32} 
              height={32}
              className="object-contain"
              data-ai-hint="plane cloud"
            />
          </div>
          <span className="font-pixel text-[10px] font-bold tracking-tighter text-black">
            CozyJet
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button
            asChild
            className="bg-black text-white hover:bg-black/90 px-6 h-9 rounded-full font-pixel text-[8px] transition-all hover:scale-105"
          >
            <Link href="/auth">Explore</Link>
          </Button>
        </div>
      </motion.nav>
    </div>
  );
}
