"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const AGENTS = [
  {
    name: "Skippy",
    role: "Screen & Workspace Intelligence",
    color: "#a0a0a0",
    badge: "Observer",
    desc: "Autonomous screen analysis and contextual workspace intelligence. Skippy silently watches your tools — GitHub, Notion, Figma — and converts your daily work into ready-to-publish content seeds without you documenting a thing.",
    powers: ["OCR extraction", "Activity tracking", "Content seed generation"],
    gradient: "from-gray-50 to-white",
    accent: "bg-gray-100",
    img: "/jet-sketch.png",
    imgAlt: "Blueprint sketch representing Skippy's precise workspace observation",
    keywords: "AI workspace observer, screen intelligence, automatic content extraction",
  },
  {
    name: "Meta",
    role: "AI Copywriter & Voice Engine",
    color: "#6b7280",
    badge: "Copywriter",
    desc: "Elite AI copywriter that generates platform-native content in your exact voice. Three strategic variations per prompt — emotional storytelling, technical precision, and outcome-led — for LinkedIn, Twitter, Instagram, and more.",
    powers: ["3-variation content generation", "Voice profile learning", "Multi-platform formatting"],
    gradient: "from-slate-50 to-white",
    accent: "bg-slate-100",
    img: "/jet-color.jpg",
    imgAlt: "Jet fighter launching — representing Meta's high-velocity content generation",
    keywords: "AI copywriter, social media content, voice learning, content variations",
  },
  {
    name: "Snooks",
    role: "Content Strategist & Scheduler",
    color: "#374151",
    badge: "Strategist",
    desc: "Your AI content strategist that thinks beyond individual posts. Snooks analyzes your content history, trending topics, and platform analytics to plan the optimal posting calendar and identify viral opportunities in your niche.",
    powers: ["Weekly content planning", "Optimal timing analysis", "Trend detection & alerts"],
    gradient: "from-zinc-50 to-white",
    accent: "bg-zinc-100",
    img: "/jet-sketch.png",
    imgAlt: "Jet blueprint — precision content strategy like Snooks",
    keywords: "content strategy AI, content calendar, viral content planning, trend analysis",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "CozyJet AI Agents",
  "description": "Autonomous AI agents for solopreneurs and startup founders — content creation, workspace intelligence, and marketing strategy powered by GPT-4 and Claude.",
  "itemListElement": AGENTS.map((agent, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": {
      "@type": "SoftwareApplication",
      "name": `CozyJet ${agent.name}`,
      "description": agent.desc,
      "applicationCategory": "BusinessApplication",
      "keywords": agent.keywords,
    },
  })),
};

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative rounded-2xl overflow-hidden flex flex-col h-full"
      aria-label={`${agent.name} — ${agent.role}`}
      style={{
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      {/* Image area */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "16/9",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
        aria-hidden="true"
      >
        <img
          src={agent.img}
          alt={agent.imgAlt}
          className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
          style={{ filter: "grayscale(100%) brightness(1.1)" }}
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)" }}
        />
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
            }}
          >
            {agent.badge}
          </span>
        </div>
        {/* Agent name on image */}
        <div className="absolute bottom-3 left-4">
          <h3 className="text-2xl font-bold text-white/90 tracking-tight font-pixel">{agent.name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <p
          className="text-[9px] font-bold uppercase tracking-[0.25em] mb-3"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {agent.role}
        </p>
        <p className="text-[11px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.50)" }}>
          {agent.desc}
        </p>

        <div className="mt-auto space-y-2" role="list" aria-label={`${agent.name} capabilities`}>
          {agent.powers.map((power) => (
            <div
              key={power}
              role="listitem"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="w-1 h-1 rounded-full bg-white/30" aria-hidden="true" />
              <span className="text-[10px] text-white/45 uppercase tracking-wider font-bold">{power}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Glass sheen */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        aria-hidden="true"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)" }}
      />
    </motion.article>
  );
}

export function AgentsShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springConfig = { damping: 40, stiffness: 150 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unX = glowX.on("change", (v) => setMousePos((p) => ({ ...p, x: v })));
    const unY = glowY.on("change", (v) => setMousePos((p) => ({ ...p, y: v })));
    return () => { unX(); unY(); };
  }, [glowX, glowY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <section
        id="agents"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="py-48 px-6 bg-black relative overflow-hidden group"
        aria-labelledby="agents-heading"
        itemScope
        itemType="https://schema.org/ItemList"
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage: `radial-gradient(circle 500px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.5) 40%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle 500px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.5) 40%, transparent 100%)`,
          }}
        />

        <motion.div
          aria-hidden="true"
          style={{
            left: glowX,
            top: glowY,
            background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 75%)",
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none blur-[100px] z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <header className="text-center mb-24 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative inline-block py-10"
            >
              <motion.h2
                id="agents-heading"
                animate={{
                  scaleY: [1, 1, 0.05, 1, 1, 0.05, 1],
                  opacity: [1, 1, 0.4, 1, 1, 0.2, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  times: [0, 0.7, 0.72, 0.74, 0.9, 0.92, 1],
                  ease: "easeInOut",
                }}
                className="font-pixel text-4xl md:text-5xl lg:text-6xl font-bold mb-8 relative z-10 leading-tight tracking-tight text-white uppercase origin-center"
              >
                Meet Your AI<br />
                <span className="text-white/60 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">Agent Team</span>
              </motion.h2>
            </motion.div>

            <p className="text-white/40 max-w-2xl mx-auto font-pixel text-[10px] leading-loose uppercase tracking-[0.2em] mb-4">
              Autonomous AI agents engineered for solopreneurs, developers & founders.
            </p>
            <p className="text-white/25 max-w-xl mx-auto text-[12px] leading-relaxed" style={{ fontFamily: "var(--font-space, sans-serif)" }}>
              Skippy observes your work. Meta writes your content. Snooks plans your strategy.
              Three specialized agents working as one intelligent marketing engine.
            </p>
          </header>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            role="list"
            aria-label="AI agents"
          >
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.name}
                role="listitem"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <AgentCard agent={agent} />
              </motion.div>
            ))}
          </div>

          {/* SEO-friendly summary paragraph — visually hidden from design but readable by crawlers */}
          <p className="sr-only">
            CozyJet AI provides three specialized artificial intelligence agents for content marketing automation:
            Skippy, an AI workspace observer that automatically extracts content ideas from GitHub commits, Notion pages, Figma files, and Google Drive documents;
            Meta, an AI copywriter that generates three strategic content variations in the user&apos;s authentic voice for LinkedIn, Twitter, Instagram, and YouTube;
            and Snooks, an AI content strategist that analyzes posting patterns, engagement analytics, and trending topics to recommend the optimal content calendar.
            Built for solopreneurs, indie hackers, startup founders, and solo developers who want to grow their social media presence without spending hours writing content manually.
          </p>
        </div>
      </section>
    </>
  );
}
