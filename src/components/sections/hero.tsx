
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin, ArrowRight } from "lucide-react";

const BLANK_OPTIONS = [
  "Viral YouTube Scripts",
  "Cold Emails",
  "SEO Blogs",
  "X Threads",
  "Deep Work"
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
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-48 pb-20 px-6 hero-grid overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl mx-auto z-10"
      >
        <h1 className="pixel-text text-xl md:text-3xl font-bold mb-12 animate-typewriter text-primary/90 leading-relaxed max-w-3xl mx-auto">
          AI Agentic <br />
          <span className="text-white">Marketing Studio</span>
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-lg md:text-xl font-medium text-foreground/40 h-24 italic animate-drift">
          <span>Use It For</span>
          <div className="relative inline-block min-w-[240px] text-center md:text-left">
            <AnimatePresence mode="wait">
              <motion.span
                key={BLANK_OPTIONS[blankIndex]}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute md:relative left-0 right-0 text-foreground/80 font-bold"
              >
                {BLANK_OPTIONS[blankIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Horizontal Neumorphic Timeline */}
      <div className="relative mt-32 w-full max-w-6xl mx-auto">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2" />
        
        <div className="flex justify-between items-center relative z-10">
          {TIMELINE_NODES.map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="neumorphic-card p-6 border border-white/5 transition-all hover:scale-110 cursor-pointer group">
                <div className="neumorphic-inset p-4">
                  <node.icon className="w-8 h-8" style={{ color: node.color }} />
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <span className="text-[10px] pixel-text text-white/30 mb-2 group-hover:text-primary transition-colors">
                  {node.label}
                </span>
                <div className="w-1 h-4 bg-primary/20 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-24 opacity-20"
      >
        <ArrowRight className="rotate-90 w-10 h-10" />
      </motion.div>
    </section>
  );
}
