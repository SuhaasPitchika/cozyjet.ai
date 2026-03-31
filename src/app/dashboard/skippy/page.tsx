"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Plus, X, Check, ChevronLeft, ChevronRight, LayoutList, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

/* ─── Integrations ─── */
const INTEGRATIONS = [
  {
    id: "github", name: "GitHub", color: "#171717",
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>,
  },
  {
    id: "notion", name: "Notion", color: "#000000",
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z"/></svg>,
  },
  {
    id: "figma", name: "Figma", color: "#a259ff",
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.02s1.354 3.018 3.019 3.018h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.019 3.019 3.019h3.117V8.981H8.148zm-3.019 8.49c0-1.665 1.355-3.019 3.019-3.019s3.019 1.354 3.019 3.019-1.355 3.019-3.019 3.019-3.019-1.355-3.019-3.019zm3.019-1.548c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.019 3.019 3.019 3.019-1.354 3.019-3.019-1.355-3.019-3.019-3.019zm7.734-3.491c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49-4.49-2.014-4.49-4.49 2.014-4.49 4.49-4.49zm0 1.471c-1.665 0-3.019 1.354-3.019 3.019s1.354 3.019 3.019 3.019 3.019-1.354 3.019-3.019-1.354-3.019-3.019-3.019z"/></svg>,
  },
  {
    id: "gdrive", name: "Google Drive", color: "#4285f4",
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M4.433 22.396l2.266-3.925H22.5l-2.267 3.925zm3.995-6.925L6.16 12.008 14.255 1.5h4.534zm-6.928 3l2.267-3.925L8 8.075 1.5 19.471z"/></svg>,
  },
  {
    id: "gcal", name: "Calendar", color: "#1a73e8",
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-9.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm.5-4h-1v2.12l1.75 1.06.5-.87-1.25-.76V14z"/></svg>,
  },
  {
    id: "linear", name: "Linear", color: "#5E6AD2",
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M3.533 7.773a8.44 8.44 0 009.694 9.694l-9.694-9.694zM2.8 6.067l15.133 15.133a8.5 8.5 0 01-4.93 1.8L2.8 6.067zm18.4 10.733l-14.1-14.1A8.44 8.44 0 0121.2 16.8zM6.067 2.8l16.2 16.2a8.44 8.44 0 00-16.2-16.2z"/></svg>,
  },
  {
    id: "slack", name: "Slack", color: "#4A154B",
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/></svg>,
  },
  {
    id: "vscode", name: "VS Code", color: "#0078d4",
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 00-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 00-1.276.057L.327 7.261A1 1 0 00.326 8.74L3.899 12 .326 15.26a1 1 0 00.001 1.479L1.65 17.94a.999.999 0 001.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 001.704.29l4.942-2.377A1.5 1.5 0 0024 20.06V3.939a1.5 1.5 0 00-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/></svg>,
  },
];

const SEED_DATA = [
  {
    id: "s1", source: "github", sourceLabel: "GitHub", date: "Today, 11:42 PM",
    title: "JWT auth with refresh token support shipped",
    body: "You shipped JWT authentication with refresh token support for your SaaS — a security implementation that junior developers struggle with and seniors love seeing documented. The commit touched 14 files across the auth layer.",
    color: "#171717",
  },
  {
    id: "s2", source: "notion", sourceLabel: "Notion", date: "Yesterday, 3:15 PM",
    title: "Q2 product roadmap finalized with 8 features",
    body: "You updated your product roadmap prioritised by real user feedback. A behind-the-scenes look at how solo founders make tough trade-offs resonates deeply with the builder audience on LinkedIn and Twitter.",
    color: "#000000",
  },
  {
    id: "s3", source: "figma", sourceLabel: "Figma", date: "Jun 28, 10:05 AM",
    title: "Glassmorphism dashboard component designed",
    body: "You finalized a new glassmorphic dashboard layout — the decisions you made around contrast, blur depth, and colour hierarchy are exactly the kind of design process documentation that gets bookmarked and shared by the design community.",
    color: "#a259ff",
  },
  {
    id: "s4", source: "gcal", sourceLabel: "Google Calendar", date: "Jun 27, 2:00 PM",
    title: "Product demo call with 3 enterprise leads",
    body: "You ran a 45-minute live demo with three enterprise decision-makers. The questions they asked and objections they raised are a goldmine for content — most founders never think to turn sales conversations into audience-building material.",
    color: "#1a73e8",
  },
];

