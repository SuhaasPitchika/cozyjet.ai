"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, ChevronLeft, ChevronRight } from "lucide-react";

/* ─── App integrations ─── */
const INTEGRATIONS = [
  {
    id: "github", name: "GitHub",
    bg: "linear-gradient(135deg,#f0f0f0,#ffffff)",
    logo: <svg viewBox="0 0 24 24" fill="#171717" className="w-full h-full"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>,
  },
  {
    id: "notion", name: "Notion",
    bg: "linear-gradient(135deg,#f7f6f3,#ffffff)",
    logo: <svg viewBox="0 0 24 24" fill="#000" className="w-full h-full"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z"/></svg>,
  },
  {
    id: "figma", name: "Figma",
    bg: "linear-gradient(135deg,#faf5ff,#f0e8ff)",
    logo: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83"/><path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF"/><path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E"/><path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262"/><path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE"/></svg>,
  },
  {
    id: "gdrive", name: "Google Drive",
    bg: "linear-gradient(135deg,#f0f7ff,#e8f4ff)",
    logo: <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M4.433 22.396l2.266-3.925H22.5l-2.267 3.925z" fill="#4285F4"/><path d="M8.428 15.471L6.16 12.008 14.255 1.5h4.534z" fill="#0F9D58"/><path d="M1.5 19.471l2.267-3.925L8 8.075 1.5 19.471z" fill="#FFCD40"/><path d="M4.433 22.396l2.266-3.925h12l2.267 3.925z" fill="#1967D2"/></svg>,
  },
  {
    id: "gcal", name: "Google Calendar",
    bg: "linear-gradient(135deg,#f0f5ff,#e8eeff)",
    logo: <svg viewBox="0 0 24 24" className="w-full h-full"><rect x="3" y="4" width="18" height="18" rx="2" fill="#fff" stroke="#4285F4" strokeWidth="1.5"/><path d="M3 9h18" stroke="#4285F4" strokeWidth="1.5"/><path d="M8 2v4M16 2v4" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round"/><text x="12" y="18" textAnchor="middle" fill="#EA4335" fontSize="7" fontWeight="bold">31</text><text x="12" y="14" textAnchor="middle" fill="#4285F4" fontSize="5">CAL</text></svg>,
  },
  {
    id: "linear", name: "Linear",
    bg: "linear-gradient(135deg,#f2f3ff,#ebebff)",
    logo: <svg viewBox="0 0 24 24" fill="#5E6AD2" className="w-full h-full"><path d="M3.533 7.773a8.44 8.44 0 009.694 9.694l-9.694-9.694zM2.8 6.067l15.133 15.133a8.5 8.5 0 01-4.93 1.8L2.8 6.067zm18.4 10.733l-14.1-14.1A8.44 8.44 0 0121.2 16.8zM6.067 2.8l16.2 16.2a8.44 8.44 0 00-16.2-16.2z"/></svg>,
  },
  {
    id: "slack", name: "Slack",
    bg: "linear-gradient(135deg,#fdf5ff,#f5e8ff)",
    logo: <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52z" fill="#E01E5A"/><path d="M6.313 15.165a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313z" fill="#E01E5A"/><path d="M8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834z" fill="#36C5F0"/><path d="M8.834 6.313a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312z" fill="#36C5F0"/><path d="M18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/><path d="M17.688 8.834a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312z" fill="#2EB67D"/><path d="M15.165 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/><path d="M15.165 17.688a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z" fill="#ECB22E"/></svg>,
  },
  {
    id: "vscode", name: "VS Code",
    bg: "linear-gradient(135deg,#f0f7ff,#e3f0ff)",
    logo: <svg viewBox="0 0 24 24" fill="#0078d4" className="w-full h-full"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 00-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 00-1.276.057L.327 7.261A1 1 0 00.326 8.74L3.899 12 .326 15.26a1 1 0 00.001 1.479L1.65 17.94a.999.999 0 001.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 001.704.29l4.942-2.377A1.5 1.5 0 0024 20.06V3.939a1.5 1.5 0 00-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/></svg>,
  },
];

