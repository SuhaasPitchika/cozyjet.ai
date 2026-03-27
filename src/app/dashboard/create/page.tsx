"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github, Mic, Camera, PenLine, Figma, Clock, Tag, Sparkles, Copy, Check,
  Linkedin, Twitter, Instagram, Youtube, Zap, ChevronRight, FileText, Send,
  RefreshCw, Calendar, BookmarkPlus, ChevronDown, Wand2, Eye, Filter,
} from "lucide-react";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2", charLimit: 1900 },
  { id: "twitter", label: "Twitter/X", icon: Twitter, color: "#1DA1F2", charLimit: 280 },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F", charLimit: 2200 },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000", charLimit: 5000 },
];

const SOURCE_COLORS: Record<string, string> = {
  github: "#6366f1",
  notion: "#1a1a1a",
  figma: "#a259ff",
  google_drive: "#0ea5e9",
  manual: "#10b981",
};

const MOCK_SEEDS = [
  {
    id: "1",
    title: "Launched CozyJet AI dashboard v2",
    description: "Rebuilt the entire dashboard with a new Create page, Calendar view, and Analytics with real-time engagement tracking. Added Framer Motion animations.",
    source: "github",
    source_label: "GitHub",
    time: "2 hours ago",
    tags: ["react", "typescript", "dashboard"],
    score: 98,
  },
  {
    id: "2",
    title: "Designed new onboarding flow in Figma",
    description: "Created a 7-step onboarding wireframe covering tool connection, voice profile setup, and first content generation. Added micro-interaction specs.",
    source: "figma",
    source_label: "Figma",
    time: "5 hours ago",
    tags: ["ux", "onboarding", "design"],
    score: 84,
  },
  {
    id: "3",
    title: "Published CozyJet product spec doc",
    description: "Wrote the full technical and product spec for the three AI agents — Skippy, Snooks, and Meta — covering architecture, API design, and behavior.",
    source: "notion",
    source_label: "Notion",
    time: "1 day ago",
    tags: ["product", "ai", "spec"],
    score: 76,
  },
  {
    id: "4",
    title: "Merged 8 PRs from the community",
    description: "Reviewed and merged 8 open-source contributions. Fixed 3 critical bugs, improved mobile responsiveness, and added dark mode support.",
    source: "github",
    source_label: "GitHub",
    time: "2 days ago",
    tags: ["open-source", "community"],
    score: 71,
  },
];

const CONTENT_MAP: Record<string, string> = {
  linkedin: `🚀 Just shipped a major update that I've been building in silence for weeks.\n\nWhat changed:\n→ Complete dashboard rebuild — faster, cleaner, smarter\n→ AI content generation now takes 3 seconds instead of 30\n→ Calendar and analytics now live in the same view\n\nThe lesson? Sometimes the best thing you can do for your product is start from scratch.\n\nWhat's the biggest refactor you've done that completely changed how your product feels? 👇\n\n#buildinpublic #saas #productdesign #ai`,
  twitter: `rebuilt our dashboard from scratch this week\n\nbefore: clunky, slow, confusing\nafter: fast, clean, focused\n\nthe rule: if you're embarrassed by how slow something loads, rewrite it\n\ntook 5 days. worth every hour 🔥`,
  instagram: `big update just dropped 🚀\n\nrebuilt the entire dashboard. faster loads, cleaner design, smarter AI.\n\nif your product doesn't feel fast and effortless, your users feel it every single time.\n\nwe fixed it. 🙏\n\n#developer #buildinpublic #saas #productupdate #ux #ai #startup`,
  youtube: `Hook: I spent 5 days rebuilding our dashboard and here's exactly what I changed — and why it made everything better.\n\nSection 1: What was wrong with the old design\nSection 2: The rebuild process — what we kept and what we threw out\nSection 3: Results — speed, user feedback, and what's next\n\nEnd CTA: Have you ever done a complete rebuild? Drop your story in the comments 👇`,
};

