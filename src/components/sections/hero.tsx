
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin } from "lucide-react";

const BLANK_OPTIONS = [
  "Viral YouTube Scripts",
  "Personalized Cold Emails",
  "SEO-Optimized Blogs",
  "Instagram Growth Posts",
  "X Tweet Threads",
  "Deep Work Sessions"
];

const TIMELINE_NODES = [
  { icon: Youtube, label: "Scripts", color: "#FF0000" },
  { icon: Twitter, label: "Tweets", color: "#1DA1F2" },
  { icon: Mail, label: "Mails", color: "#EA4335" },
  { icon: Instagram, label: "Posts", color: "#E4405F" },
  { icon: Linkedin, label: "Blogs", color: "#0A66C2" },
];

export function Hero() {
  const [blankIndex, setBlankIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlankIndex((prev) => (prev + 1) % BLANK_OPTIONS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-32 pb-20 px-6 hero-grid overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl mx-auto z-10"
      >
        <h1 className="font-headline text-6xl md:text-9xl font-bold leading-tight mb-8">
          AI Agentic <br />
          <span className="text-primary italic">Marketing Studio</span>
        </h1>

        <div className="flex items-center justify-center gap-3 text-2xl md:text-4xl font-medium text-foreground/60 h-12">
          <span>Use It For</span>
          <div className="relative inline-block min-w-[300px] text-left">
            <AnimatePresence mode="wait">
              <motion.span
                key={BLANK_OPTIONS[blankIndex]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 text-foreground font-headline font-bold"
              >
                {BLANK_OPTIONS[blankIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="relative mt-24 flex flex-col items-center w-full max-w-lg mx-auto">
        <div className="absolute top-0 bottom-0 w-px bg-white/10" />
        
        {TIMELINE_NODES.map((node, i) => (
          <motion.div
            key={node.label}
            initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center w-full mb-24 last:mb-0"
          >
            {/* Animated Connector Line */}
            {i < TIMELINE_NODES.length - 1 && (
              <motion.div 
                className="absolute top-full left-1/2 -translate-x-1/2 w-px bg-primary h-24 origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            )}

            <div className="neumeric-node w-16 h-16 rounded-full flex items-center justify-center z-10 border border-white/5">
              <node.icon className="w-8 h-8" style={{ color: node.color }} />
            </div>

            <motion.div
              animate={{ y: [0, -5, 0], rotate: i % 2 === 0 ? -2 : 2 }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute top-0 ${i % 2 === 0 ? 'left-[calc(50%+4rem)]' : 'right-[calc(50%+4rem)]'} w-24 h-24 bg-[#FFE566] text-[#231F2A] p-3 rounded-sm shadow-xl flex flex-col items-center justify-center rotate-[-2deg]`}
              style={{ filter: 'contrast(0.95)' }}
            >
              <div className="w-10 h-0.5 bg-black/10 absolute top-2 rounded-full" />
              <span className="font-bold text-sm tracking-tighter uppercase">{node.label}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
