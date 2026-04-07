"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { useReplitAuth } from "@/contexts/replit-auth-context";
import { ArrowRight, Check } from "lucide-react";

const ONBOARDING_KEY = "cozyjet_onboarding_done";

/* ─── Questions ─── */
const QUESTIONS = [
  {
    id: "niche",
    step: 1,
    label: "What's your niche?",
    subtitle: "Tell us what world you create in",
    type: "text",
    placeholder: "e.g. SaaS founder, product designer, developer…",
  },
  {
    id: "goal",
    step: 2,
    label: "What's your primary goal?",
    subtitle: "Pick the one that matters most right now",
    type: "choice",
    options: [
      "Build my personal brand",
      "Grow an audience",
      "Generate leads for my business",
      "Become a thought leader",
      "Monetise my expertise",
    ],
  },
  {
    id: "reason",
    step: 3,
    label: "Why did you join CozyJet?",
    subtitle: "Help us understand what brought you here",
    type: "choice",
    options: [
      "Save time on content creation",
      "Improve consistency",
      "Write better, smarter content",
      "Build systems that work without me",
      "Just curious — exploring",
    ],
  },
  {
    id: "platforms",
    step: 4,
    label: "Where do you create content?",
    subtitle: "Select all that apply",
    type: "multi",
    options: ["LinkedIn", "X / Twitter", "Instagram", "YouTube", "Reddit", "Newsletter", "Podcast", "Blog"],
  },
  {
    id: "frequency",
    step: 5,
    label: "How often do you currently post?",
    subtitle: "Be honest — no judgment",
    type: "choice",
    options: [
      "Daily or more",
      "3–5 times per week",
      "Once or twice a week",
      "A few times a month",
      "Rarely — almost never",
    ],
  },
  {
    id: "challenge",
    step: 6,
    label: "What's your biggest challenge?",
    subtitle: "We'll make sure CozyJet solves this first",
    type: "choice",
    options: [
      "I don't know what to write about",
      "Content takes too long to create",
      "My writing doesn't sound like me",
      "I can't stay consistent",
      "I don't know what's working",
    ],
  },
];

/* ─── Particle canvas background ─── */
function ParticleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: { x: number; y: number; vy: number; size: number; alpha: number }[] = [];
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vy: -0.15 - Math.random() * 0.25,
        size: 0.8 + Math.random() * 1.4,
        alpha: 0.06 + Math.random() * 0.18,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y += p.vy;
        if (p.y < -4) p.y = canvas.height + 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ─── Grid texture overlay ─── */
function GridOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }}
    />
  );
}