function SourceIcon({ source }: { source: string }) {
  if (source === "github") return <Github size={13} className="text-white" />;
  if (source === "figma") return <Figma size={13} className="text-white" />;
  if (source === "notion") return <FileText size={13} className="text-white" />;
  return <PenLine size={13} className="text-white" />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[11px] px-2.5 h-7 rounded-lg transition-all font-medium"
      style={{
        background: copied ? "rgba(16,185,129,0.1)" : "rgba(0,0,0,0.05)",
        color: copied ? "#10b981" : "rgba(0,0,0,0.45)",
        border: `1px solid ${copied ? "rgba(16,185,129,0.25)" : "rgba(0,0,0,0.08)"}`,
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function CreatePage() {
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin", "twitter"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [manualText, setManualText] = useState("");
  const [activeVariant, setActiveVariant] = useState<Record<string, number>>({});

  const FILTERS = ["All", "GitHub", "Notion", "Figma", "Drive"];

  const filteredSeeds = useMemo(() => {
    if (activeFilter === "All") return MOCK_SEEDS;
    return MOCK_SEEDS.filter((s) => s.source_label === activeFilter);
  }, [activeFilter]);

  const selectedSeedData = MOCK_SEEDS.find((s) => s.id === selectedSeed);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!selectedSeed) return;
    setIsGenerating(true);
    setGenerated(false);
    await new Promise((r) => setTimeout(r, 2000));
    setIsGenerating(false);
    setGenerated(true);
  };

  return (
    <div className="flex h-full" style={{ background: "#f0f0f5" }}>
      {/* ─── LEFT: SKIPPY FEED ─── */}
      <div
        className="w-[360px] shrink-0 flex flex-col border-r h-full"
        style={{ borderColor: "rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.7)" }}
      >
        {/* Skippy header */}
        <div
          className="px-4 py-3 border-b flex items-center gap-2"
          style={{ borderColor: "rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.9)" }}
        >
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Eye size={13} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-black/75 leading-none">Skippy Feed</p>
            <p className="text-[9px] text-black/35 mt-0.5 leading-none">Observing 4 sources · updated 2m ago</p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#10b981" }}
          />
        </div>

        {/* Input bar */}
        <div className="p-3 border-b space-y-2" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <div
            className="flex items-center gap-2 px-3 h-9 rounded-xl"
            style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <PenLine size={13} className="text-black/30" />
            <input
              className="flex-1 text-sm bg-transparent outline-none text-black/70 placeholder:text-black/28"
              placeholder="Describe something you worked on..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
            />
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <Mic size={12} style={{ color: "#ef4444" }} />
            </button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { icon: Github, label: "GitHub", color: "#6366f1" },
              { icon: FileText, label: "Notion", color: "#1a1a1a" },
              { icon: Figma, label: "Figma", color: "#a259ff" },
              { icon: Camera, label: "Screenshot", color: "#f59e0b" },
            ].map((btn) => (
              <button
                key={btn.label}
                className="flex items-center gap-1 px-2 h-6 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  background: `${btn.color}10`,
                  border: `1px solid ${btn.color}22`,
                  color: btn.color,
                }}
              >
                <btn.icon size={10} />
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div
          className="flex items-center gap-1 px-3 py-2 border-b"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <Filter size={10} className="text-black/25 mr-1" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-2.5 h-6 rounded-full text-[10px] font-semibold transition-all"
              style={
                activeFilter === f
                  ? { background: "#6366f1", color: "white" }
                  : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.4)" }
              }
            >
              {f}
            </button>
          ))}
        </div>

        {/* Seed list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between px-1 mb-0.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-black/28">
              {filteredSeeds.length} items · sorted by relevance
            </p>
          </div>
          <AnimatePresence>
            {filteredSeeds.map((seed, i) => {
              const isSelected = selectedSeed === seed.id;
              const borderColor = SOURCE_COLORS[seed.source] || "#64748b";
              return (
                <motion.div
                  key={seed.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedSeed(seed.id === selectedSeed ? null : seed.id)}
                  whileHover={{ y: -1 }}
                  className="relative rounded-2xl cursor-pointer transition-all duration-150"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${borderColor}12, ${borderColor}06)`
                      : "rgba(255,255,255,0.8)",
                    border: `1.5px solid ${isSelected ? borderColor + "45" : "rgba(0,0,0,0.07)"}`,
                    boxShadow: isSelected
                      ? `0 0 0 2px ${borderColor}20, 0 4px 16px rgba(0,0,0,0.05)`
                      : "0 1px 6px rgba(0,0,0,0.04)",
                    borderLeft: `3px solid ${borderColor}`,
                    padding: "12px 12px 10px 14px",
                  }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: borderColor }}
                    >
                      <SourceIcon source={seed.source} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-black/80 leading-snug">{seed.title}</p>
                      <p className="text-[10px] text-black/38 mt-1 leading-relaxed line-clamp-2">{seed.description}</p>
                    </div>
                    <div
                      className="w-7 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                      style={{ background: seed.score >= 90 ? "rgba(16,185,129,0.12)" : "rgba(0,0,0,0.05)", color: seed.score >= 90 ? "#10b981" : "rgba(0,0,0,0.35)" }}
                    >
                      {seed.score}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {seed.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: `${borderColor}14`, color: borderColor }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-black/28">
                      <Clock size={9} />
                      <span>{seed.time}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl origin-left"
                      style={{ background: `linear-gradient(to right, ${borderColor}, transparent)` }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── RIGHT: META PANEL ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AnimatePresence mode="wait">
          {!selectedSeed ? (
            /* ── Empty state ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-10"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)", boxShadow: "0 20px 48px rgba(99,102,241,0.3)" }}
              >
                <Wand2 size={34} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-black/75 mb-2 text-center">Pick a work item to begin</h3>
              <p className="text-sm text-black/38 text-center max-w-sm leading-relaxed mb-10">
                Select anything from the Skippy Feed and Meta will instantly write platform-ready posts in your unique voice.
              </p>

              {/* Steps */}
              <div className="flex items-center gap-3 max-w-md w-full">
                {[
                  { num: "1", label: "Select a seed from Skippy", color: "#6366f1" },
                  { num: "2", label: "Choose your platforms", color: "#8b5cf6" },
                  { num: "3", label: "Meta generates your content", color: "#ec4899" },
                ].map((step, i) => (
                  <React.Fragment key={step.num}>
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: step.color }}
                      >
                        {step.num}
                      </div>
                      <p className="text-[10px] text-black/45 text-center leading-snug">{step.label}</p>
                    </div>
                    {i < 2 && <ChevronRight size={14} className="text-black/15 flex-shrink-0 mb-4" />}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ── Generation panel ── */
            <motion.div
              key="panel"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Seed summary bar */}
              <div
                className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.9)", borderColor: "rgba(0,0,0,0.07)" }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: SOURCE_COLORS[selectedSeedData?.source || ""] || "#6366f1" }}
                >
                  <SourceIcon source={selectedSeedData?.source || ""} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-black/78 leading-none truncate">{selectedSeedData?.title}</p>
                  <p className="text-[10px] text-black/38 mt-0.5 leading-none">{selectedSeedData?.source_label} · {selectedSeedData?.time}</p>
                </div>
              </div>

              {/* Platform selector + Generate */}
              <div
                className="px-5 py-3 border-b flex items-center gap-4 flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.8)", borderColor: "rgba(0,0,0,0.07)" }}
              >
                <div className="flex gap-2 flex-wrap flex-1">
                  {PLATFORMS.map((p) => {
                    const isActive = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-[11px] font-bold transition-all"
                        style={
                          isActive
                            ? { background: p.color, color: "white", boxShadow: `0 4px 12px ${p.color}38` }
                            : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.38)", border: "1px solid rgba(0,0,0,0.08)" }
                        }
                      >
                        <p.icon size={12} />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <motion.button
                  onClick={handleGenerate}
                  disabled={isGenerating || selectedPlatforms.length === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-9 px-5 rounded-xl text-white text-[12px] font-bold flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
                >
                  {isGenerating ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Zap size={14} />
                    </motion.div>
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {isGenerating ? "Writing..." : "Generate"}
                </motion.button>
              </div>

              {/* Generated output area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {isGenerating && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 rounded-full border-2 border-transparent"
                        style={{ borderTopColor: "#6366f1" }}
                      />
                      <p className="text-[12px] text-black/45 font-medium">Meta is writing your content...</p>
                    </div>
                    {selectedPlatforms.map((pid) => {
                      const pl = PLATFORMS.find((p) => p.id === pid);
                      return (
                        <div
                          key={pid}
                          className="rounded-2xl p-4 animate-pulse"
                          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)" }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl" style={{ background: `${pl?.color}20` }} />
                            <div className="h-3 w-28 rounded-full bg-black/07" />
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 rounded-full bg-black/05" />
                            <div className="h-3 rounded-full bg-black/05 w-5/6" />
                            <div className="h-3 rounded-full bg-black/05 w-4/6" />
                            <div className="h-3 rounded-full bg-black/05 w-3/4" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {generated && !isGenerating && (
                  <AnimatePresence>
                    {selectedPlatforms.map((pid, i) => {
                      const pl = PLATFORMS.find((p) => p.id === pid)!;
                      const content = CONTENT_MAP[pid] || "";
                      const charCount = content.length;
                      const isOver = charCount > pl.charLimit;
                      const variant = activeVariant[pid] || 1;

                      return (
                        <motion.div
                          key={pid}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="rounded-2xl overflow-hidden"
                          style={{
                            background: "rgba(255,255,255,0.92)",
                            border: "1px solid rgba(0,0,0,0.07)",
                            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                          }}
                        >
                          {/* Card header */}
                          <div
                            className="flex items-center justify-between px-4 py-3 border-b"
                            style={{ borderColor: "rgba(0,0,0,0.06)", background: `linear-gradient(to right, ${pl.color}0d, transparent)` }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-xl flex items-center justify-center"
                                style={{ background: pl.color }}
                              >
                                <pl.icon size={13} className="text-white" />
                              </div>
                              <span className="text-[12px] font-bold" style={{ color: pl.color }}>{pl.label}</span>
                              <div className="flex items-center gap-1">
                                {[1, 2].map((v) => (
                                  <button
                                    key={v}
                                    onClick={() => setActiveVariant((prev) => ({ ...prev, [pid]: v }))}
                                    className="text-[9px] font-bold px-1.5 h-4 rounded-full transition-all"
                                    style={
                                      variant === v
                                        ? { background: pl.color, color: "white" }
                                        : { background: "rgba(0,0,0,0.07)", color: "rgba(0,0,0,0.35)" }
                                    }
                                  >
                                    V{v}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[10px] font-semibold"
                                style={{ color: isOver ? "#ef4444" : "rgba(0,0,0,0.3)" }}
                              >
                                {charCount}/{pl.charLimit}
                              </span>
                              <CopyButton text={content} />
                            </div>
                          </div>

                          {/* Content body */}
                          <div className="p-4">
                            <p className="text-[13px] text-black/68 leading-relaxed whitespace-pre-line">{content}</p>
                          </div>

                          {/* Action row */}
                          <div
                            className="flex items-center gap-2 px-4 py-3 border-t"
                            style={{ borderColor: "rgba(0,0,0,0.06)" }}
                          >
                            <button
                              className="flex items-center gap-1.5 px-3 h-7 rounded-xl text-[11px] font-semibold transition-all"
                              style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.18)" }}
                            >
                              <RefreshCw size={11} /> Regenerate
                            </button>
                            <button
                              className="flex items-center gap-1.5 px-3 h-7 rounded-xl text-[11px] font-semibold transition-all"
                              style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.18)" }}
                            >
                              <Send size={11} /> Refine
                            </button>
                            <button
                              className="flex items-center gap-1.5 px-3 h-7 rounded-xl text-[11px] font-semibold transition-all"
                              style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
                            >
                              <Calendar size={11} /> Schedule
                            </button>
                            <button
                              className="flex items-center gap-1.5 px-3 h-7 rounded-xl text-[11px] font-bold text-white ml-auto"
                              style={{ background: `linear-gradient(135deg, ${pl.color}, ${pl.color}cc)`, boxShadow: `0 4px 12px ${pl.color}35` }}
                            >
                              <BookmarkPlus size={11} /> Publish Now
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}

                {!isGenerating && !generated && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: "rgba(99,102,241,0.08)" }}
                    >
                      <Sparkles size={22} style={{ color: "rgba(99,102,241,0.4)" }} />
                    </div>
                    <p className="text-sm text-black/38 max-w-xs leading-relaxed">
                      Select platforms above and click <strong className="text-black/50">Generate</strong> to create platform-ready posts in your voice.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
