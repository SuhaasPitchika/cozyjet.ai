"use client";

import React from "react";
import { motion } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin, Hash } from "lucide-react";

const TIMELINE_NODES = [
  { icon: Youtube, label: "Scripts", func: "Viral Video Drafting", color: "#FF0000", note: "SCRIPTS" },
  { icon: Twitter, label: "Tweets", func: "Viral Hook Engine", color: "#1DA1F2", note: "TWEETS" },
  { icon: Hash, label: "Threads", func: "Knowledge Stacking", color: "#000000", note: "THREADS" },
  { icon: Mail, label: "Mails", func: "High-CR Outreach", color: "#EA4335", note: "MAILS" },
  { icon: Instagram, label: "Posts", func: "Visual Storytelling", color: "#E4405F", note: "POSTS" },
  { icon: Linkedin, label: "Blogs", func: "Professional Authority", color: "#0A66C2", note: "BLOGS" },
];

function WavyThread({ height, isTop }: { height: number; isTop: boolean }) {
  const path = isTop 
    ? `M 10 0 Q 20 ${height/4} 10 ${height/2} Q 0 ${height * 0.75} 10 ${height}`
    : `M 10 ${height} Q 20 ${height * 0.75} 10 ${height/2} Q 0 ${height/4} 10 0`;

  return (
    <svg 
      width="20" 
      height={height} 
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none opacity-20"
      style={{ [isTop ? 'top' : 'bottom']: '100%', marginTop: '-2px', marginBottom: '-2px' }}
    >
      <path 
        d={path} 
        fill="none" 
        stroke="black" 
        strokeWidth="1.5" 
        strokeDasharray="4 4"
        className="wavy-thread"
      />
    </svg>
  );
}

function StableNote({ 
  text, 
  isTop, 
}: { 
  text: string; 
  isTop: boolean; 
}) {
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-20`}
      style={{ 
        [isTop ? 'bottom' : 'top']: '160%',
      }}
    >
      <div className="sticky-note w-24 h-12 flex items-center justify-center border border-black/10 rounded-sm font-pixel text-[8px] leading-none text-black/70 bg-white">
        <div className="sticky-note-hole" />
        {text}
      </div>
      <WavyThread height={80} isTop={isTop} />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-[120vh] flex flex-col items-center pt-64 pb-0 hero-grid overflow-hidden">
      {/* Background Subtle Glow Layers */}
      <div className="absolute inset-0 blue-glow pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-sky-400/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-48 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl mx-auto z-10"
      >
        <h1 className="font-pixel text-xl md:text-3xl font-bold mb-6 text-black tracking-tight uppercase">
          AI AGENTIC MARKETING STUDIO
        </h1>
        <p className="font-pixel text-[10px] text-black/40 uppercase tracking-widest">
          The future of autonomous content creation.
        </p>
      </motion.div>

      {/* Horizontal Timeline */}
      <div className="relative mt-48 w-full max-w-6xl mx-auto px-12 pb-32">
        {/* Main Connector Line - Passes exactly through center back of each icon */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-black/80 -translate-y-1/2 z-0" />
        
        <div className="flex justify-between items-center relative z-10">
          {TIMELINE_NODES.map((node, i) => {
            const isTop = i % 2 === 0;
            return (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center group relative"
              >
                {/* Threaded Stable Note */}
                <StableNote text={node.note} isTop={isTop} />

                {/* Branded Logo Node - bg-white hides the line behind it */}
                <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-110 cursor-pointer relative z-30">
                  <node.icon className="w-6 h-6" style={{ color: node.color }} />
                </div>
                
                {/* Tooltip Description */}
                <div className={`absolute ${isTop ? 'top-[-45px]' : 'bottom-[-45px]'} opacity-0 group-hover:opacity-100 transition-opacity z-40 pointer-events-none`}>
                  <div className="bg-black text-white px-2 py-1 rounded-sm">
                    <p className="font-pixel text-[6px] whitespace-nowrap uppercase tracking-tighter">
                      {node.func}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}