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

const RedditIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const SlackIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
  </svg>
);

const TiktokIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const PinterestIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const DiscordIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.135 18.113a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const TIMELINE_NODES = [
  { icon: Youtube,      label: "Scripts",  func: "Viral Video Drafting",     color: "#FF0000", note: "SCRIPTS"  },
  { icon: Twitter,      label: "Tweets",   func: "Viral Hook Engine",         color: "#1DA1F2", note: "TWEETS"   },
  { icon: ThreadsIcon,  label: "Threads",  func: "Knowledge Stacking",        color: "#111111", note: "THREADS"  },
  { icon: Mail,         label: "Mails",    func: "High-CR Outreach",          color: "#EA4335", note: "MAILS"    },
  { icon: Instagram,    label: "Posts",    func: "Visual Storytelling",       color: "#E4405F", note: "POSTS"    },
  { icon: Linkedin,     label: "Blogs",    func: "Professional Authority",    color: "#0A66C2", note: "BLOGS"    },
];

const EXTRA_LOGOS = [
  { icon: RedditIcon,    color: "#FF4500", label: "Reddit" },
  { icon: SlackIcon,     color: "#4A154B", label: "Slack" },
  { icon: TiktokIcon,    color: "#000000", label: "TikTok" },
  { icon: PinterestIcon, color: "#BD081C", label: "Pinterest" },
  { icon: DiscordIcon,   color: "#5865F2", label: "Discord" },
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

function HyperrealisticNote({ text, isTop }: { text: string; isTop: boolean }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20"
      style={{ [isTop ? "bottom" : "top"]: "148%" }}
    >
      <div
        className="w-24 h-14 flex flex-col items-start justify-start px-2 pt-2 pb-1 border border-black/10 rounded-sm relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #fefce8 0%, #fef08a 60%, #fde047 100%)",
          boxShadow: "2px 3px 8px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.6), inset -1px 0 0 rgba(253,224,71,0.5)",
          transform: `rotate(${isTop ? "-1.5deg" : "1.2deg"})`,
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-5"
          style={{
            background: "linear-gradient(180deg, rgba(253,224,71,0.8) 0%, rgba(253,224,71,0.0) 100%)",
          }}
        />
        <div
          className="absolute top-0 left-0 w-full h-[3px] rounded-sm"
          style={{ background: "rgba(0,0,0,0.07)" }}
        />
        <span
          className="font-pixel text-[6.5px] leading-tight text-black/70 tracking-wide uppercase relative z-10"
          style={{ textShadow: "0 0.5px 0 rgba(0,0,0,0.1)" }}
        >
          {text}
        </span>
        <span
          className="font-pixel text-[5px] leading-tight text-black/40 relative z-10 mt-0.5"
        >
          AI-powered
        </span>
        <div
          className="absolute bottom-0 right-0 w-5 h-5"
          style={{
            background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%)",
          }}
        />
      </div>
      <WavyThread height={68} isTop={isTop} />
    </div>
  );
}

function ExtraLogosBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.6 }}
      className="flex items-center justify-center gap-4 flex-wrap px-4"
    >
      <span className="font-pixel text-[8px] uppercase tracking-[0.22em] text-white/40">Also on</span>
      {EXTRA_LOGOS.map((logo) => (
        <motion.div
          key={logo.label}
          whileHover={{ scale: 1.18, rotate: [-1, 1, 0] }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="relative group"
          title={logo.label}
        >
          <div
            className="w-8 h-8 rounded-lg bg-white/90 border border-black/10 shadow-[2px_2px_0_0_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.9)] transition-all"
          >
            <logo.icon className="w-4 h-4" style={{ color: logo.color }} />
          </div>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/90 text-white px-1.5 py-0.5 rounded text-[7px] font-pixel uppercase whitespace-nowrap">
              {logo.label}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function Hero() {
  return (
    <section
      className="relative flex flex-col items-center pt-28 pb-10 overflow-visible"
      style={{
        minHeight: "100vh",
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
              <HyperrealisticNote text={node.note} isTop={isTop} />
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

      <div className="mt-8 z-10 space-y-4">
        <ExtraLogosBar />
      </div>
    </section>
  );
}
