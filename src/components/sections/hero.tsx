"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Twitter, Mail, Instagram, Linkedin } from "lucide-react";

const ThreadsIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 192 192" fill="currentColor" className={className} style={style}>
    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.9276C147.036 9.60354 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C110.107 98.468 114.996 98.9993 119.474 99.9981C117.6 123.74 108.977 128.936 98.4405 129.507Z"/>
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

const ALL_NODES = [
  { icon: Youtube,     label: "YouTube",   color: "#FF0000", tag: "Scripts" },
  { icon: Twitter,     label: "Twitter",   color: "#1DA1F2", tag: "Tweets" },
  { icon: RedditIcon,  label: "Reddit",    color: "#FF4500", tag: "Audience" },
  { icon: TiktokIcon,  label: "TikTok",    color: "#010101", tag: "ShortForm" },
  { icon: ThreadsIcon, label: "Threads",   color: "#111111", tag: "Micro Stories" },
  { icon: Mail,        label: "Email",     color: "#EA4335", tag: "Gmails" },
  { icon: Instagram,   label: "Instagram", color: "#E4405F", tag: "Posts" },
  { icon: SlackIcon,   label: "Slack",     color: "#4A154B", tag: "Pro Messages" },
  { icon: Linkedin,    label: "LinkedIn",  color: "#0A66C2", tag: "Blogs" },
];

const SUBTITLES = [
  "Turn your work into viral content — automatically.",
  "Three AI agents. One studio. Zero extra effort.",
  "From idea to Twitter thread in seconds.",
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
        style={{ color: "rgba(255,255,255,0.78)", textShadow: "0 1px 12px rgba(0,0,0,0.5)", minHeight: "1.4em" }}
      >
        {SUBTITLES[idx]}
      </motion.p>
    </AnimatePresence>
  );
}

const VW = 1000;
const VH = 320;
const P0 = [30,  280] as const;
const P1 = [500, 30]  as const;
const P2 = [970, 280] as const;

function bzAt(t: number) {
  const x = (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0];
  const y = (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1];
  return { x, y, xPct: (x / VW) * 100, yPct: (y / VH) * 100 };
}

const N = ALL_NODES.length;
const NODE_T   = ALL_NODES.map((_, i) => i / (N - 1));
const NODE_PTS = NODE_T.map(bzAt);
const HUB_IDX  = Math.floor(N / 2);
const HUB_PT   = NODE_PTS[HUB_IDX];

function ArchSVG() {
  const pathD = `M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`;
  const fillD = `${pathD} L ${P2[0]} ${VH + 20} L ${P0[0]} ${VH + 20} Z`;
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id="hArchFill" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.32)" />
          <stop offset="60%" stopColor="rgba(147,197,253,0.12)" />
          <stop offset="100%" stopColor="rgba(219,234,254,0.02)" />
        </linearGradient>
        <linearGradient id="hArchLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.3)" />
          <stop offset="50%"  stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
        </linearGradient>
        <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(59,130,246,0.6)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0)" />
        </radialGradient>
      </defs>
      <path d={fillD} fill="url(#hArchFill)" />
      <path d={pathD} fill="none" stroke="url(#hArchLine)" strokeWidth="2.5" />
      {NODE_PTS.map((pt, i) => {
        if (i === HUB_IDX) return null;
        return (
          <line key={i} x1={HUB_PT.x} y1={HUB_PT.y} x2={pt.x} y2={pt.y}
            stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5 5" />
        );
      })}
      <circle cx={HUB_PT.x} cy={HUB_PT.y} r="36" fill="url(#hubGlow)" />
      <circle cx={HUB_PT.x} cy={HUB_PT.y} r="18" fill="rgba(59,130,246,0.22)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
    </svg>
  );
}

