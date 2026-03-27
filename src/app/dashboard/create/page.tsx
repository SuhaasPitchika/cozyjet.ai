"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github, Mic, Camera, PenLine, Figma, Clock, Tag, Sparkles, X, Copy, Check,
  Linkedin, Twitter, Instagram, Youtube, Zap, ChevronRight, FileText, Send,
} from "lucide-react";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2", charLimit: 1900 },
  { id: "twitter", label: "Twitter/X", icon: Twitter, color: "#1DA1F2", charLimit: 280 },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F", charLimit: 2200 },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000", charLimit: 5000 },
];

const FILTERS = ["All", "GitHub", "Notion", "Figma", "Drive", "Manual"];

const PLATFORM_COLORS: Record<string, string> = {
  github: "#6366f1",
  notion: "#000000",
  figma: "#a259ff",
  google_drive: "#0ea5e9",
  manual: "#10b981",
};

const MOCK_SEEDS = [
  {
    id: "1",
    title: "Launched CozyJet AI dashboard v2",
    description: "Rebuilt the entire dashboard with a new Create page, Calendar view, and Analytics with real-time engagement tracking. Added Framer Motion animations and improved mobile layout.",
    source: "github",
    source_label: "GitHub",
    time: "2 hours ago",
    tags: ["react", "typescript", "dashboard"],
  },
  {
    id: "2",
    title: "Designed new onboarding flow in Figma",
    description: "Created a 7-step onboarding wireframe covering tool connection, voice profile setup, and first content generation. Added micro-interaction specs for developers.",
    source: "figma",
    source_label: "Figma",
    time: "5 hours ago",
    tags: ["ux", "onboarding", "design"],
  },
  {
    id: "3",
    title: "Published CozyJet product spec doc",
    description: "Wrote the full technical and product specification for the three AI agents — Skippy, Snooks, and Meta — covering architecture, API design, and agent behavior.",
    source: "notion",
    source_label: "Notion",
    time: "1 day ago",
    tags: ["product", "ai", "spec"],
  },
];

const EXAMPLE_GENERATED = [
  {
    platform: "LinkedIn",
    color: "#0A66C2",
    text: "🚀 Just shipped a major update to our AI dashboard.\n\nHere's what changed:\n→ Rebuilt Create page with real-time content generation\n→ Added Calendar view with AI scheduling suggestions\n→ Analytics now tracks engagement across platforms\n\nBuilding in public is tough. But shipping is the only feedback loop that matters.\n\nWhat's one feature your users kept asking for that changed your product direction? 👇",
  },
  {
    platform: "Twitter/X",
    color: "#1DA1F2",
    text: "Spent 3 days rebuilding our AI dashboard from scratch.\n\nResults:\n• 40% faster page loads\n• Real-time content generation\n• Calendar + analytics built in\n\nSometimes you have to burn it down to build it right 🔥",
  },
];

function SourceIcon({ source }: { source: string }) {
  if (source === "github") return <Github size={14} className="text-white" />;
  if (source === "figma") return <Figma size={14} className="text-white" />;
  if (source === "notion") return <FileText size={14} className="text-white" />;
  return <PenLine size={14} className="text-white" />;
}

