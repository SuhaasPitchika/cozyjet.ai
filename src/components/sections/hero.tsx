"use client";

import React from "react";
import { motion } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin, Hash } from "lucide-react";

const IDEAL_FOR = [
  "YouTube Scripts",
  "Cold Emails",
  "SEO Blogs",
  "X Threads",
  "Deep Work"
];

const TIMELINE_NODES = [
  { icon: Youtube, label: "Scripts", func: "Viral Video Drafting", color: "#333", note: "SCRIPT: Cinematic opening scene..." },
  { icon: Twitter, label: "Tweets", func: "Viral Hook Engine", color: "#333", note: "THREAD: 10 reasons AI is key." },
  { icon: Hash, label: "Threads", func: "Knowledge Stacking", color: "#333", note: "X: The office is dead." },
  { icon: Mail, label: "Mails", func: "High-CR Outreach", color: "#333", note: "EMAIL: Focus score hit 98%!" },
  { icon: Instagram, label: "Posts", func: "Visual Storytelling", color: "#333", note: "LOG: Snooks detected trend." },
  { icon: Linkedin, label: "Blogs", func: "Professional Authority", color: "#333", note: "BLOG: Building the studio." },
];

function WavyThread({ height, isTop }: { height: number; isTop: boolean }) {
  const path = isTop 
    ? `M 10 0 Q 20 ${height/4} 10 ${height/2} Q 0 ${height * 0.75} 10 ${height}`
    : `M 10 ${height} Q 20 ${height * 0.75} 10 ${height/2} Q 0 ${height/4} 10 0`;

  return (
    <svg 
      width="20" 
      height={height} 
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none opacity-10"
      style={{ [isTop ? 'top' : 'bottom']: '100%', marginTop: '-2px', marginBottom: '-2px' }}
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
      initial={{ opacity: 0, y: isTop ? 10 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute left-1/2 -translate-x-1/2 z-20 animate-float-note`}
      style={{ 
        [isTop ? 'bottom' : 'top']: '130%',
        animationDelay: `${index * 0.8}s`
      }}
    >
      <div className="sticky-note w-32 border border-black/5 rounded-sm font-pixel text-[6px] leading-relaxed text-black/50">
        <div className="sticky-note-hole" />
        <div className="mb-1 opacity-20 uppercase text-[4px] tracking-tighter">COZYJET_DRAFT</div>
        {text}
      </div>
      <WavyThread height={60} isTop={isTop} />
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-[60vh] flex flex-col items-center pt-32 pb-16 px-6 hero-grid overflow-hidden bg-white">
      {/* Background Bluish Glow */}
      <div className="absolute inset-0 blue-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl mx-auto z-10"
      >
        <h1 className="font-pixel text-xl md:text-3xl font-bold mb-8 text-black tracking-tight uppercase whitespace-nowrap">
          AI AGENTIC MARKETING STUDIO
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[8px] font-pixel text-black/40 uppercase tracking-widest">
          <span>IDEAL FOR</span>
          <div className="flex gap-4">
            {IDEAL_FOR.map((item, i) => (
              <span key={item} className="text-black/20 hover:text-black/60 transition-colors">
                {item}
                {i < IDEAL_FOR.length - 1 && <span className="ml-4 opacity-10">/</span>}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Horizontal Timeline */}
      <div className="relative mt-44 w-full max-w-6xl mx-auto px-12">
        {/* Main Connector Line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-black/5 -translate-y-1/2" />
        
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
                {/* Stable Threaded Note */}
                <FloatingNote text={node.note} isTop={isTop} index={i} />

                {/* Descriptive Function Note */}
                <div className={`absolute ${isTop ? 'top-[-30px]' : 'bottom-[-30px]'} opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none`}>
                  <div className="bg-white px-2 py-1 border border-black/10 shadow-sm rounded-sm">
                    <p className="font-pixel text-[5px] text-black/40 whitespace-nowrap uppercase tracking-tighter">
                      {node.func}
                    </p>
                  </div>
                </div>

                {/* Neumorphic Node */}
                <div className="neumorphic-card-light p-3 border border-black/5 transition-all hover:scale-105 cursor-pointer bg-white relative">
                  <div className="neumorphic-inset-light p-2.5">
                    <node.icon className="w-5 h-5 opacity-60" style={{ color: node.color }} />
                  </div>
                </div>
                
                <div className="flex flex-col items-center text-center mt-4">
                  <span className="text-[7px] font-pixel text-black/30 font-bold mb-1 uppercase tracking-widest">
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