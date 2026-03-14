"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin, Hash } from "lucide-react";

const BLANK_OPTIONS = [
  "YouTube Scripts",
  "Cold Emails",
  "SEO Blogs",
  "X Threads",
  "Deep Work"
];

const TIMELINE_NODES = [
  { icon: Youtube, label: "Scripts", func: "Viral Video Drafting", color: "#FF0000", note: "SCRIPT: Cinematic opening scene at dawn..." },
  { icon: Twitter, label: "Tweets", func: "Viral Hook Engine", color: "#1DA1F2", note: "THREAD: 10 reasons AI agents are the future." },
  { icon: Hash, label: "Threads", func: "Knowledge Stacking", color: "#A36BEE", note: "X: The office is officially dead..." },
  { icon: Mail, label: "Mails", func: "High-CR Outreach", color: "#EA4335", note: "EMAIL: Your focus score just hit 98%!" },
  { icon: Instagram, label: "Posts", func: "Visual Storytelling", color: "#E4405F", note: "LOG: Snooks detected 89% engagement." },
  { icon: Linkedin, label: "Blogs", func: "Professional Authority", color: "#0A66C2", note: "BLOG: Building the autonomous studio." },
];

function WavyThread({ fromY, toY, isTop }: { fromY: number; toY: number; isTop: boolean }) {
  // Simple wavy SVG path
  const height = Math.abs(toY - fromY);
  const midY = height / 2;
  const path = isTop 
    ? `M 10 0 Q 20 ${midY/2} 10 ${midY} Q 0 ${midY * 1.5} 10 ${height}`
    : `M 10 ${height} Q 20 ${midY * 1.5} 10 ${midY} Q 0 ${midY/2} 10 0`;

  return (
    <svg 
      width="20" 
      height={height} 
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none opacity-20"
      style={{ [isTop ? 'top' : 'bottom']: '100%', marginTop: isTop ? '-4px' : '0', marginBottom: isTop ? '0' : '-4px' }}
    >
      <path 
        d={path} 
        fill="none" 
        stroke="black" 
        strokeWidth="1" 
        className="wavy-thread"
      />
    </svg>
  );
}

function FloatingNote({ 
  text, 
  isTop, 
  index 
}: { 
  text: string; 
  isTop: boolean; 
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: isTop ? 20 : -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`absolute left-1/2 -translate-x-1/2 z-20 animate-float-note`}
      style={{ 
        [isTop ? 'bottom' : 'top']: '140%',
        animationDelay: `${index * 0.5}s`
      }}
    >
      <div className="sticky-note w-32 rotate-[-2deg] font-pixel text-[6px] leading-tight text-black/60">
        <div className="sticky-note-hole" />
        <div className="mb-1 opacity-20 uppercase text-[4px] tracking-tighter">COZYJET_DRAFT</div>
        {text}
      </div>
      <WavyThread fromY={0} toY={80} isTop={isTop} />
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
    <section className="relative min-h-[70vh] flex flex-col items-center pt-32 pb-16 px-6 hero-grid overflow-hidden bg-white">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto z-10"
      >
        <h1 className="font-pixel text-lg md:text-2xl font-bold mb-6 text-black tracking-tighter leading-tight uppercase">
          AI AGENTIC <br />
          <span className="text-primary bg-primary/10 px-2">MARKETING STUDIO</span>
        </h1>

        <div className="flex items-center justify-center gap-4 text-[9px] font-pixel text-foreground/30 uppercase tracking-widest">
          <span>IDEAL FOR</span>
          <div className="relative h-6 min-w-[150px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={BLANK_OPTIONS[blankIndex]}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute text-primary font-bold whitespace-nowrap"
              >
                {BLANK_OPTIONS[blankIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Horizontal Timeline */}
      <div className="relative mt-40 w-full max-w-5xl mx-auto px-10">
        {/* Main Connector Line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-black/10 -translate-y-1/2" />
        
        <div className="flex justify-between items-center relative z-10">
          {TIMELINE_NODES.map((node, i) => {
            const isTop = i % 2 === 0;
            return (
              <motion.div
                key={node.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center group relative"
              >
                {/* Floating Note above or below */}
                <FloatingNote text={node.note} isTop={isTop} index={i} />

                {/* Function Tag (Small Sticky Rectangle) */}
                <div className={`absolute ${isTop ? 'top-[-45px]' : 'bottom-[-45px]'} opacity-0 group-hover:opacity-100 transition-opacity z-30`}>
                  <div className="bg-[#fff9c4] px-2 py-1 border border-[#fbc02d]/40 shadow-sm rotate-[1deg]">
                    <p className="font-pixel text-[5px] text-black/40 whitespace-nowrap uppercase tracking-tighter">
                      {node.func}
                    </p>
                  </div>
                </div>

                {/* Neumorphic Node */}
                <div className="neumorphic-card-light p-3 border border-white/5 transition-all hover:scale-110 cursor-pointer bg-white relative">
                  <div className="neumorphic-inset-light p-2.5">
                    <node.icon className="w-5 h-5" style={{ color: node.color }} />
                  </div>
                  {/* Connection Node Point */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black/10 rounded-full" />
                </div>
                
                <div className="flex flex-col items-center text-center mt-4">
                  <span className="text-[7px] font-pixel text-black/40 font-bold mb-1 uppercase tracking-widest">
                    {node.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
