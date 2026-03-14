"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin, ArrowRight, Hash } from "lucide-react";

const BLANK_OPTIONS = [
  "YouTube Scripts",
  "Cold Emails",
  "SEO Blogs",
  "X Threads",
  "Deep Work"
];

const TIMELINE_NODES = [
  { icon: Youtube, label: "Scripts", func: "Viral Video Drafting", color: "#FF0000" },
  { icon: Twitter, label: "Tweets", func: "Viral Hook Engine", color: "#1DA1F2" },
  { icon: Hash, label: "Threads", func: "Knowledge Stacking", color: "#A36BEE" },
  { icon: Mail, label: "Mails", func: "High-CR Outreach", color: "#EA4335" },
  { icon: Instagram, label: "Posts", func: "Visual Storytelling", color: "#E4405F" },
  { icon: Linkedin, label: "Blogs", func: "Professional Authority", color: "#0A66C2" },
];

function FloatingNote({ text, className, delay = 0 }: { text: string; className: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`absolute hidden lg:block animate-float-note z-20 ${className}`}
    >
      <div className="sticky-note w-44 font-pixel text-[7px] leading-relaxed text-black/70">
        <div className="sticky-note-hole" />
        <div className="mb-2 opacity-30 uppercase text-[5px]">SYS_DRAFT: 2024</div>
        {text}
      </div>
      {/* Visual Thread connecting to the line */}
      <div className="absolute top-3 right-3 w-px h-32 bg-black/10 origin-top" />
    </motion.div>
  );
}

export function Hero() {
  const [blankIndex, setBlankIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlankIndex((prev) => (prev + 1) % BLANK_OPTIONS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center pt-32 pb-16 px-6 hero-grid overflow-hidden">
      {/* Hyper-realistic Floating Sticky Notes */}
      <FloatingNote 
        text="THREAD: 10 reasons why AI agents are the future of solopreneurship. hook: 'the office is dead...'" 
        className="top-24 left-[10%] rotate-[-6deg]" 
        delay={0.2}
      />
      <FloatingNote 
        text="SCRIPT: Opening scene shows a cinematic fly-through of a cloud city. Narration starts in 3... 2..." 
        className="top-40 right-[15%] rotate-[5deg]" 
        delay={0.5}
      />
      <FloatingNote 
        text="EMAIL: Subject: Your focus score just hit 98%. Ready to ship that feature? Skippy has the docs." 
        className="bottom-48 left-[15%] rotate-[3deg]" 
        delay={0.8}
      />
      <FloatingNote 
        text="LOG: Analysis complete. Snooks detected 89% engagement potential for this VFX breakdown." 
        className="bottom-32 right-[10%] rotate-[-4deg]" 
        delay={1.1}
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto z-10"
      >
        <h1 className="font-pixel text-xl md:text-3xl font-bold mb-4 text-foreground tracking-tighter leading-tight">
          AI AGENTIC <br />
          <span className="text-primary">MARKETING STUDIO</span>
        </h1>

        <div className="flex flex-col items-center gap-2 text-sm font-medium text-foreground/40 italic mt-6">
          <span className="font-pixel text-[8px] uppercase tracking-widest opacity-60">Ideal For</span>
          <div className="relative h-6 min-w-[200px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={BLANK_OPTIONS[blankIndex]}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute font-pixel text-[9px] text-primary font-bold"
              >
                {BLANK_OPTIONS[blankIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Horizontal Neumorphic Timeline */}
      <div className="relative mt-24 w-full max-w-6xl mx-auto px-4">
        {/* Main Black Connector Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/80 -translate-y-1/2 rounded-full" />
        
        <div className="flex justify-between items-center relative z-10">
          {TIMELINE_NODES.map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center group"
            >
              {/* Function Tag (Small Sticky Rectangle) */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mb-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="bg-[#fff9c4] px-3 py-1.5 border border-[#fbc02d]/40 shadow-sm rotate-[1deg]">
                  <p className="font-pixel text-[6px] text-black/60 whitespace-nowrap uppercase tracking-tighter">
                    {node.func}
                  </p>
                </div>
              </motion.div>

              {/* Neumorphic Node */}
              <div className="neumorphic-card-light p-3 border border-white/5 transition-all hover:scale-110 cursor-pointer bg-white">
                <div className="neumorphic-inset-light p-2.5">
                  <node.icon className="w-5 h-5" style={{ color: node.color }} />
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center mt-4">
                <span className="text-[7px] font-pixel text-black font-bold mb-1 group-hover:text-primary transition-colors uppercase tracking-widest">
                  {node.label}
                </span>
                <div className="w-0.5 h-3 bg-black/20 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.div 
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-20 opacity-20"
      >
        <ArrowRight className="rotate-90 w-6 h-6 text-black" />
      </motion.div>
    </section>
  );
}