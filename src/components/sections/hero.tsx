"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin, ArrowRight, MessageSquare, Hash } from "lucide-react";

const BLANK_OPTIONS = [
  "YouTube Scripts",
  "Cold Emails",
  "SEO Blogs",
  "X Threads",
  "Deep Work"
];

const TIMELINE_NODES = [
  { icon: Youtube, label: "Scripts", color: "#FF0000" },
  { icon: Twitter, label: "Tweets", color: "#1DA1F2" },
  { icon: Hash, label: "Threads", color: "#A36BEE" },
  { icon: Mail, label: "Mails", color: "#EA4335" },
  { icon: Instagram, label: "Posts", color: "#E4405F" },
  { icon: Linkedin, label: "Blogs", color: "#0A66C2" },
];

function FloatingNote({ text, className, delay = 0 }: { text: string; className: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`absolute hidden lg:block animate-float-note ${className}`}
    >
      <div className="sticky-note w-48 font-pixel text-[8px] leading-relaxed text-black/70">
        <div className="mb-2 opacity-30 uppercase text-[6px]">DRAFT_ID: AI_092</div>
        {text}
      </div>
    </motion.div>
  );
}

export function Hero() {
  const [blankIndex, setBlankIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlankIndex((prev) => (prev + 1) % BLANK_OPTIONS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center pt-40 pb-16 px-6 hero-grid overflow-hidden">
      {/* Hyper-realistic Sticky Notes */}
      <FloatingNote 
        text="THREAD: 10 reasons why AI agents are the future of solopreneurship. hook: 'the office is dead...'" 
        className="top-32 left-10 rotate-[-4deg]" 
        delay={0.2}
      />
      <FloatingNote 
        text="SCRIPT: Opening scene shows a cinematic fly-through of a cloud city. Narration starts in 3... 2..." 
        className="bottom-40 left-20 rotate-[3deg]" 
        delay={0.5}
      />
      <FloatingNote 
        text="TWEET: Scaling to $10k MRR with 0 employees is finally possible. Here is my tech stack: [COZYJET]" 
        className="top-48 right-12 rotate-[6deg]" 
        delay={0.8}
      />
      <FloatingNote 
        text="EMAIL: Subject: Your focus score just hit 98%. Ready to ship that feature? Skippy has the docs ready." 
        className="bottom-32 right-24 rotate-[-2deg]" 
        delay={1.1}
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto z-10"
      >
        <h1 className="font-pixel text-lg md:text-2xl font-bold mb-6 text-foreground tracking-tighter leading-snug">
          AI AGENTIC <br />
          <span className="text-primary">MARKETING STUDIO</span>
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-sm font-medium text-foreground/40 italic">
          <span className="font-pixel text-[10px]">Use It For</span>
          <div className="relative inline-block min-w-[180px] h-6">
            <AnimatePresence mode="wait">
              <motion.span
                key={BLANK_OPTIONS[blankIndex]}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 font-pixel text-[10px] text-foreground/80 font-bold"
              >
                {BLANK_OPTIONS[blankIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Horizontal Neumorphic Timeline */}
      <div className="relative mt-20 w-full max-w-5xl mx-auto px-4">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 rounded-full" />
        
        <div className="flex justify-between items-center relative z-10">
          {TIMELINE_NODES.map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="neumorphic-card-light p-4 border border-white/5 transition-all hover:scale-110 cursor-pointer group bg-white">
                <div className="neumorphic-inset-light p-3">
                  <node.icon className="w-5 h-5" style={{ color: node.color }} />
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <span className="text-[7px] font-pixel text-foreground/30 mb-1 group-hover:text-primary transition-colors uppercase tracking-widest">
                  {node.label}
                </span>
                <div className="w-0.5 h-3 bg-primary/10 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.div 
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-16 opacity-10"
      >
        <ArrowRight className="rotate-90 w-8 h-8" />
      </motion.div>
    </section>
  );
}