function IntegrationCircle({ intg }: { intg: typeof INTEGRATIONS[0] }) {
  return (
    <motion.div
      whileHover={{ scale: 1.15, y: -2 }}
      className="relative flex-shrink-0"
      style={{ width: 36, height: 36 }}
      title={intg.name}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          boxShadow: `0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)`,
          padding: 8,
          color: intg.color,
        }}
      >
        {intg.logo}
      </div>
    </motion.div>
  );
}

function SeedSlide({ seed }: { seed: typeof SEED_DATA[0] }) {
  const intg = INTEGRATIONS.find(i => i.id === seed.source);
  return (
    <div
      className="w-full h-full flex flex-col rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #fdf8f0, #f5ede0)",
        border: "1.5px solid rgba(255,255,255,0.8)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)",
      }}
    >
      {/* Card top bar */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.07)", color: seed.color, padding: 8 }}
          >
            {intg?.logo}
          </div>
          <span className="font-pixel-thin text-black/60" style={{ fontSize: 16 }}>{seed.sourceLabel}</span>
        </div>
        <div
          className="px-3 py-1 rounded-lg"
          style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <span className="font-pixel-thin text-black/40" style={{ fontSize: 13 }}>{seed.date}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 flex flex-col justify-center">
        <h3
          className="font-pixel-thin text-black/80 leading-snug mb-4"
          style={{ fontSize: 20 }}
        >
          {seed.title}
        </h3>
        <p
          className="font-pixel-thin text-black/55 leading-relaxed"
          style={{ fontSize: 17 }}
        >
          {seed.body}
        </p>
      </div>
    </div>
  );
}

