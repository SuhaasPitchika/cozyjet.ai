
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Navbar() {
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-nav max-w-4xl w-full h-16 flex items-center justify-between px-8 rounded-full"
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
             <Image 
              src="https://picsum.photos/seed/cozyjetlogo/100/100" 
              alt="Logo" 
              width={32} 
              height={32}
              className="object-cover"
              data-ai-hint="plane cloud"
            />
          </div>
          <span className="font-headline text-xl font-bold tracking-tighter text-[#231F2A]">
            CozyJet<span className="text-primary">.AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button
            asChild
            className="bg-primary text-white hover:bg-primary/90 px-8 rounded-full font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/auth">Explore →</Link>
          </Button>
        </div>
      </motion.nav>
    </div>
  );
}
