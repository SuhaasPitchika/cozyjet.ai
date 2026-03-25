"use client";

import React from "react";
import { motion } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin } from "lucide-react";

const ThreadsIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M14.823 12.961c-.119.695-.454 1.208-.882 1.554a3.12 3.12 0 0 1-2.012.653c-1.454 0-2.311-.854-2.311-2.238 0-1.51.985-2.217 2.374-2.217.514 0 .964.12 1.312.338l.102-.916a2.692 2.692 0 0 0-1.446-.359c-2.1 0-3.647 1.131-3.647 3.153 0 2.257 1.512 3.438 3.535 3.438 1.057 0 1.943-.24 2.536-.783.545-.513.889-1.306.941-2.33h-1.002z" />
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c3.11 0 5.867-1.417 7.682-3.633l-.782-.625C17.28 19.721 14.777 21 12 21c-4.963 0-9-4.037-9-9s4.037-9 9-9c2.427 0 4.625.966 6.242 2.531l.711-.703A9.957 9.957 0 0 0 12 2z" />
  </svg>
);

const TIMELINE_NODES = [
  { icon: Youtube,    label: "Scripts", func: "Viral Video Drafting",    color: "#FF0000", note: "SCRIPTS"  },
  { icon: Twitter,    label: "Tweets",  func: "Viral Hook Engine",       color: "#1DA1F2", note: "TWEETS"   },
  { icon: ThreadsIcon,label: "Threads", func: "Knowledge Stacking",      color: "#111111", note: "THREADS"  },
  { icon: Mail,       label: "Mails",   func: "High-CR Outreach",        color: "#EA4335", note: "MAILS"    },
  { icon: Instagram,  label: "Posts",   func: "Visual Storytelling",     color: "#E4405F", note: "POSTS"    },
  { icon: Linkedin,   label: "Blogs",   func: "Professional Authority",  color: "#0A66C2", note: "BLOGS"    },
];

const N = TIMELINE_NODES.length;

function getArchY(t: number, h: number, controlY: number) {
  return (1 - t) * (1 - t) * h + 2 * (1 - t) * t * controlY + t * t * h;
}

const CONTAINER_H = 320;
const ARCH_CONTROL_Y = -40;
const NODE_T = Array.from({ length: N }, (_, i) => i / (N - 1));

const NODE_POSITIONS = NODE_T.map((t, i) => ({
  x: 4 + t * 92,
  y: getArchY(t, CONTAINER_H, ARCH_CONTROL_Y) / CONTAINER_H * 100,
  isTop: i <= 1 || i >= 4,
}));

const HUB_X_PCT = 50;
const HUB_Y = getArchY(0.5, CONTAINER_H, ARCH_CONTROL_Y);
const HUB_Y_PCT = HUB_Y / CONTAINER_H * 100;

