"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin } from "lucide-react";

const ThreadsIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M14.823 12.961c-.119.695-.454 1.208-.882 1.554a3.12 3.12 0 0 1-2.012.653c-1.454 0-2.311-.854-2.311-2.238 0-1.51.985-2.217 2.374-2.217.514 0 .964.12 1.312.338l.102-.916a2.692 2.692 0 0 0-1.446-.359c-2.1 0-3.647 1.131-3.647 3.153 0 2.257 1.512 3.438 3.535 3.438 1.057 0 1.943-.24 2.536-.783.545-.513.889-1.306.941-2.33h-1.002z" />
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c3.11 0 5.867-1.417 7.682-3.633l-.782-.625C17.28 19.721 14.777 21 12 21c-4.963 0-9-4.037-9-9s4.037-9 9-9c2.427 0 4.625.966 6.242 2.531l.711-.703A9.957 9.957 0 0 0 12 2z" />
  </svg>
);

const TIMELINE_NODES = [
  { icon: Youtube,     label: "Scripts", func: "Viral Video Drafting",   color: "#FF0000", note: "SCRIPTS"  },
  { icon: Twitter,     label: "Tweets",  func: "Viral Hook Engine",      color: "#1DA1F2", note: "TWEETS"   },
  { icon: ThreadsIcon, label: "Threads", func: "Knowledge Stacking",     color: "#111111", note: "THREADS"  },
  { icon: Mail,        label: "Mails",   func: "High-CR Outreach",       color: "#EA4335", note: "MAILS"    },
  { icon: Instagram,   label: "Posts",   func: "Visual Storytelling",    color: "#E4405F", note: "POSTS"    },
  { icon: Linkedin,    label: "Blogs",   func: "Professional Authority", color: "#0A66C2", note: "BLOGS"    },
];

const SUBTITLES = [
  "Turn your work into viral content — automatically.",
  "Three AI agents. One studio. Zero extra effort.",
  "From git commit to Twitter thread in seconds.",
  "Your co-pilot for content, growth & deep work.",
  "Built for solopreneurs who ship fast and market smarter.",
];

function AnimatedSubtitle() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % SUBTITLES.length), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="font-pixel text-[10px] md:text-[12px] uppercase tracking-[0.2em] text-center"
        style={{
          color: "rgba(255,255,255,0.78)",
          textShadow: "0 1px 12px rgba(0,0,0,0.5)",
          minHeight: "1.4em",
        }}
      >
        {SUBTITLES[idx]}
      </motion.p>
    </AnimatePresence>
  );
}

/* ────────────── Arch maths ────────────── */
const VW = 1000;
const VH = 280;
const P0 = [50, 220] as const;
const P1 = [500, 40] as const;
const P2 = [950, 220] as const;

function bzAt(t: number) {
  const x = (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0];
  const y = (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1];
  return { x, y, xPct: (x / VW) * 100, yPct: (y / VH) * 100 };
}

const NODE_T   = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
const NODE_PTS = NODE_T.map(bzAt);
const HUB_PT   = bzAt(0.5);

function ArchSVG() {
  const pathD = `M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`;
  const fillD = `${pathD} L ${P2[0]} ${VH + 20} L ${P0[0]} ${VH + 20} Z`;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient id="hArchFill" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.38)" />
          <stop offset="60%" stopColor="rgba(147,197,253,0.16)" />
          <stop offset="100%" stopColor="rgba(219,234,254,0.03)" />
        </linearGradient>
        <linearGradient id="hArchLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.3)" />
          <stop offset="50%"  stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
        </linearGradient>
      </defs>

      <path d={fillD} fill="url(#hArchFill)" />
      <path d={pathD} fill="none" stroke="url(#hArchLine)" strokeWidth="2" />

      {NODE_PTS.map((pt, i) => (
        <line
          key={i}
          x1={HUB_PT.x} y1={HUB_PT.y}
          x2={pt.x}     y2={pt.y}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.2"
          strokeDasharray="5 5"
        />
      ))}

      <circle cx={HUB_PT.x} cy={HUB_PT.y} r="8"  fill="rgba(59,130,246,1)"    />
      <circle cx={HUB_PT.x} cy={HUB_PT.y} r="16" fill="rgba(59,130,246,0.18)" />
    </svg>
  );
}

function WavyThread({ height, isTop }: { height: number; isTop: boolean }) {
  const path = isTop
    ? `M 10 0 Q 20 ${height / 4} 10 ${height / 2} Q 0 ${height * 0.75} 10 ${height}`
    : `M 10 ${height} Q 20 ${height * 0.75} 10 ${height / 2} Q 0 ${height / 4} 10 0`;
  return (
    <svg
      width="20" height={height}
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none opacity-40"
      style={{ [isTop ? "top" : "bottom"]: "100%", marginTop: "-2px", marginBottom: "-2px" }}
    >
      <path d={path} fill="none" stroke="black" strokeWidth="1.5" strokeDasharray="4 4" />
    </svg>
  );
}

function StableNote({ text, isTop }: { text: string; isTop: boolean }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20"
      style={{ [isTop ? "bottom" : "top"]: "148%" }}
    >
      <div className="sticky-note w-20 h-10 flex items-center justify-center border border-black/10 rounded-sm font-pixel text-[7px] leading-none text-black/70 bg-white/95 shadow-sm">
        <div className="sticky-note-hole" />
        {text}
      </div>
      <WavyThread height={68} isTop={isTop} />
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative flex flex-col items-center pt-28 pb-6 overflow-visible"
      style={{
        minHeight: "90vh",
        backgroundImage: "url('/hero-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center 18%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-center max-w-4xl mx-auto z-10 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-pixel text-3xl md:text-5xl font-bold mb-5 tracking-tight uppercase"
          style={{
            color: "#ffffff",
            textShadow: "0 2px 0 rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.45), 0 0 60px rgba(0,0,0,0.2)",
          }}
        >
          AI AGENTIC MARKETING STUDIO
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="h-8 flex items-center justify-center"
        >
          <AnimatedSubtitle />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-5xl mx-auto px-8 mt-6"
        style={{ height: `${VH}px` }}
      >
        <ArchSVG />

        {TIMELINE_NODES.map((node, i) => {
          const pt    = NODE_PTS[i];
          const isTop = i === 0 || i === 1 || i === 4 || i === 5;
          return (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.55 + Math.abs(i - 2.5) * 0.07,
                duration: 0.5,
                type: "spring",
                stiffness: 280,
                damping: 20,
              }}
              className="absolute flex flex-col items-center group"
              style={{
                left: `${pt.xPct}%`,
                top: `${pt.yPct}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
            >
              <StableNote text={node.note} isTop={isTop} />
              <div
                className="bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 hover:scale-110 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-pointer relative z-30 flex items-center justify-center"
                style={{ width: "52px", height: "52px" }}
              >
                <node.icon className="w-6 h-6" style={{ color: node.color }} />
              </div>
              <div
                className={`absolute ${isTop ? "top-[-48px]" : "bottom-[-48px]"} opacity-0 group-hover:opacity-100 transition-opacity z-40 pointer-events-none`}
              >
                <div className="bg-black/90 text-white px-2 py-1 rounded-md shadow-xl">
                  <p className="font-pixel text-[6px] whitespace-nowrap uppercase tracking-wider">
                    {node.func}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
