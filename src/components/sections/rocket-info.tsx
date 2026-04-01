"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const STEPS = [
  {
    phase: "PHASE 01",
    title: "SKIPPY OBSERVES",
    description: "Your AI silent observer automatically connects to GitHub, Notion, Figma, Google Drive, and Google Calendar. Every commit you push, every doc you update, every design you ship — Skippy reads it, summarises it through a Claude-powered reasoning chain, and converts it into a ready-to-use content seed in seconds. Zero manual input. You build. Skippy watches. Your story writes itself.",
    rotate: -1.8,
    icon: "👁",
  },
  {
    phase: "PHASE 02",
    title: "SNOOKS STRATEGISES",
    description: "Snooks is your always-on content strategist. It analyses your Skippy seed feed, checks your historical engagement data, scans trending topics in your niche, and builds a full weekly posting calendar with optimal timing per platform. When you type 'auto' in chat, Snooks instantly registers a note to your calendar. No spreadsheets. No guesswork. Your content week is planned before you finish your morning coffee.",
    rotate: 1.2,
    icon: "📅",
  },
  {
    phase: "PHASE 03",
    title: "META WRITES",
    description: "Meta is the copywriter that learns your voice. Feed it a content seed from Skippy, a rough idea, or a trending topic flagged by Snooks — and it produces three platform-specific content variations: one emotional narrative, one technical deep-dive, one results-led hook. Every refinement you request trains your voice profile. After two weeks of use, Meta's first draft already sounds like you. Not AI. You.",
    rotate: -1.2,
    icon: "✍️",
  },
  {
    phase: "PHASE 04",
    title: "SECURITY & PRIVACY",
    description: "All three agents operate on encrypted, session-scoped reasoning — no data is stored between conversations. Your GitHub tokens, Notion keys, and Figma credentials never leave your environment. AI processing runs through your own API keys, meaning no third party ever sees your content, code, or strategy. CozyJet follows zero-log architecture: we see your subscription status, nothing else. Your work stays yours.",
    rotate: 1.5,
    icon: "🔐",
  },
  {
    phase: "PHASE 05",
    title: "VOICE TUNING",
    description: "The Tuning agent is the difference between AI content and your content. Paste any AI-generated draft and Tuning rewrites it to match your documented voice profile — adjusting sentence length, removing corporate phrases, matching your punctuation patterns, and inserting your specific vocabulary. Over time it builds a living style guide from your refinements. The longer you use it, the more it sounds like you wrote it yourself.",
    rotate: -1.5,
    icon: "🎙",
  },
  {
    phase: "PHASE 06",
    title: "LAUNCH & SCALE",
    description: "CozyJet is built for solopreneurs who ship fast and want to market smarter — not harder. From the first seed detected to a scheduled post approved by you, the entire cycle takes under three minutes. No agency. No content manager. No second job. Three AI agents working in the background while you focus on building the product your audience is already watching. This is organic marketing on autopilot.",
    rotate: 1.0,
    icon: "🚀",
  },
];

const N = STEPS.length;