const SEED_DATA = [
  {
    id: "s1", source: "github",
    date: "Today · 11:42 PM",
    title: "JWT auth with refresh tokens shipped",
    lines: [
      "You just shipped JWT auth with refresh token support.",
      "This is exactly what junior devs struggle with — and senior devs love seeing documented properly.",
      "The commit touched 14 files across the auth layer.",
      "Your LinkedIn audience would bookmark a post about this.",
      "This is prime content — technical but relatable.",
    ],
  },
  {
    id: "s2", source: "notion",
    date: "Yesterday · 3:15 PM",
    title: "Q2 roadmap updated — 8 features prioritised",
    lines: [
      "You finalised your Q2 product roadmap today.",
      "8 features prioritised by real user feedback, not guesswork.",
      "Behind-the-scenes trade-off posts do incredibly well with founders.",
      "Show how you decided what to cut — that's the real story.",
      "Snooks already flagged Thursday morning as optimal posting time.",
    ],
  },
  {
    id: "s3", source: "figma",
    date: "Jun 28 · 10:05 AM",
    title: "Glassmorphism dashboard component designed",
    lines: [
      "You finalized a new glassmorphic dashboard layout today.",
      "The design decisions — contrast, blur depth, colour hierarchy — are exactly what gets shared in design communities.",
      "Process documentation posts outperform final-reveal posts 3:1.",
      "A Figma walkthrough thread on Twitter would kill it.",
      "Instagram carousel for the before/after comparison.",
    ],
  },
  {
    id: "s4", source: "gcal",
    date: "Jun 27 · 2:00 PM",
    title: "Demo call with 3 enterprise leads",
    lines: [
      "You ran a 45-minute live demo with three enterprise decision-makers.",
      "The objections they raised are a goldmine for content.",
      "Most founders never think to turn sales calls into marketing material.",
      "A post about what enterprise buyers actually ask about AI tools would perform well.",
      "This could be your most-engaged post this month.",
    ],
  },
  {
    id: "s5", source: "vscode",
    date: "Jun 26 · 8:30 PM",
    title: "Refactored entire data pipeline — 60% faster",
    lines: [
      "You spent 4 hours refactoring your data pipeline and cut latency by 60%.",
      "Technical builders on LinkedIn love speed improvement breakdowns.",
      "Before/after benchmarks with a one-line explanation of what changed.",
      "This is the kind of post that engineers screenshot and save.",
      "Short Twitter thread: the problem, the fix, the number. Done.",
    ],
  },
];

const NOTE_COLORS = [
  { bg: "#fff9c4", border: "#f0e060", shadow: "rgba(240,200,0,0.3)" },
  { bg: "#fff3e0", border: "#ffcc80", shadow: "rgba(255,160,0,0.25)" },
  { bg: "#e8f5e9", border: "#a5d6a7", shadow: "rgba(76,175,80,0.2)" },
  { bg: "#fce4ec", border: "#f48fb1", shadow: "rgba(233,30,99,0.2)" },
  { bg: "#e3f2fd", border: "#90caf9", shadow: "rgba(33,150,243,0.2)" },
];

function AppCircle({ intg }: { intg: typeof INTEGRATIONS[0] }) {
  return (
    <motion.div
      whileHover={{ scale: 1.12, y: -2 }}
      className="flex-shrink-0 rounded-2xl flex items-center justify-center cursor-pointer"
      title={intg.name}
      style={{
        width: 38, height: 38,
        background: intg.bg,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        border: "1px solid rgba(255,255,255,0.7)",
        padding: 8,
      }}
    >
      {intg.logo}
    </motion.div>
  );
}

