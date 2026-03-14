"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-black pt-48 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <div className="flex flex-wrap justify-center gap-8 mb-20">
          {["Product", "About", "Twitter", "GitHub", "Legal"].map(item => (
            <a key={item} href="#" className="text-white/40 hover:text-white transition-colors text-sm uppercase tracking-widest font-medium">
              {item}
            </a>
          ))}
        </div>

        <div className="flex gap-4 mb-40">
          <Button variant="outline" className="rounded-full px-8 py-6 border-white/10 hover:bg-white hover:text-black">
            Log In
          </Button>
          <Button className="rounded-full px-8 py-6 bg-primary hover:bg-primary/80">
            Get Started
          </Button>
        </div>

        {/* Cinematic Big Text */}
        <div className="w-full relative">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-headline font-bold text-[15vw] leading-none tracking-tighter text-center select-none shimmer-text text-white/5"
          >
            COZYJET
          </motion.h2>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-[80vw] h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </div>
        </div>

        <div className="mt-24 flex flex-col md:flex-row justify-between w-full border-t border-white/5 pt-8 text-white/20 text-xs">
          <p>© 2024 CozyJet.AI Systems Inc.</p>
          <p className="mt-4 md:mt-0 italic">"The screen is alive, and so are we."</p>
        </div>
      </div>
    </footer>
  );
}
