
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Rocket } from "lucide-react";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isOpen, setIsOpen] = useState(false);
  
  const height = useTransform(scrollY, [0, 100], ["80px", "64px"]);
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(35, 31, 42, 0)", "rgba(35, 31, 42, 0.8)"]
  );

  return (
    <motion.nav
      style={{ height, backgroundColor }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 border-b border-white/5 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <Rocket className="w-8 h-8 text-primary" />
        <span className="font-headline text-2xl font-bold tracking-tighter">
          CozyJet<span className="text-primary">.AI</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {["Features", "Agents", "Pricing"].map((item) => (
          <Link
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            {item}
          </Link>
        ))}
        <Button
          variant="outline"
          className="relative overflow-hidden group border-primary/50 hover:border-primary px-8 rounded-full"
        >
          <span className="relative z-10 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
            Explore <span className="text-xl">→</span>
          </span>
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>

      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-6 md:hidden"
        >
          {["Features", "Agents", "Pricing", "Login"].map((item) => (
            <Link
              key={item}
              href="#"
              onClick={() => setIsOpen(false)}
              className="text-2xl font-headline font-bold"
            >
              {item}
            </Link>
          ))}
          <Button className="w-full bg-primary text-white py-6 text-lg">Get Started</Button>
        </motion.div>
      )}
    </motion.nav>
  );
}