/* ─── Liquid glass card ─── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 100%)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 8px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.06)",
        borderRadius: 28,
      }}
    >
      {/* Inner top shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
      />
      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)",
          borderRadius: "inherit",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ─── Progress bar ─── */
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-0.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: i < current ? "rgba(255,255,255,0.85)" : "transparent" }}
            initial={{ width: "0%" }}
            animate={{ width: i < current ? "100%" : "0%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { replitUser, isReplitLoading } = useReplitAuth();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [textVal, setTextVal] = useState("");
  const [multiSel, setMultiSel] = useState<string[]>([]);
  const [singleSel, setSingleSel] = useState("");
  const [completing, setCompleting] = useState(false);

  const isLoading = isUserLoading || isReplitLoading;
  const isAuthenticated = !!user || !!replitUser;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(ONBOARDING_KEY)) {
      router.replace("/dashboard/skippy");
    }
  }, [router]);

  const q = QUESTIONS[step];

  const canProceed = () => {
    if (q.type === "text") return textVal.trim().length > 0;
    if (q.type === "choice") return singleSel.length > 0;
    if (q.type === "multi") return multiSel.length > 0;
    return false;
  };

  const handleNext = () => {
    const value = q.type === "text" ? textVal.trim() : q.type === "multi" ? multiSel : singleSel;
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
      setTextVal("");
      setSingleSel("");
      setMultiSel([]);
    } else {
      setCompleting(true);
      try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch {}
      setTimeout(() => router.replace("/dashboard/skippy"), 1200);
    }
  };

  const toggleMulti = (opt: string) => {
    setMultiSel(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#000000" }}
    >
      <ParticleBg />
      <GridOverlay />

      {/* Subtle radial glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60vw",
          height: "40vh",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 w-full max-w-xl px-6">

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p
            className="font-pixel"
            style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "0.18em" }}
          >
            COZYJET AI STUDIO
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {completing ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5 text-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                <Check size={28} style={{ color: "rgba(255,255,255,0.9)" }} />
              </div>
              <p className="font-pixel" style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em" }}>
                SETTING UP YOUR STUDIO
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard className="p-8">
                <ProgressBar current={step + 1} total={QUESTIONS.length} />

                {/* Step label */}
                <p
                  className="font-pixel mb-3"
                  style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "0.18em" }}
                >
                  {step + 1} / {QUESTIONS.length}
                </p>

                {/* Question */}
                <h2
                  className="font-pixel-thin mb-2 leading-tight"
                  style={{ fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}
                >
                  {q.label}
                </h2>
                <p
                  className="font-pixel-thin mb-8"
                  style={{ fontSize: 15, color: "rgba(255,255,255,0.38)" }}
                >
                  {q.subtitle}
                </p>

                {/* Text input */}
                {q.type === "text" && (
                  <input
                    autoFocus
                    type="text"
                    value={textVal}
                    onChange={e => setTextVal(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && canProceed() && handleNext()}
                    placeholder={q.placeholder}
                    className="w-full px-5 py-4 rounded-2xl outline-none font-pixel-thin"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.88)",
                      fontSize: 16,
                      caretColor: "rgba(255,255,255,0.7)",
                    }}
                  />
                )}

                {/* Single choice */}
                {q.type === "choice" && (
                  <div className="flex flex-col gap-2.5">
                    {q.options!.map(opt => {
                      const sel = singleSel === opt;
                      return (
                        <motion.button
                          key={opt}
                          onClick={() => setSingleSel(opt)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full text-left px-5 py-3.5 rounded-2xl font-pixel-thin transition-all"
                          style={{
                            background: sel ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${sel ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.09)"}`,
                            color: sel ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.52)",
                            fontSize: 15,
                            boxShadow: sel ? "inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
                          }}
                        >
                          <span className="flex items-center justify-between">
                            {opt}
                            {sel && <Check size={14} style={{ color: "rgba(255,255,255,0.7)" }} />}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Multi choice */}
                {q.type === "multi" && (
                  <div className="flex flex-wrap gap-2.5">
                    {q.options!.map(opt => {
                      const sel = multiSel.includes(opt);
                      return (
                        <motion.button
                          key={opt}
                          onClick={() => toggleMulti(opt)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-4 py-2.5 rounded-xl font-pixel-thin transition-all"
                          style={{
                            background: sel ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${sel ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.09)"}`,
                            color: sel ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.50)",
                            fontSize: 14,
                          }}
                        >
                          {sel && <Check size={11} className="inline mr-1.5 mb-0.5" />}
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Next button */}
                <motion.button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  whileHover={canProceed() ? { scale: 1.02 } : {}}
                  whileTap={canProceed() ? { scale: 0.98 } : {}}
                  className="w-full mt-8 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-pixel-thin transition-all"
                  style={{
                    background: canProceed()
                      ? "rgba(255,255,255,0.90)"
                      : "rgba(255,255,255,0.08)",
                    color: canProceed() ? "#000000" : "rgba(255,255,255,0.25)",
                    fontSize: 15,
                    fontWeight: 600,
                    boxShadow: canProceed() ? "0 4px 32px rgba(255,255,255,0.18)" : "none",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {step === QUESTIONS.length - 1 ? "Launch Studio" : "Continue"}
                  <ArrowRight size={16} />
                </motion.button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