function StickyNote({ seed, colorIdx }: { seed: typeof SEED_DATA[0]; colorIdx: number }) {
  const intg = INTEGRATIONS.find(i => i.id === seed.source);
  const col = NOTE_COLORS[colorIdx % NOTE_COLORS.length];
  const rot = (colorIdx % 3 === 0 ? -1.2 : colorIdx % 3 === 1 ? 1.0 : -0.5);

  return (
    <motion.div
      animate={{ y: [0, -3, 0], rotate: [rot, rot + 0.3, rot] }}
      transition={{ duration: 4 + colorIdx * 0.5, repeat: Infinity, ease: "easeInOut" }}
      className="w-full h-full flex flex-col"
      style={{
        background: col.bg,
        border: `1.5px solid ${col.border}`,
        borderRadius: 4,
        boxShadow: `4px 6px 18px ${col.shadow}, 2px 2px 0 rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9)`,
        transform: `rotate(${rot}deg)`,
        padding: "18px 20px 14px",
      }}
    >
      {/* Pin dot */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-black/20 z-10"
        style={{ background: "#ef4444", boxShadow: "1px 1px 3px rgba(0,0,0,0.25)" }}
      />
      {/* Source + date header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {intg && (
            <div style={{ width: 20, height: 20, flexShrink: 0, padding: 3, background: "rgba(255,255,255,0.6)", borderRadius: 4 }}>
              {intg.logo}
            </div>
          )}
          <span className="font-pixel-thin text-black/50" style={{ fontSize: 12 }}>{intg?.name}</span>
        </div>
        <span
          className="font-pixel-thin text-black/40 px-2 py-0.5 rounded"
          style={{ fontSize: 11, background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.07)" }}
        >
          {seed.date}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-pixel-thin text-black/80 mb-2 leading-snug"
        style={{ fontSize: 17, fontWeight: 600 }}
      >
        {seed.title}
      </h3>

      {/* Lines — like handwritten notes */}
      <div className="flex-1 flex flex-col justify-around">
        {seed.lines.map((line, i) => (
          <div key={i} className="flex items-start gap-1.5 py-0.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <span className="font-pixel-thin text-black/25 flex-shrink-0 mt-0.5" style={{ fontSize: 11 }}>›</span>
            <span className="font-pixel-thin text-black/65 leading-snug" style={{ fontSize: 14 }}>{line}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SkippyPage() {
  const [connected, setConnected] = useState<string[]>(["github", "notion", "gdrive", "gcal"]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  const goTo = (idx: number) => setCurrentSlide(Math.max(0, Math.min(SEED_DATA.length - 1, idx)));

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 30) {
      setIsDragging(true);
      if (dx < 0) goTo(currentSlide + 1);
      else goTo(currentSlide - 1);
    }
  };

  return (
    <div
      className="h-full flex overflow-hidden"
      style={{ background: "linear-gradient(135deg, #ddf4f8 0%, #e8f4f0 50%, #f0f8e8 100%)" }}
    >
      {/* ─── LEFT 1/4 ─── */}
      <div
        className="flex flex-col overflow-y-auto flex-shrink-0"
        style={{ width: "26%", minWidth: 230, borderRight: "1px solid rgba(0,0,0,0.07)" }}
      >
        <div className="px-5 pt-6 pb-2">
          <h1 className="font-pixel text-black/80" style={{ fontSize: 12 }}>SKIPPY</h1>
          <p className="font-pixel-thin text-black/40 mt-1" style={{ fontSize: 15 }}>
            Your silent workspace observer
          </p>
        </div>

        {/* Integration pill bar */}
        <div className="px-4 py-3">
          <div
            className="flex items-center gap-2 px-3 py-2.5 relative"
            style={{
              background: "linear-gradient(135deg, rgba(255,248,220,0.85), rgba(255,255,255,0.7))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1.5px solid rgba(255,220,100,0.4)",
              borderRadius: 999,
              boxShadow: "0 4px 20px rgba(255,200,50,0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <div className="flex items-center gap-1.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {connected.map(id => {
                const intg = INTEGRATIONS.find(i => i.id === id);
                if (!intg) return null;
                return <AppCircle key={id} intg={intg} />;
              })}
            </div>
            <motion.button
              onClick={() => setShowPopup(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ml-1"
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "1.5px solid rgba(255,220,100,0.5)",
                boxShadow: "0 2px 8px rgba(255,200,50,0.15)",
              }}
            >
              <Plus size={16} className="text-black/50" />
            </motion.button>
          </div>
        </div>

        {/* Connected list */}
        <div className="px-4 flex-1">
          <p className="font-pixel-thin text-black/30 mb-2" style={{ fontSize: 12, letterSpacing: "0.15em" }}>
            CONNECTED APPS
          </p>
          <div className="flex flex-col gap-1.5">
            {connected.map(id => {
              const intg = INTEGRATIONS.find(i => i.id === id);
              if (!intg) return null;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-2xl"
                  style={{
                    background: intg.bg,
                    border: "1px solid rgba(255,255,255,0.8)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ width: 22, height: 22, flexShrink: 0 }}>{intg.logo}</div>
                  <span className="font-pixel-thin text-black/65 flex-1" style={{ fontSize: 15 }}>{intg.name}</span>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#22c55e" }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── RIGHT 3/4 ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="px-7 pt-6 pb-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div>
            <h2 className="font-pixel text-black/70" style={{ fontSize: 10 }}>CONTENT SEEDS</h2>
            <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 14 }}>
              Drag left or right to browse · {SEED_DATA.length} seeds ready
            </p>
          </div>
          {/* Slide indicator */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => goTo(currentSlide - 1)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              disabled={currentSlide === 0}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.9)", opacity: currentSlide === 0 ? 0.3 : 1 }}
            >
              <ChevronLeft size={14} className="text-black/50" />
            </motion.button>
            <span className="font-pixel-thin text-black/40" style={{ fontSize: 14 }}>{currentSlide + 1} / {SEED_DATA.length}</span>
            <motion.button
              onClick={() => goTo(currentSlide + 1)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              disabled={currentSlide === SEED_DATA.length - 1}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.9)", opacity: currentSlide === SEED_DATA.length - 1 ? 0.3 : 1 }}
            >
              <ChevronRight size={14} className="text-black/50" />
            </motion.button>
          </div>
        </div>

        {/* Note card */}
        <div
          className="flex-1 flex items-center justify-center px-8 py-6 relative overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {/* Prev peek */}
          {currentSlide > 0 && (
            <div
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-20"
              style={{ width: 40, height: "60%", background: NOTE_COLORS[(currentSlide - 1) % NOTE_COLORS.length].bg, borderRadius: 4, transform: "translateY(-50%) rotate(-3deg)" }}
            />
          )}
          {/* Next peek */}
          {currentSlide < SEED_DATA.length - 1 && (
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-20"
              style={{ width: 40, height: "60%", background: NOTE_COLORS[(currentSlide + 1) % NOTE_COLORS.length].bg, borderRadius: 4, transform: "translateY(-50%) rotate(3deg)" }}
            />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 60, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -60, rotate: -2 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="relative"
              style={{ width: "min(480px, 90%)", height: "min(520px, 90vh)", cursor: "grab" }}
            >
              <StickyNote seed={SEED_DATA[currentSlide]} colorIdx={currentSlide} />
            </motion.div>
          </AnimatePresence>

          {/* Dot nav */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {SEED_DATA.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => goTo(i)}
                animate={{ scale: i === currentSlide ? 1.2 : 0.8, opacity: i === currentSlide ? 1 : 0.35 }}
                className="w-2 h-2 rounded-full"
                style={{ background: "rgba(0,0,0,0.6)" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Integration popup ─── */}
      <AnimatePresence>
        {showPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              className="fixed z-50 overflow-hidden"
              style={{
                top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: 400, maxHeight: "75vh",
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(48px) saturate(200%)",
                WebkitBackdropFilter: "blur(48px) saturate(200%)",
                border: "1.5px solid rgba(255,255,255,0.95)",
                borderRadius: 24,
                boxShadow: "0 24px 64px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,1)",
              }}
            >
              <div className="px-6 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <div>
                  <h3 className="font-pixel text-black/80" style={{ fontSize: 9 }}>CONNECT APPS</h3>
                  <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 13 }}>Choose tools for Skippy to watch</p>
                </div>
                <button onClick={() => setShowPopup(false)} className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.05)" }}>
                  <X size={13} className="text-black/40" />
                </button>
              </div>

              <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "calc(75vh - 80px)" }}>
                <div className="grid grid-cols-2 gap-3">
                  {INTEGRATIONS.map(intg => {
                    const isConn = connected.includes(intg.id);
                    return (
                      <motion.button
                        key={intg.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setConnected(prev => isConn ? prev.filter(id => id !== intg.id) : [...prev, intg.id])}
                        className="relative flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all"
                        style={{
                          background: intg.bg,
                          border: isConn ? "2px solid rgba(34,197,94,0.5)" : "1.5px solid rgba(255,255,255,0.7)",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
                        }}
                      >
                        {isConn && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                        <div style={{ width: 36, height: 36 }}>{intg.logo}</div>
                        <span className="font-pixel-thin text-black/65" style={{ fontSize: 13 }}>{intg.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
