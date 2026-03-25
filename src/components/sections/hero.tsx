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

const ALL_NODES = [
  { icon: Youtube,       label: "YouTube",   func: "Viral Video Drafting",    color: "#FF0000",
    noteTitle: "VIDEO",       noteLines: ["Hook + Script", "Title & SEO", "Retention loops"] },
  { icon: Twitter,       label: "Twitter",   func: "Viral Hook Engine",       color: "#1DA1F2",
    noteTitle: "TWEETS",      noteLines: ["Viral hooks", "8–12 tweet threads", "Engagement bait"] },
  { icon: RedditIcon,    label: "Reddit",    func: "Community Engagement",    color: "#FF4500",
    noteTitle: "REDDIT",      noteLines: ["Community-native", "Upvote psychology", "No-promo tone"] },
  { icon: TiktokIcon,    label: "TikTok",    func: "Short-Form Content",      color: "#010101",
    noteTitle: "TIKTOK",      noteLines: ["Trending hooks", "60-sec scripts", "Retention cuts"] },
  { icon: ThreadsIcon,   label: "Threads",   func: "Knowledge Stacking",      color: "#111111",
    noteTitle: "THREADS",     noteLines: ["Micro-stories", "Knowledge drops", "Reply bait"] },
  { icon: Mail,          label: "Email",     func: "High-CR Outreach",        color: "#EA4335",
    noteTitle: "EMAIL",       noteLines: ["Subject A/B lines", "Cold sequences", "High-CR funnels"] },
  { icon: Instagram,     label: "Instagram", func: "Visual Storytelling",     color: "#E4405F",
    noteTitle: "INSTAGRAM",   noteLines: ["Story captions", "Hashtag clusters", "Reel scripts"] },
  { icon: PinterestIcon, label: "Pinterest", func: "Visual Discovery",        color: "#BD081C",
    noteTitle: "PINTEREST",   noteLines: ["SEO descriptions", "Board strategy", "Rich pins"] },
  { icon: SlackIcon,     label: "Slack",     func: "Team Announcements",      color: "#4A154B",
    noteTitle: "SLACK",       noteLines: ["Team digests", "Launch announcements", "Newsletter"] },
  { icon: DiscordIcon,   label: "Discord",   func: "Community Drops",         color: "#5865F2",
    noteTitle: "DISCORD",     noteLines: ["Drop strategy", "Community posts", "Hype builds"] },
  { icon: Linkedin,      label: "LinkedIn",  func: "Professional Authority",  color: "#0A66C2",
    noteTitle: "LINKEDIN",    noteLines: ["Thought leadership", "Data stories", "Pro hooks"] },
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
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
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
        <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.35)" />
        </filter>
      </defs>

      <path d={fillD} fill="url(#hArchFill)" />
      <path d={pathD} fill="none" stroke="url(#hArchLine)" strokeWidth="2.5" />

      {NODE_PTS.map((pt, i) => {
        if (i === HUB_IDX) return null;
        return (
          <line
            key={i}
            x1={HUB_PT.x} y1={HUB_PT.y}
            x2={pt.x}     y2={pt.y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            strokeDasharray="5 5"
          />
        );
      })}

      <circle cx={HUB_PT.x} cy={HUB_PT.y} r="36" fill="url(#hubGlow)" />
      <circle cx={HUB_PT.x} cy={HUB_PT.y} r="18" fill="rgba(59,130,246,0.22)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
    </svg>
  );
}

function ComicNoteThread({ height, isTop }: { height: number; isTop: boolean }) {
  const path = isTop
    ? `M 10 0 C 14 ${height * 0.3} 6 ${height * 0.6} 10 ${height}`
    : `M 10 ${height} C 14 ${height * 0.7} 6 ${height * 0.4} 10 0`;
  return (
    <svg
      width="20" height={height}
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ [isTop ? "top" : "bottom"]: "100%", marginTop: "-1px", marginBottom: "-1px", opacity: 0.6 }}
    >
      <path d={path} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

function ComicStickyNote({ node, isTop }: { node: typeof ALL_NODES[0]; isTop: boolean }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20"
      style={{ [isTop ? "bottom" : "top"]: "145%" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: isTop ? -3 : 2 }}
        animate={{ opacity: 1, scale: 1, rotate: isTop ? -2 : 1.5 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="relative"
        style={{
          width: 110,
          transform: `rotate(${isTop ? -2 : 1.5}deg)`,
        }}
      >
        <div
          className="w-full rounded-sm border-2 border-black/80 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
            boxShadow: "3px 3px 0px 0px rgba(0,0,0,0.9), 0 6px 16px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="px-2 py-1.5 border-b-2 border-black/80"
            style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }}
          >
            <span
              className="font-bold text-black uppercase tracking-wider"
              style={{ fontSize: 9, fontFamily: "'Courier New', monospace", letterSpacing: "0.12em" }}
            >
              {node.noteTitle}
            </span>
          </div>
          <div className="px-2 py-2 space-y-1">
            {node.noteLines.map((line, i) => (
              <div key={i} className="flex items-start gap-1">
                <span style={{ fontSize: 7, color: "#92400e", fontFamily: "monospace", lineHeight: 1.5, marginTop: 1 }}>▸</span>
                <span style={{ fontSize: 8, color: "#1c1917", fontFamily: "'Courier New', monospace", lineHeight: 1.5 }}>
                  {line}
                </span>
              </div>
            ))}
          </div>
          <div
            className="absolute bottom-0 right-0 w-5 h-5"
            style={{
              background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.15) 50%)",
            }}
          />
        </div>
      </motion.div>
      <ComicNoteThread height={52} isTop={isTop} />
    </div>
  );
}

function getNotePosition(i: number): boolean {
  return i % 2 === 0;
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
            textShadow:
              "0 2px 0 rgba(0,0,0,0.8), 0 4px 32px rgba(0,0,0,0.7), 0 8px 48px rgba(0,0,0,0.5), 0 0 80px rgba(0,0,0,0.35)",
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
        <ArchSVG />

        {ALL_NODES.map((node, i) => {
          const pt    = NODE_PTS[i];
          const isHub = i === HUB_IDX;
          const isTop = getNotePosition(i);

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
              <ComicStickyNote node={node} isTop={isTop} />

              <div
                className="rounded-xl border-2 border-black transition-all duration-150 hover:scale-110 cursor-pointer relative z-30 flex items-center justify-center"
                style={{
                  width: isHub ? "88px" : "72px",
                  height: isHub ? "88px" : "72px",
                  background: isHub
                    ? "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)"
                    : "#ffffff",
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

              <div
                className={`absolute ${isTop ? "top-[-52px]" : "bottom-[-52px]"} opacity-0 group-hover:opacity-100 transition-opacity z-40 pointer-events-none`}
              >
                <div className="bg-black/90 text-white px-2 py-1 rounded-md shadow-xl">
                  <p className="font-pixel text-[6px] whitespace-nowrap uppercase tracking-wider">{node.func}</p>
                  <p className="font-pixel text-[5px] whitespace-nowrap text-white/60 mt-0.5">{node.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
