"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, Check, BookOpen, Sliders as SlidersIcon, Brain,
  Linkedin, Twitter, Instagram, Youtube, RotateCcw,
} from "lucide-react";

const TONE_TAGS = ["Direct", "Motivational", "Storytelling", "Analytical", "Witty", "Empathetic", "Authoritative"];
const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  { id: "twitter", label: "Twitter/X", icon: Twitter, color: "#1DA1F2" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000" },
];
const EMOJI_OPTIONS = ["None", "Low", "Medium", "High"];

const LEARNED_PREFERENCES = [
  { id: "1", time: "Mar 27, 2026 · 3:41 PM", text: "Learned: shorter sentences preferred on Twitter" },
  { id: "2", time: "Mar 25, 2026 · 11:22 AM", text: "Detected: removed formal language in 3 edits" },
  { id: "3", time: "Mar 22, 2026 · 9:05 AM", text: "Learned: stronger opening hooks preferred across all platforms" },
  { id: "4", time: "Mar 20, 2026 · 4:17 PM", text: "Detected: emoji usage increased — now Low → Medium" },
  { id: "5", time: "Mar 18, 2026 · 2:33 PM", text: "Learned: numbered lists increase engagement for your LinkedIn posts" },
];

function SliderControl({
  label, min, max, minLabel, maxLabel, value, onChange, color = "#4f46e5",
}: {
  label: string; min: number; max: number; minLabel: string; maxLabel: string;
  value: number; onChange: (v: number) => void; color?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-black/65">{label}</p>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
          {value}/10
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-black/30 w-24 text-right leading-tight">{minLabel}</span>
        <input
          type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: color }}
        />
        <span className="text-[10px] text-black/30 w-24 leading-tight">{maxLabel}</span>
      </div>
    </div>
  );
}

export default function TuningPage() {
  const [samples, setSamples] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState("linkedin");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [formality, setFormality] = useState(5);
  const [technicalDepth, setTechnicalDepth] = useState(6);
  const [humor, setHumor] = useState(4);
  const [emojiUsage, setEmojiUsage] = useState("Low");
  const [tones, setTones] = useState(["Direct", "Storytelling"]);
  const [preferredPlatforms, setPreferredPlatforms] = useState(["linkedin", "twitter"]);
  const [savedIndicator, setSavedIndicator] = useState(false);

  const handleAnalyze = async () => {
    if (!samples.trim()) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2400));
    setIsAnalyzing(false);
    setAnalyzed(true);
    setFormality(4);
    setTechnicalDepth(7);
    setHumor(3);
    setEmojiUsage("Low");
    setTones(["Direct", "Analytical", "Authoritative"]);
  };

  const triggerSave = () => {
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 1800);
  };

  const toggleTone = (t: string) => {
    setTones((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
    triggerSave();
  };

  const togglePlatform = (id: string) => {
    setPreferredPlatforms((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    triggerSave();
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto" style={{ background: "#f5f5f7", minHeight: "calc(100vh - 44px)" }}>
      {/* Section 1 — Writing Samples */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(79,70,229,0.1)" }}>
            <BookOpen size={17} style={{ color: "#4f46e5" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-black/80">Teach CozyJet your voice</p>
            <p className="text-[11px] text-black/35">Paste 3–10 examples of your best posts or articles</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-black/35 mb-2 block">
              Source Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSourcePlatform(p.id)}
                  className="flex items-center gap-1.5 px-3 h-7 rounded-xl text-xs font-semibold transition-all"
                  style={
                    sourcePlatform === p.id
                      ? { background: p.color, color: "white", boxShadow: `0 4px 12px ${p.color}40` }
                      : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.08)" }
                  }
                >
                  <p.icon size={12} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={samples}
            onChange={(e) => setSamples(e.target.value)}
            placeholder={`Paste some of your best social media posts, tweets, or articles here — 3 to 10 examples works best.\n\nMeta will read your writing and learn your unique tone, vocabulary, humor style, and preferred structure...`}
            className="w-full rounded-xl text-sm text-black/65 resize-none outline-none p-4 placeholder:text-black/25 leading-relaxed"
            style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)", minHeight: 180 }}
          />
          <motion.button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !samples.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2.5 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
          >
            {isAnalyzing ? (
              <><Loader2 size={15} className="animate-spin" /> Meta is reading your writing style...</>
            ) : analyzed ? (
              <><Check size={15} /> Voice profile updated — analyze again</>
            ) : (
              <><Sparkles size={15} /> Analyze My Voice</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Section 2 — Voice Profile */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
              <SlidersIcon size={17} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-black/80">Voice Profile</p>
              <p className="text-[11px] text-black/35">Fine-tune how Meta writes for you — auto-saved</p>
            </div>
          </div>
          <AnimatePresence>
            {savedIndicator && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600"
              >
                <Check size={12} /> Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-6 space-y-6">
          <SliderControl label="Formality" min={1} max={10} minLabel="Very Casual" maxLabel="Very Professional"
            value={formality} onChange={(v) => { setFormality(v); triggerSave(); }} color="#4f46e5" />
          <SliderControl label="Technical Depth" min={1} max={10} minLabel="Beginner Friendly" maxLabel="Expert Level"
            value={technicalDepth} onChange={(v) => { setTechnicalDepth(v); triggerSave(); }} color="#0ea5e9" />
          <SliderControl label="Humor" min={1} max={10} minLabel="Serious" maxLabel="Very Playful"
            value={humor} onChange={(v) => { setHumor(v); triggerSave(); }} color="#f59e0b" />

          <div>
            <p className="text-xs font-semibold text-black/65 mb-2">Emoji Usage</p>
            <div className="flex gap-2">
              {EMOJI_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => { setEmojiUsage(opt); triggerSave(); }}
                  className="flex-1 h-8 rounded-xl text-xs font-semibold transition-all"
                  style={emojiUsage === opt
                    ? { background: "#4f46e5", color: "white" }
                    : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.08)" }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-black/65 mb-2">Tone Tags</p>
            <div className="flex flex-wrap gap-2">
              {TONE_TAGS.map((tag) => (
                <button key={tag} onClick={() => toggleTone(tag)}
                  className="px-3 h-7 rounded-xl text-xs font-semibold transition-all"
                  style={tones.includes(tag)
                    ? { background: "#4f46e5", color: "white" }
                    : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.08)" }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-black/65 mb-2">Preferred Platforms</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button key={p.id} onClick={() => togglePlatform(p.id)}
                  className="flex items-center gap-1.5 px-3 h-7 rounded-xl text-xs font-semibold transition-all"
                  style={preferredPlatforms.includes(p.id)
                    ? { background: p.color, color: "white" }
                    : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.08)" }}>
                  <p.icon size={11} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3 — Continuous Learning */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
            <Brain size={17} style={{ color: "#10b981" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-black/80">Continuous Learning</p>
            <p className="text-[11px] text-black/35">How Meta learns from every refinement and approved post</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-xs text-black/45 leading-relaxed mb-5">
            Every time you refine a post, approve content, or edit a generation, Meta detects your preferences and updates your voice profile automatically — making every future generation more accurate to your authentic writing style.
          </p>
          <div className="space-y-2.5">
            {LEARNED_PREFERENCES.map((pref, i) => (
              <motion.div
                key={pref.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-black/65">{pref.text}</p>
                    <p className="text-[10px] text-black/30 mt-0.5">{pref.time}</p>
                  </div>
                </div>
                <button
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,0,0,0.04)" }}
                  title="Undo"
                >
                  <RotateCcw size={11} className="text-black/30" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
