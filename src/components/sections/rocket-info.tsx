"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const STEPS = [
  {
    phase: "PHASE 01",
    title: "VISION",
    description: "DESCRIBE YOUR PROJECT ONCE. OUR AGENTS ANALYZE YOUR MARKET TO BUILD A PERSISTENT AI CONTEXT.",
    rotate: -2,
  },
  {
    phase: "PHASE 02",
    title: "SECURITY",
    description: "FULLY LOCAL ENCRYPTED AI. OUR AGENTS OPERATE ON AIR-GAPPED LOGIC—THEY SEE, THEY UNDERSTAND, BUT THEY NEVER STORE. 100% PRIVATE, UNHACKABLE EXECUTION.",
    rotate: 1.5,
  },
  {
    phase: "PHASE 03",
    title: "ENGINE",
    description: "DISTRIBUTED BACKEND REASONING. YOUR TEAM EXECUTES COMPLEX CROSS-PLATFORM TASKS ON OUR AUTONOMOUS ENGINE.",
    rotate: -1.5,
  },
  {
    phase: "PHASE 04",
    title: "RESULT",
    description: "OPTIMIZED VIRAL LAUNCH. HIGH-FIDELITY CONTENT TAILORED FOR PLATFORM-SPECIFIC HOOKS AND FLOWS.",
    rotate: 2,
  },
];

export function RocketInfo() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const cloudY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const cloudScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);

  const clipPath = useTransform(
    scrollYProgress,
    [0.1, 0.9],
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );

  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 0.9, 1]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

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
      <div
        className="sticky top-0 h-screen w-full pointer-events-none z-0 overflow-hidden"
        style={{ backgroundColor: "#ffffff" }}
      >
        <motion.div style={{ y: cloudY, scale: cloudScale }} className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{ backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 0)", backgroundSize: "28px 28px" }}
          />
        </motion.div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24 overflow-hidden z-10">

          <div className="relative w-full lg:w-1/2 h-full flex flex-col justify-center pointer-events-auto">
            <div className="relative h-[420px] w-full max-w-md mx-auto lg:mx-0">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.phase}
                  style={{ opacity: opacities[index], y: ys[index], rotate: step.rotate }}
                  className="absolute inset-0 flex items-center justify-center lg:justify-start"
                >
                  <motion.div
                    animate={{
                      y: [0, -4, 0],
                      rotate: [step.rotate, step.rotate + 0.4, step.rotate],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full max-w-[420px] relative"
                    style={{
                      background: "linear-gradient(160deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
                      border: "2px solid rgba(0,0,0,0.85)",
                      borderRadius: "2px",
                      boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.9), 0 12px 40px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-black/60 z-10"
                      style={{ background: "#ef4444", boxShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}
                    />

                    <div
                      className="px-4 py-2 border-b-2 border-black/80"
                      style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-[2px] bg-black/70" />
                        <span className="text-[11px] text-black font-bold tracking-[0.2em] uppercase">{step.phase}</span>
                      </div>
                    </div>

                    <div className="px-8 pt-6 pb-8">
                      <h3 className="text-2xl md:text-3xl font-bold mb-5 text-black/90 uppercase leading-tight tracking-tighter">
                        {step.title}
                      </h3>
                      <p className="text-[11px] md:text-[13px] leading-relaxed text-black/70 uppercase font-bold">
                        {step.description}
                      </p>
                      <div className="mt-6 space-y-1.5">
                        {[0, 1, 2].map((l) => (
                          <div key={l} className="h-[1.5px] rounded-full opacity-20"
                            style={{ background: "#000", width: `${80 - l * 15}%` }} />
                        ))}
                      </div>
                    </div>

                    <div className="absolute bottom-0 right-0 w-8 h-8"
                      style={{ background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.12) 50%)" }} />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative w-full lg:w-2/5 aspect-[3/4] flex items-center justify-center pointer-events-auto">
            <div className="relative w-full h-full max-h-[75vh]">
              <motion.div style={{ opacity: glowOpacity, scale: glowScale }}
                className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] rounded-full"
                  style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 22%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.2) 65%, transparent 80%)" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full"
                  style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 30%, rgba(255,255,255,0.7) 55%, transparent 75%)", filter: "blur(8px)" }} />
              </motion.div>
              <div className="absolute inset-0 z-20 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(255,255,255,0.55) 65%, rgba(255,255,255,0.95) 85%, white 100%)" }} />
              <div className="absolute inset-0 z-0">
                <Image src="/assets/jet-blueprint-top.png" alt="Jet Blueprint Top View" fill className="object-contain opacity-40" priority sizes="(max-width: 768px) 100vw, 40vw" />
              </div>
              <motion.div className="absolute inset-0 z-10" style={{ clipPath }}>
                <Image src="/assets/jet-fighter-top.png" alt="Jet Fighter Top View" fill className="object-contain drop-shadow-[0_20px_60px_rgba(0,100,200,0.2)]" priority sizes="(max-width: 768px) 100vw, 40vw" />
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
