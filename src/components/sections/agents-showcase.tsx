"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const AGENTS = [
  {
    name: "Skippy",
    role: "Screen Intelligence",
    color: "#a0a0a0",
    badge: "Observer",
    desc: "Autonomous screen analysis and contextual workspace assistance with real-time signal delivery.",
    powers: ["OCR extraction", "Activity tracking", "Anti-stuck logic"],
    gradient: "from-gray-50 to-white",
    accent: "bg-gray-100",
    img: "/jet-sketch.png",
    imgAlt: "Blueprint sketch of jet — technical precision like Skippy"
  },
  {
    name: "Flippo",
    role: "Productivity Brain",
    color: "#6b7280",
    badge: "Timeline",
    desc: "Data-driven productivity insights, deep work scoring, and napkin.ai-style timeline generation.",
    powers: ["Timeline generation", "Flow state analysis", "Focus matrix"],
    gradient: "from-slate-50 to-white",
    accent: "bg-slate-100",
    img: "/jet-color.jpg",
    imgAlt: "Fighter jet launching — Flippo's productivity engine"
  },
  {
    name: "Snooks",
    role: "Marketing Head",
    color: "#374151",
    badge: "Marketing",
    desc: "Elite content strategy and viral generation. Platform-native hooks, SEO, and growth playbooks.",
    powers: ["Viral hook drafting", "Multi-platform sync", "SEO optimization"],
    gradient: "from-zinc-50 to-white",
    accent: "bg-zinc-100",
    img: "/jet-sketch.png",
    imgAlt: "Jet blueprint — precision marketing like Snooks"
  },
];

function GlassCard({ agent }: { agent: typeof AGENTS[0] }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative rounded-2xl overflow-hidden flex flex-col h-full"
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
      >
        <img
          src={agent.img}
          alt={agent.imgAlt}
          className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
          style={{ filter: "grayscale(100%) brightness(1.1)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)",
          }}
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
        <p className="text-[11px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
          {agent.desc}
        </p>

        <div className="mt-auto space-y-2">
          {agent.powers.map((power) => (
            <div
              key={power}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{power}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Glass sheen */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
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