function TagLabel({ tag, isAbove }: { tag: string; isAbove: boolean }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
      style={{ [isAbove ? "bottom" : "top"]: "calc(100% + 6px)" }}
    >
      {!isAbove && (
        <div className="w-px h-5 border-l-2 border-dashed border-white/40" />
      )}
      <div
        className="px-2 py-1 font-bold uppercase whitespace-nowrap"
        style={{
          background: "#fffbeb",
          border: "2px solid rgba(0,0,0,0.85)",
          boxShadow: "2px 2px 0px rgba(0,0,0,0.9)",
          fontSize: 8,
          fontFamily: "'Courier New', monospace",
          color: "#111",
          letterSpacing: "0.08em",
          imageRendering: "pixelated",
        }}
      >
        {tag}
      </div>
      {isAbove && (
        <div className="w-px h-5 border-l-2 border-dashed border-white/40" />
      )}
    </div>
  );
}

function ComicCloudBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
      className="absolute z-30"
      style={{ left: "2%", top: "-15%" }}
    >
      <div className="relative">
        <div
          className="px-4 py-3 font-bold uppercase text-center"
          style={{
            background: "#ffffff",
            border: "3px solid #000",
            boxShadow: "4px 4px 0px #000",
            fontSize: 11,
            fontFamily: "'Courier New', monospace",
            letterSpacing: "0.1em",
            color: "#000",
            imageRendering: "pixelated",
            minWidth: 100,
          }}
        >
          USE IT<br />FOR ↓
        </div>
        <div
          className="absolute"
          style={{
            bottom: -18,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "18px solid #000",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: -13,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "14px solid #fff",
          }}
        />
        {[
          { size: 14, bottom: -28, left: "44%" },
          { size: 10, bottom: -38, left: "38%" },
          { size: 7, bottom: -46, left: "33%" },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-none"
            style={{
              width: dot.size,
              height: dot.size,
              bottom: dot.bottom,
              left: dot.left,
              background: "#fff",
              border: "2px solid #000",
              imageRendering: "pixelated",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section
      className="relative flex flex-col items-center overflow-visible"
      style={{
        minHeight: "100vh",
        paddingTop: "7rem",
        paddingBottom: "2.5rem",
        backgroundImage: "url('/hero-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center 18%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-center max-w-4xl mx-auto z-10 px-4 mt-6">
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-pixel text-3xl md:text-5xl font-bold mb-5 tracking-tight uppercase"
          style={{
            color: "#ffffff",
            textShadow: "0 2px 0 rgba(0,0,0,0.8), 0 4px 32px rgba(0,0,0,0.7), 0 8px 48px rgba(0,0,0,0.5), 0 0 80px rgba(0,0,0,0.35)",
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
        className="relative w-full max-w-6xl mx-auto px-4 mt-28"
        style={{ height: `${VH}px` }}
      >
        <ComicCloudBubble />
        <ArchSVG />

        {ALL_NODES.map((node, i) => {
          const pt    = NODE_PTS[i];
          const isHub = i === HUB_IDX;
          const isAbove = i % 2 === 0;

          return (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.5 + Math.abs(i - HUB_IDX) * 0.06,
                duration: 0.45,
                type: "spring",
                stiffness: 300,
                damping: 22,
              }}
              className="absolute flex flex-col items-center group"
              style={{
                left: `${pt.xPct}%`,
                top: `${pt.yPct}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isHub ? 20 : 10,
              }}
            >
              <TagLabel tag={node.tag} isAbove={isAbove} />

              <div
                className="rounded-xl border-2 border-black transition-all duration-150 hover:scale-110 cursor-pointer relative z-30 flex items-center justify-center"
                style={{
                  width: isHub ? "88px" : "72px",
                  height: isHub ? "88px" : "72px",
                  background: isHub ? "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)" : "#ffffff",
                  boxShadow: isHub
                    ? "5px 5px 0px 0px rgba(0,0,0,1), 0 0 28px rgba(59,130,246,0.5)"
                    : "4px 4px 0px 0px rgba(0,0,0,1)",
                }}
              >
                <node.icon
                  className={isHub ? "w-11 h-11" : "w-9 h-9"}
                  style={{ color: node.color }}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
