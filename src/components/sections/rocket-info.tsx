"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const STEPS = [
  {
    phase: "PHASE 01",
    title: "VISION",
    description: "DESCRIBE YOUR PROJECT ONCE. OUR AGENTS ANALYZE YOUR MARKET TO BUILD A PERSISTENT AI CONTEXT.",
  },
  {
    phase: "PHASE 02",
    title: "SECURITY",
    description: "FULLY LOCAL ENCRYPTED AI. OUR AGENTS OPERATE ON AIR-GAPPED LOGIC—THEY SEE, THEY UNDERSTAND, BUT THEY NEVER STORE. 100% PRIVATE, UNHACKABLE EXECUTION.",
  },
  {
    phase: "PHASE 03",
    title: "ENGINE",
    description: "DISTRIBUTED BACKEND REASONING. YOUR TEAM EXECUTES COMPLEX CROSS-PLATFORM TASKS ON OUR AUTONOMOUS ENGINE.",
  },
  {
    phase: "PHASE 04",
    title: "RESULT",
    description: "OPTIMIZED VIRAL LAUNCH. HIGH-FIDELITY CONTENT TAILORED FOR PLATFORM-SPECIFIC HOOKS AND FLOWS.",
  },
];

export function RocketInfo() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* ── Background colour: white → light sky blue ── */
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    ["#ffffff", "#e8f4fd", "#bde3f8", "#93cfef"]
  );

  /* ── Floating orbs parallax ── */
  const cloudY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const cloudScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);

  /* ── Orb colours shift with scroll ── */
  const orb1Color = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgba(255,255,255,0.7)", "rgba(186,230,255,0.6)", "rgba(125,206,255,0.5)"]
  );
  const orb2Color = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgba(240,248,255,0.5)", "rgba(147,214,255,0.45)", "rgba(100,190,255,0.4)"]
  );

  /* ── Image wipe clipPath ── */
  const clipPath = useTransform(
    scrollYProgress,
    [0.1, 0.9],
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );

  /* ── Image white glow brightness grows with scroll ── */
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 0.9, 1]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  /* ── Phase card animations ── */
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0]);
  const y1      = useTransform(scrollYProgress, [0, 0.2, 0.25], [0, 0, -50]);
  const opacity2 = useTransform(scrollYProgress, [0.25, 0.3, 0.45, 0.5], [0, 1, 1, 0]);
  const y2      = useTransform(scrollYProgress, [0.25, 0.3, 0.45, 0.5], [50, 0, 0, -50]);
  const opacity3 = useTransform(scrollYProgress, [0.5, 0.55, 0.7, 0.75], [0, 1, 1, 0]);
  const y3      = useTransform(scrollYProgress, [0.5, 0.55, 0.7, 0.75], [50, 0, 0, -50]);
  const opacity4 = useTransform(scrollYProgress, [0.75, 0.8, 1], [0, 1, 1]);
  const y4      = useTransform(scrollYProgress, [0.75, 0.8, 1], [50, 0, 0]);

  const opacities = [opacity1, opacity2, opacity3, opacity4];
  const ys        = [y1, y2, y3, y4];

  return (
    <section ref={containerRef} className="relative h-[500vh] font-pixel">
      {/* ── Animated background ── */}
      <motion.div
        style={{ backgroundColor: bgColor }}
        className="sticky top-0 h-screen w-full pointer-events-none z-0 overflow-hidden"
      >
        {/* Floating orbs layer */}
        <motion.div style={{ y: cloudY, scale: cloudScale }} className="absolute inset-0">
          {/* Orb 1 – top-left */}
          <motion.div
            style={{ backgroundColor: orb1Color }}
            className="absolute top-[8%] left-[12%] w-[55vw] h-[55vw] blur-[130px] rounded-full"
          />
          {/* Orb 2 – bottom-right */}
          <motion.div
            style={{ backgroundColor: orb2Color }}
            className="absolute top-[38%] right-[8%] w-[48vw] h-[48vw] blur-[150px] rounded-full"
          />
          {/* Orb 3 – centre accent */}
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.35, 0.6]),
            }}
            className="absolute top-[20%] left-[35%] w-[40vw] h-[40vw] bg-[#7dd3fc] blur-[180px] rounded-full"
          />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle, #1d4ed8 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </motion.div>

        {/* Bottom horizon gradient that deepens with scroll */}
        <motion.div
          style={{
            opacity: useTransform(scrollYProgress, [0, 1], [0, 0.35]),
            background: "linear-gradient(to top, rgba(56,189,248,0.5), transparent)",
          }}
          className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
        />
      </motion.div>

      {/* ── Sticky content layer ── */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24 overflow-hidden z-10">

          {/* Left: phase cards */}
          <div className="relative w-full lg:w-1/2 h-full flex flex-col justify-center pointer-events-auto">
            <div className="relative h-[400px] w-full max-w-md mx-auto lg:mx-0">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.phase}
                  style={{ opacity: opacities[index], y: ys[index], rotate: index % 2 === 0 ? -1 : 1 }}
                  className="absolute inset-0 flex items-center justify-center lg:justify-start"
                >
                  <div className="w-full max-w-[400px] p-10 border border-black/5 rounded-sm bg-white/90 backdrop-blur-2xl shadow-[30px_30px_70px_-20px_rgba(0,0,0,0.08)] relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black/5 border border-black/10" />
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-[2px] bg-black" />
                      <span className="text-[10px] text-black font-bold tracking-[0.2em] uppercase">{step.phase}</span>
                    </div>
                    <h3 className="text-sm md:text-xl font-bold mb-6 text-black uppercase leading-tight tracking-tighter">
                      {step.title}
                    </h3>
                    <p className="text-[9px] md:text-[11px] leading-relaxed text-black/60 uppercase font-bold">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Jet images */}
          <div className="relative w-full lg:w-2/5 aspect-[3/4] flex items-center justify-center pointer-events-auto">
            <div className="relative w-full h-full max-h-[75vh]">

              {/* ── Pure white radial halo (grows with scroll) ── */}
              <motion.div
                style={{ opacity: glowOpacity, scale: glowScale }}
                className="absolute inset-0 -z-10 pointer-events-none"
              >
                {/* Outer feathered white circle */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] rounded-full"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 22%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.2) 65%, transparent 80%)",
                  }}
                />
                {/* Inner tight white bloom */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 30%, rgba(255,255,255,0.7) 55%, transparent 75%)",
                    filter: "blur(8px)",
                  }}
                />
              </motion.div>

              {/* Edge vignette — pure white fade on all four sides */}
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(ellipse at center, transparent 35%, rgba(255,255,255,0.55) 65%, rgba(255,255,255,0.95) 85%, white 100%)
                  `,
                }}
              />

              {/* Sketch layer */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/jet-sketch.png"
                  alt="Jet Blueprint Sketch"
                  fill
                  className="object-contain opacity-45 grayscale"
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>

              {/* Color wipe layer */}
              <motion.div className="absolute inset-0 z-10" style={{ clipPath }}>
                <Image
                  src="/jet-color.jpg"
                  alt="Jet Fighter"
                  fill
                  className="object-contain drop-shadow-[0_20px_60px_rgba(0,100,200,0.15)]"
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