export default function SkippyPage() {
  const router = useRouter();
  const [connected, setConnected] = useState<string[]>(["github", "notion", "gdrive", "gcal"]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollMode, setScrollMode] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);

  const goTo = (idx: number) => setCurrentSlide(Math.max(0, Math.min(SEED_DATA.length - 1, idx)));

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -40) goTo(currentSlide + 1);
    else if (info.offset.x > 40) goTo(currentSlide - 1);
  };

  return (
    <div
      className="h-full flex overflow-hidden"
      style={{ background: "linear-gradient(135deg, #ddf4f8 0%, #e8f4f0 40%, #f0f8e8 100%)" }}
    >
      {/* ─── LEFT 1/4 ─── */}
      <div
        className="flex flex-col overflow-y-auto"
        style={{ width: "25%", minWidth: 240, borderRight: "1px solid rgba(0,0,0,0.07)" }}
      >
        {/* Title */}
        <div className="px-5 pt-7 pb-2">
          <h1 className="font-pixel text-black/85" style={{ fontSize: 13 }}>SKIPPY</h1>
          <p className="font-pixel-thin text-black/40 mt-1" style={{ fontSize: 15 }}>
            Your silent workspace observer
          </p>
        </div>

        {/* Glass pill with integration icons */}
        <div className="px-4 py-4">
          <div
            className="flex items-center gap-2 px-4 py-3 relative"
            style={{
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1.5px solid rgba(255,255,255,0.65)",
              borderRadius: 999,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
              {connected.map(id => {
                const intg = INTEGRATIONS.find(i => i.id === id);
                if (!intg) return null;
                return <IntegrationCircle key={id} intg={intg} />;
              })}
            </div>
            {/* + Button */}
            <motion.button
              onClick={() => setShowPopup(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ml-1"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1.5px solid rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Plus size={16} className="text-black/50" />
            </motion.button>
          </div>
        </div>

        {/* Connected apps listed below */}
        <div className="px-4 flex-1">
          <p className="font-pixel-thin text-black/30 mb-2" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
            CONNECTED
          </p>
          <div className="flex flex-col gap-2">
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
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.8)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div style={{ width: 20, height: 20, color: intg.color, flexShrink: 0 }}>{intg.logo}</div>
                  <span className="font-pixel-thin text-black/60 flex-1" style={{ fontSize: 14 }}>{intg.name}</span>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#10b981" }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── RIGHT 3/4 ─── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
        {/* Section header */}
        <div className="px-7 pt-7 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div>
            <h2 className="font-pixel text-black/75" style={{ fontSize: 11 }}>CONTENT SEEDS</h2>
            <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 14 }}>
              {SEED_DATA.length} seeds ready from your workspace
            </p>
          </div>
          <motion.button
            onClick={() => setScrollMode(!scrollMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.55)",
              border: "1.5px solid rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {scrollMode ? <Layers size={13} className="text-black/40" /> : <LayoutList size={13} className="text-black/40" />}
            <span className="font-pixel-thin text-black/50" style={{ fontSize: 13 }}>
              {scrollMode ? "Slides" : "Scroll"}
            </span>
          </motion.button>
        </div>

        {/* Cards */}
        <div className="flex-1 px-7 py-6 overflow-hidden">
          {!scrollMode ? (
            /* Swipe mode */
            <div className="h-full flex flex-col">
              <div className="flex-1 relative overflow-hidden" style={{ borderRadius: 24 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    style={{ userSelect: "none" }}
                  >
                    <SeedSlide seed={SEED_DATA[currentSlide]} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Nav dots + arrows */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <motion.button
                  onClick={() => goTo(currentSlide - 1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={currentSlide === 0}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.85)", opacity: currentSlide === 0 ? 0.3 : 1 }}
                >
                  <ChevronLeft size={14} className="text-black/50" />
                </motion.button>
                <div className="flex items-center gap-2">
                  {SEED_DATA.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => goTo(i)}
                      animate={{ scale: i === currentSlide ? 1 : 0.7, opacity: i === currentSlide ? 1 : 0.4 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#000" }}
                    />
                  ))}
                </div>
                <motion.button
                  onClick={() => goTo(currentSlide + 1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={currentSlide === SEED_DATA.length - 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.85)", opacity: currentSlide === SEED_DATA.length - 1 ? 0.3 : 1 }}
                >
                  <ChevronRight size={14} className="text-black/50" />
                </motion.button>
              </div>
            </div>
          ) : (
            /* Horizontal scroll mode */
            <div className="flex gap-5 h-full overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
              {SEED_DATA.map(seed => (
                <div key={seed.id} className="flex-shrink-0 h-full" style={{ width: "calc(70% - 10px)", scrollSnapAlign: "start" }}>
                  <SeedSlide seed={seed} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Integration Popup ─── */}
      <AnimatePresence>
        {showPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              className="fixed z-50 overflow-hidden"
              style={{
                top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: 380, maxHeight: "70vh",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(48px) saturate(200%)",
                WebkitBackdropFilter: "blur(48px) saturate(200%)",
                border: "1.5px solid rgba(255,255,255,0.95)",
                borderRadius: 24,
                boxShadow: "0 24px 64px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,1)",
              }}
            >
              <div className="px-6 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <div>
                  <h3 className="font-pixel text-black/80" style={{ fontSize: 10 }}>CONNECT APP</h3>
                  <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 13 }}>Choose tools to integrate</p>
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.05)" }}
                >
                  <X size={13} className="text-black/40" />
                </button>
              </div>
              <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "calc(70vh - 80px)" }}>
                {INTEGRATIONS.map(intg => {
                  const isConn = connected.includes(intg.id);
                  return (
                    <motion.button
                      key={intg.id}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                      onClick={() => {
                        setConnected(prev =>
                          isConn ? prev.filter(id => id !== intg.id) : [...prev, intg.id]
                        );
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left"
                    >
                      <div style={{ width: 32, height: 32, color: intg.color, flexShrink: 0 }}>{intg.logo}</div>
                      <span className="font-pixel-thin text-black/70 flex-1" style={{ fontSize: 16 }}>{intg.name}</span>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isConn ? "#10b981" : "rgba(0,0,0,0.08)",
                          border: isConn ? "2px solid #10b981" : "2px solid rgba(0,0,0,0.1)",
                        }}
                      >
                        {isConn && <Check size={11} className="text-white" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
