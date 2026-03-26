"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const AGENTS = [
  {
    name: "Skippy",
    role: "Content Brain — Intelligence Layer",
    color: "#60a5fa",
    badge: "Content Brain",
    desc: "Five-method content capture engine: voice input, screenshot OCR, real-time workspace monitoring, direct text, and screen analysis. Transforms raw context into marketing-ready intelligence in seconds — your AI's eyes and ears.",
    powers: ["Voice → Marketing Gold", "Screenshot OCR Analysis", "Real-Time Workspace Intel", "Anti-Distraction Logic"],
    img: "/assets/jet-blueprint-top.png",
    imgAlt: "Jet blueprint top-down — Skippy precision intelligence"
  },
  {
    name: "Flippo",
    role: "Content Planner — Strategic Orchestrator",
    color: "#a78bfa",
    badge: "Content Planner",
    desc: "AI-powered productivity timelines, deep work scoring, and napkin.ai-style strategy generation. Converts workspace context into actionable content calendars and platform-specific viral launch sequences with focus matrix scoring.",
    powers: ["AI Timeline Generation", "Deep Work Flow Scoring", "Content Calendar Matrix", "Launch Sequence Engine"],
    img: "/assets/jet-fighter-top.png",
    imgAlt: "Fighter jet top-down — Flippo strategic power"
  },
  {
    name: "Snooks",
    role: "Content Factory — Viral Content Engine",
    color: "#34d399",
    badge: "Content Factory",
    desc: "Platform-native viral content creation across LinkedIn, Twitter, Instagram, YouTube, and Reddit in under 30 seconds. Elite SEO-optimized hooks, growth playbooks, and multi-platform sync engineered for maximum organic reach.",
    powers: ["30-Second Viral Generation", "Multi-Platform SEO Copy", "Growth Playbook Engine", "Platform-Native Hooks"],
    img: "/assets/jet-blueprint-top.png",
    imgAlt: "Jet blueprint — Snooks precision marketing"
  },
];

function GlassCard({ agent }: { agent: typeof AGENTS[0] }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative rounded-2xl overflow-hidden flex flex-col h-full"
      style={{
        background: "rgba(6, 12, 36, 0.72)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: `1px solid ${agent.color}33`,
        boxShadow: `0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Colored top accent line */}
      <div className="absolute top-0 inset-x-0 h-[2px] z-20"
        style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }} />

      {/* Image area */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "4/3",
          background: "rgba(0,0,0,0.3)",
          borderBottom: `1px solid ${agent.color}22`,
        }}
      >
        <img
          src={agent.img}
          alt={agent.imgAlt}
          className="absolute inset-0 w-full h-full object-contain object-center"
          style={{
            opacity: 0.55,
            filter: `brightness(1.15) drop-shadow(0 0 30px ${agent.color}44)`,
            padding: "12px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)`,
          }}
        />
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5"
            style={{
              background: `${agent.color}22`,
              border: `1px solid ${agent.color}55`,
              color: agent.color,
              backdropFilter: "blur(8px)",
              borderRadius: "3px",
            }}
          >
            {agent.badge}
          </span>
        </div>
        {/* Agent name on image */}
        <div className="absolute bottom-4 left-4">
          <h3 className="text-3xl font-bold tracking-tight font-pixel"
            style={{ color: "rgba(255,255,255,0.95)", textShadow: `0 0 30px ${agent.color}88, 0 2px 8px rgba(0,0,0,0.8)` }}>
            {agent.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <p
          className="text-[8px] font-bold uppercase tracking-[0.3em] mb-3"
          style={{ color: agent.color, opacity: 0.8 }}
        >
          {agent.role}
        </p>
        <p className="text-[11px] leading-relaxed mb-5" style={{ color: "rgba(200,220,255,0.6)" }}>
          {agent.desc}
        </p>

        <div className="mt-auto space-y-2">
          {agent.powers.map((power) => (
            <div
              key={power}
              className="flex items-center gap-2.5 px-3 py-2"
              style={{
                background: `${agent.color}0d`,
                border: `1px solid ${agent.color}22`,
                borderRadius: "4px",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: agent.color, opacity: 0.7 }} />
              <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: agent.color, opacity: 0.85 }}>{power}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Glass sheen */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
        }}
      />
    </motion.div>
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
    <section
      id="agents"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="py-48 px-6 bg-black relative overflow-hidden group"
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1.5px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage: `radial-gradient(circle 500px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.5) 40%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 500px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.5) 40%, transparent 100%)`,
        }}
      />

      <motion.div
        style={{
          left: glowX,
          top: glowY,
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 75%)",
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none blur-[100px] z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative inline-block py-10"
          >
            <motion.h2
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
              The Agent <br />
              <span className="text-white/60 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">Core Matrix</span>
            </motion.h2>
          </motion.div>

          <p className="text-white/30 max-w-2xl mx-auto font-pixel text-[10px] leading-loose uppercase tracking-[0.2em]">
            Autonomous entities engineered for pixel-perfect execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AGENTS.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard agent={agent} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
