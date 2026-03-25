"use client";

import React from "react";
import { motion } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin } from "lucide-react";

const ThreadsIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
  >
    <path d="M14.823 12.961c-.119.695-.454 1.208-.882 1.554a3.12 3.12 0 0 1-2.012.653c-1.454 0-2.311-.854-2.311-2.238 0-1.51.985-2.217 2.374-2.217.514 0 .964.12 1.312.338l.102-.916a2.692 2.692 0 0 0-1.446-.359c-2.1 0-3.647 1.131-3.647 3.153 0 2.257 1.512 3.438 3.535 3.438 1.057 0 1.943-.24 2.536-.783.545-.513.889-1.306.941-2.33h-1.002z" />
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c3.11 0 5.867-1.417 7.682-3.633l-.782-.625C17.28 19.721 14.777 21 12 21c-4.963 0-9-4.037-9-9s4.037-9 9-9c2.427 0 4.625.966 6.242 2.531l.711-.703A9.957 9.957 0 0 0 12 2z" />
  </svg>
);

const TIMELINE_NODES = [
  { icon: Youtube, label: "Scripts", func: "Viral Video Drafting", color: "#FF0000", note: "SCRIPTS" },
  { icon: Twitter, label: "Tweets", func: "Viral Hook Engine", color: "#1DA1F2", note: "TWEETS" },
  { icon: ThreadsIcon, label: "Threads", func: "Knowledge Stacking", color: "#000000", note: "THREADS" },
  { icon: Mail, label: "Mails", func: "High-CR Outreach", color: "#EA4335", note: "MAILS" },
  { icon: Instagram, label: "Posts", func: "Visual Storytelling", color: "#E4405F", note: "POSTS" },
  { icon: Linkedin, label: "Blogs", func: "Professional Authority", color: "#0A66C2", note: "BLOGS" },
];

function WavyThread({ height, isTop }: { height: number; isTop: boolean }) {
  const path = isTop
    ? `M 10 0 Q 20 ${height / 4} 10 ${height / 2} Q 0 ${height * 0.75} 10 ${height}`
    : `M 10 ${height} Q 20 ${height * 0.75} 10 ${height / 2} Q 0 ${height / 4} 10 0`;

  return (
    <svg
      width="20"
      height={height}
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none opacity-20"
      style={{ [isTop ? "top" : "bottom"]: "100%", marginTop: "-2px", marginBottom: "-2px" }}
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
        [isTop ? "bottom" : "top"]: "160%",
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

function CurvedTimelineBg({ width }: { width?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 140"
      preserveAspectRatio="none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient id="curveBlueGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.28)" />
          <stop offset="60%" stopColor="rgba(147,197,253,0.15)" />
          <stop offset="100%" stopColor="rgba(219,234,254,0.04)" />
        </linearGradient>
        <linearGradient id="curveLineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.6)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0.9)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
        </linearGradient>
      </defs>
      <path
        d="M 0 70 Q 250 44 500 38 Q 750 44 1000 70 L 1000 140 L 0 140 Z"
        fill="url(#curveBlueGrad)"
      />
      <path
        d="M 0 70 Q 250 44 500 38 Q 750 44 1000 70"
        fill="none"
        stroke="url(#curveLineGrad)"
        strokeWidth="2"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section
      className="relative min-h-[110vh] flex flex-col items-center pt-48 pb-24 hero-grid overflow-hidden"
      style={{
        backgroundImage: "url('/hero-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/55 pointer-events-none z-0" />
      <div className="absolute inset-0 blue-glow pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-sky-400/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-48 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl mx-auto z-10"
      >
        <h1 className="font-pixel text-xl md:text-3xl font-bold mb-6 text-black tracking-tight uppercase drop-shadow-sm">
          AI AGENTIC MARKETING STUDIO
        </h1>
        <p className="font-pixel text-[10px] text-black/60 uppercase tracking-widest">
          The future of autonomous content creation.
        </p>
      </motion.div>

      <div className="relative mt-24 w-full max-w-6xl mx-auto px-12 pb-24">
        <div className="relative flex items-center" style={{ minHeight: "140px" }}>
          <CurvedTimelineBg />

          <div className="w-full flex justify-between items-center relative" style={{ zIndex: 10 }}>
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
                  <StableNote text={node.note} isTop={isTop} />
                  <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-110 cursor-pointer relative z-30">
                    <node.icon className="w-6 h-6" style={{ color: node.color }} />
                  </div>
                  <div className={`absolute ${isTop ? "top-[-45px]" : "bottom-[-45px]"} opacity-0 group-hover:opacity-100 transition-opacity z-40 pointer-events-none`}>
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
      </div>

      <div className="relative z-10 mt-8 text-center max-w-2xl mx-auto px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-pixel text-[9px] uppercase tracking-[0.3em] text-black/40"
        >
          Powered by autonomous AI agents · Built for solopreneurs & startups
        </motion.p>
      </div>
    </section>
  );
}