function StepCard({ step, scrollProgress, index }: {
  step: typeof STEPS[0];
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
}) {
  const segLen = 1 / N;
  const s = index * segLen;
  const e = s + segLen;
  const opacity = useTransform(scrollProgress, [s, s + 0.05, e - 0.05, e], [0, 1, 1, index < N - 1 ? 0 : 1]);
  const y       = useTransform(scrollProgress, [s, s + 0.05, e - 0.05, e], [50, 0, 0, index < N - 1 ? -50 : 0]);

  return (
    <motion.div
      style={{ opacity, y, rotate: step.rotate }}
      className="absolute inset-0 flex items-center justify-center lg:justify-start"
    >
      <motion.div
        animate={{ y: [0, -4, 0], rotate: [step.rotate, step.rotate + 0.4, step.rotate] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-[460px] relative"
        style={{
          background: "linear-gradient(160deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
          border: "2px solid rgba(0,0,0,0.82)",
          borderRadius: "3px",
          boxShadow: "7px 7px 0px 0px rgba(0,0,0,0.88), 0 16px 48px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-black/60 z-10"
          style={{ background: "#ef4444", boxShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}
        />
        <div className="px-5 py-2.5 border-b-2 border-black/80 flex items-center gap-3" style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }}>
          <span style={{ fontSize: 20 }}>{step.icon}</span>
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-black/70" />
            <span className="text-[11px] text-black font-bold tracking-[0.22em] uppercase">{step.phase}</span>
          </div>
        </div>
        <div className="px-8 pt-5 pb-7">
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-black/90 uppercase leading-tight tracking-tight">
            {step.title}
          </h3>
          <p className="text-[12px] md:text-[13.5px] leading-[1.85] text-black/68">
            {step.description}
          </p>
          <div className="mt-5 space-y-1.5">
            {[0, 1, 2].map(l => (
              <div key={l} className="h-[1.5px] rounded-full opacity-15" style={{ background: "#000", width: `${82 - l * 15}%` }} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-8 h-8" style={{ background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.12) 50%)" }} />
      </motion.div>
    </motion.div>
  );
}

export function RocketInfo() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* Background starts pure white, transitions as user scrolls */
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.12, 0.4, 0.7, 1],
    ["#ffffff", "#ffffff", "#eef6fd", "#c8e8fa", "#9ed4f0"]
  );

  const cloudY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const cloudScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);

  /* White flash overlay that fades out as user starts scrolling */
  const flashOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  const clipPath = useTransform(
    scrollYProgress,
    [0.05, 0.9],
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );

  return (
    <section ref={containerRef} style={{ height: `${N * 100}vh` }} className="relative font-pixel">

      {/* Scrolling background */}
      <motion.div
        style={{ backgroundColor: bgColor }}
        className="sticky top-0 h-screen w-full pointer-events-none z-0 overflow-hidden"
      >
        {/* Full white flash overlay — visible at top, fades as scrolling begins */}
        <motion.div
          style={{ opacity: flashOpacity, backgroundColor: "#ffffff" }}
          className="absolute inset-0 z-10"
          aria-hidden="true"
        />

        <motion.div style={{ y: cloudY, scale: cloudScale }} className="absolute inset-0">
          <div
            className="absolute top-[8%] left-[12%] w-[55vw] h-[55vw] rounded-full"
            style={{ backgroundColor: "rgba(186,230,255,0.55)", filter: "blur(130px)" }}
          />
          <div
            className="absolute top-[38%] right-[8%] w-[48vw] h-[48vw] rounded-full"
            style={{ backgroundColor: "rgba(147,214,255,0.45)", filter: "blur(150px)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle, #1d4ed8 1px, transparent 0)", backgroundSize: "28px 28px" }}
          />
        </motion.div>
      </motion.div>

      {/* Sticky content */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24 overflow-hidden z-10">

          {/* Left — phase note cards */}
          <div className="relative w-full lg:w-1/2 h-full flex flex-col justify-center pointer-events-auto">
            <div className="relative h-[500px] w-full max-w-lg mx-auto lg:mx-0">
              {STEPS.map((step, index) => (
                <StepCard
                  key={step.phase}
                  step={step}
                  scrollProgress={scrollYProgress}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Right — jet images */}
          <div className="relative w-full lg:w-2/5 aspect-[3/4] flex items-center justify-center pointer-events-auto">
            <div className="relative w-full h-full max-h-[78vh]">
              <div className="absolute inset-0 z-0">
                <Image
                  src="/jet-blueprint.png"
                  alt="Jet Blueprint Sketch"
                  fill
                  className="object-contain opacity-35"
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
              <motion.div className="absolute inset-0 z-10" style={{ clipPath }}>
                <Image
                  src="/jet-color.png"
                  alt="Jet Fighter"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