function SeedCard({
  seed,
  isSelected,
  onClick,
}: {
  seed: typeof MOCK_SEEDS[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  const borderColor = PLATFORM_COLORS[seed.source] || "#64748b";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={onClick}
      whileHover={{ y: -1 }}
      className="relative rounded-2xl cursor-pointer transition-all duration-200"
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${borderColor}10, ${borderColor}06)`
          : "rgba(255,255,255,0.7)",
        border: `1.5px solid ${isSelected ? borderColor + "50" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isSelected
          ? `0 0 0 2px ${borderColor}25, 0 4px 16px rgba(0,0,0,0.06)`
          : "0 2px 8px rgba(0,0,0,0.04)",
        borderLeft: `3px solid ${borderColor}`,
        padding: "14px 14px 12px 16px",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-black/80 leading-snug flex-1">{seed.title}</p>
        <div
          className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
          style={{ background: borderColor }}
        >
          <SourceIcon source={seed.source} />
        </div>
      </div>
      <p className="text-xs text-black/45 leading-relaxed mb-3 line-clamp-2">{seed.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {seed.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${borderColor}15`, color: borderColor }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-black/30">
          <Clock size={10} />
          <span>{seed.time}</span>
        </div>
      </div>
    </motion.div>
  );
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
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
      style={{
        background: copied ? "rgba(16,185,129,0.1)" : "rgba(0,0,0,0.05)",
        color: copied ? "#10b981" : "rgba(0,0,0,0.45)",
        border: `1px solid ${copied ? "rgba(16,185,129,0.25)" : "rgba(0,0,0,0.08)"}`,
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
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
    await new Promise((r) => setTimeout(r, 2200));
    setIsGenerating(false);
    setGenerated(true);
  };

  return (
    <div
      className="grid grid-cols-12 h-full"
      style={{ background: "#f5f5f7", minHeight: "calc(100vh - 44px)" }}
    >
      {/* LEFT — Skippy Feed Panel */}
      <div
        className="col-span-12 lg:col-span-5 flex flex-col border-r"
        style={{ borderColor: "rgba(0,0,0,0.06)" }}
      >
        {/* Input bar */}
        <div className="p-4 border-b" style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.8)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex-1 flex items-center gap-2 px-3 h-10 rounded-xl"
              style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <input
                className="flex-1 text-sm bg-transparent outline-none text-black/70 placeholder:text-black/30"
                placeholder="Describe something you worked on..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
            </div>
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <Mic size={15} style={{ color: "#ef4444" }} />
            </button>
          </div>
          <div className="flex gap-2">
            {[
              { icon: Github, label: "GitHub", color: "#6366f1" },
              { icon: FileText, label: "Notion", color: "#000" },
              { icon: Figma, label: "Figma", color: "#a259ff" },
              { label: "Drive", color: "#0ea5e9", isText: true },
              { icon: Camera, label: "Screenshot", color: "#f59e0b" },
            ].map((btn) => (
              <button
                key={btn.label}
                className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: `${btn.color}10`,
                  border: `1px solid ${btn.color}20`,
                  color: btn.color,
                }}
              >
                {btn.icon && <btn.icon size={11} />}
                {!btn.icon && <span>{btn.label.slice(0, 1)}</span>}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.6)" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-3 h-6 rounded-full text-[11px] font-medium transition-all"
              style={
                activeFilter === f
                  ? { background: "#4f46e5", color: "white" }
                  : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)" }
              }
            >
              {f}
            </button>
          ))}
        </div>

        {/* Seed list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">
              Skippy Feed — {filteredSeeds.length} items
            </p>
          </div>
          <AnimatePresence>
            {filteredSeeds.map((seed) => (
              <SeedCard
                key={seed.id}
                seed={seed}
                isSelected={selectedSeed === seed.id}
                onClick={() => setSelectedSeed(seed.id === selectedSeed ? null : seed.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT — Meta Generation Panel */}
      <div className="col-span-12 lg:col-span-7 flex flex-col overflow-y-auto">
        {!selectedSeed ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
            >
              <Sparkles size={28} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-black/70 mb-2 text-center">
              Select a work item to generate content
            </h3>
            <p className="text-sm text-black/35 text-center max-w-xs mb-10">
              Pick something from the Skippy Feed on the left and Meta will generate platform-ready posts in your voice.
            </p>
            <div className="w-full max-w-md space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/25 mb-2">Example outputs</p>
              {EXAMPLE_GENERATED.map((ex) => (
                <div
                  key={ex.platform}
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(0,0,0,0.07)",
                    borderLeft: `3px solid ${ex.color}`,
                  }}
                >
                  <p className="text-[11px] font-semibold mb-2" style={{ color: ex.color }}>
                    {ex.platform}
                  </p>
                  <p className="text-xs text-black/55 leading-relaxed whitespace-pre-line">{ex.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Generation panel */
          <div className="flex flex-col h-full">
            {/* Seed summary */}
            <div
              className="p-5 border-b"
              style={{ background: "rgba(255,255,255,0.8)", borderColor: "rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: PLATFORM_COLORS[selectedSeedData?.source || ""] }}
                >
                  <SourceIcon source={selectedSeedData?.source || ""} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black/80">{selectedSeedData?.title}</p>
                  <p className="text-xs text-black/40 mt-0.5 leading-relaxed">{selectedSeedData?.description}</p>
                </div>
              </div>
            </div>

            {/* Platform selector */}
            <div className="p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/35 mb-3">
                Select platforms
              </p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const isActive = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className="flex items-center gap-2 px-3 h-8 rounded-xl text-xs font-semibold transition-all"
                      style={
                        isActive
                          ? { background: p.color, color: "white", boxShadow: `0 4px 12px ${p.color}40` }
                          : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.08)" }
                      }
                    >
                      <p.icon size={13} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate button */}
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <motion.button
                onClick={handleGenerate}
                disabled={isGenerating || selectedPlatforms.length === 0}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full h-12 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2.5 disabled:opacity-50 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap size={16} />
                    </motion.div>
                    <span>Meta is writing your content...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Content with Meta</span>
                    <ChevronRight size={14} className="opacity-60" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Generated content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {isGenerating && (
                <div className="space-y-3">
                  {selectedPlatforms.map((pid) => {
                    const pl = PLATFORMS.find((p) => p.id === pid);
                    return (
                      <div
                        key={pid}
                        className="rounded-2xl p-4 animate-pulse"
                        style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-lg bg-black/08" style={{ background: `${pl?.color}20` }} />
                          <div className="h-3 w-24 rounded-full bg-black/08" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 rounded-full bg-black/06" />
                          <div className="h-3 rounded-full bg-black/06 w-5/6" />
                          <div className="h-3 rounded-full bg-black/06 w-4/6" />
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
                    const exampleContent =
                      pid === "linkedin"
                        ? "🚀 Just shipped a major update that I've been building in silence for weeks.\n\nWhat changed:\n→ Complete dashboard rebuild — faster, cleaner, smarter\n→ AI content generation now takes 3 seconds instead of 30\n→ Calendar and analytics now live in the same view\n\nThe lesson? Sometimes the best thing you can do for your product is start from scratch.\n\nWhat's the biggest refactor you've done that completely changed how your product feels? 👇\n\n#buildinpublic #saas #productdesign #ai"
                        : pid === "twitter"
                        ? "rebuilt our dashboard from scratch this week\n\nbefore: clunky, slow, confusing\nafter: fast, clean, focused\n\nthe rule: if you're embarrassed by how slow something loads, rewrite it\n\ntook 5 days. worth every hour 🔥"
                        : pid === "instagram"
                        ? "big update just dropped 🚀\n\nrebuilt the entire dashboard. faster loads, cleaner design, smarter AI.\n\nif your product doesn't feel fast and effortless, your users feel it every single time they open the app.\n\nwe fixed it. 🙏\n\n#developer #buildinpublic #saas #productupdate #ux #ai #startup"
                        : "Hook: I spent 5 days rebuilding our dashboard and here's exactly what I changed — and why it made everything better.\n\n[Subscribe reminder at 2:00]\n\nSection 1: What was wrong with the old design\nSection 2: The rebuild process — what we kept and what we threw out\nSection 3: Results — speed, user feedback, and what's next\n\nEnd question: Have you ever done a complete rebuild? Drop your story in the comments 👇";

                    return (
                      <motion.div
                        key={pid}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12, duration: 0.4 }}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: "rgba(255,255,255,0.85)",
                          border: "1px solid rgba(0,0,0,0.07)",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div
                          className="flex items-center justify-between px-4 py-3 border-b"
                          style={{ borderColor: "rgba(0,0,0,0.06)", background: `${pl.color}08` }}
                        >
                          <div className="flex items-center gap-2">
                            <pl.icon size={14} style={{ color: pl.color }} />
                            <span className="text-xs font-bold" style={{ color: pl.color }}>
                              {pl.label}
                            </span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: `${pl.color}15`, color: pl.color }}
                            >
                              Variation 1
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-semibold"
                              style={{
                                color: exampleContent.length <= pl.charLimit ? "#10b981" : "#ef4444",
                              }}
                            >
                              {exampleContent.length}/{pl.charLimit}
                            </span>
                            <CopyButton text={exampleContent} />
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-black/65 leading-relaxed whitespace-pre-line">
                            {exampleContent}
                          </p>
                        </div>
                        <div
                          className="flex items-center gap-2 px-4 py-3 border-t"
                          style={{ borderColor: "rgba(0,0,0,0.06)" }}
                        >
                          <button
                            className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium transition-all"
                            style={{ background: "rgba(79,70,229,0.08)", color: "#4f46e5", border: "1px solid rgba(79,70,229,0.15)" }}
                          >
                            <Send size={11} /> Refine
                          </button>
                          <button
                            className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium transition-all"
                            style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.15)" }}
                          >
                            Schedule
                          </button>
                          <button
                            className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium transition-all"
                            style={{ background: "#4f46e5", color: "white" }}
                          >
                            Publish Now
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}

              {!isGenerating && !generated && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles size={32} className="mb-3" style={{ color: "rgba(0,0,0,0.12)" }} />
                  <p className="text-sm text-black/30">
                    Hit Generate to create platform-ready content
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