function ArchSVG() {
  const vH = 320;
  const vW = 1000;
  const ctrlY = ARCH_CONTROL_Y / CONTAINER_H * vH;
  const nodeXs = NODE_POSITIONS.map(p => p.x / 100 * vW);
  const nodeYs = NODE_POSITIONS.map(p => p.y / 100 * vH);
  const hubX = HUB_X_PCT / 100 * vW;
  const hubY = HUB_Y_PCT / 100 * vH;

  const pathD = `M ${nodeXs[0]} ${vH} Q ${vW / 2} ${ctrlY} ${nodeXs[N - 1]} ${vH}`;
  const fillD = `M ${nodeXs[0]} ${vH} Q ${vW / 2} ${ctrlY} ${nodeXs[N - 1]} ${vH} L ${nodeXs[N - 1]} ${vH + 40} L ${nodeXs[0]} ${vH + 40} Z`;

  return (
    <svg
      viewBox={`0 0 ${vW} ${vH}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient id="archFill" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.45)" />
          <stop offset="55%" stopColor="rgba(96,165,250,0.22)" />
          <stop offset="100%" stopColor="rgba(219,234,254,0.06)" />
        </linearGradient>
        <linearGradient id="archLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.5)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0.9)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
        </linearGradient>
      </defs>

      <path d={fillD} fill="url(#archFill)" />
      <path d={pathD} fill="none" stroke="url(#archLine)" strokeWidth="2.5" />

      {nodeXs.map((nx, i) => (
        <line
          key={i}
          x1={hubX} y1={hubY}
          x2={nx} y2={nodeYs[i]}
          stroke="rgba(59,130,246,0.18)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
      ))}

      <circle cx={hubX} cy={hubY} r="7" fill="rgba(59,130,246,0.9)" />
      <circle cx={hubX} cy={hubY} r="12" fill="rgba(59,130,246,0.18)" />
    </svg>
  );
}

function WavyThread({ height, isTop }: { height: number; isTop: boolean }) {
  const path = isTop
    ? `M 10 0 Q 20 ${height / 4} 10 ${height / 2} Q 0 ${height * 0.75} 10 ${height}`
    : `M 10 ${height} Q 20 ${height * 0.75} 10 ${height / 2} Q 0 ${height / 4} 10 0`;
  return (
    <svg width="20" height={height}
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none opacity-30"
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
      style={{ [isTop ? "bottom" : "top"]: "155%" }}
    >
      <div className="sticky-note w-24 h-11 flex items-center justify-center border border-black/10 rounded-sm font-pixel text-[8px] leading-none text-black/70 bg-white shadow-sm">
        <div className="sticky-note-hole" />
        {text}
      </div>
      <WavyThread height={72} isTop={isTop} />
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative flex flex-col items-center pt-44 pb-10 overflow-hidden"
      style={{
        minHeight: "88vh",
        backgroundImage: "url('/hero-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center 0%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-5xl mx-auto z-10 px-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-pixel text-2xl md:text-4xl font-bold mb-5 tracking-tight uppercase"
          style={{
            color: "#0f172a",
            textShadow: "0 1px 0 rgba(255,255,255,0.6), 0 2px 20px rgba(255,255,255,0.4)",
          }}
        >
          AI AGENTIC MARKETING STUDIO
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="font-pixel text-[11px] uppercase tracking-widest"
          style={{ color: "rgba(15,23,42,0.6)", textShadow: "0 1px 8px rgba(255,255,255,0.5)" }}
        >
          The future of autonomous content creation.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-5xl mx-auto px-6 mt-14"
        style={{ height: `${CONTAINER_H}px` }}
      >
        <ArchSVG />

        {TIMELINE_NODES.map((node, i) => {
          const pos = NODE_POSITIONS[i];
          return (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.6 + Math.abs(i - 2.5) * 0.08,
                duration: 0.5,
                type: "spring",
                stiffness: 260,
                damping: 22,
              }}
              className="absolute flex flex-col items-center group"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
            >
              <StableNote text={node.note} isTop={pos.isTop} />
              <div
                className="bg-white p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:scale-115 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer relative z-30"
                style={{ width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <node.icon className="w-7 h-7" style={{ color: node.color }} />
              </div>
              <div className={`absolute ${pos.isTop ? "top-[-52px]" : "bottom-[-52px]"} opacity-0 group-hover:opacity-100 transition-opacity z-40 pointer-events-none`}>
                <div className="bg-black text-white px-2.5 py-1.5 rounded-md shadow-lg">
                  <p className="font-pixel text-[7px] whitespace-nowrap uppercase tracking-wider">
                    {node.func}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="relative z-10 mt-6 text-center"
      >
        <p
          className="font-pixel text-[9px] uppercase tracking-[0.35em]"
          style={{ color: "rgba(15,23,42,0.45)", textShadow: "0 1px 6px rgba(255,255,255,0.4)" }}
        >
          Powered by autonomous AI agents · Built for solopreneurs & startups
        </p>
      </motion.div>
    </section>
  );
}
