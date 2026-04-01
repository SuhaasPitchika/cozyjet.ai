"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, ChevronLeft, ChevronRight, Pencil } from "lucide-react";

/* ─── App integrations ─── */
const INTEGRATIONS = [
  {
    id: "github", name: "GitHub",
    logo: <svg viewBox="0 0 24 24" fill="#171717" className="w-full h-full"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>,
  },
  {
    id: "notion", name: "Notion",
    logo: <svg viewBox="0 0 24 24" fill="#000" className="w-full h-full"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z"/></svg>,
  },
  {
    id: "figma", name: "Figma",
    logo: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83"/><path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF"/><path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E"/><path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262"/><path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE"/></svg>,
  },
  {
    id: "gdrive", name: "Google Drive",
    logo: <svg viewBox="0 0 87.3 78" className="w-full h-full"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H1.1c0 1.55.4 3.1 1.2 4.5zm40.1-23.8H27.5l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h38.6l-10.2-25zm-13.75 0L46.7 19.3 33.0 43.05zm0 0" fill="#0066DA"/><path d="M46.7 19.3L33.0 43.05h27.4l13.75-23.75zm27.4 23.75H60.4l-13.7 23.8h13.7zm0 0" fill="#00AC47"/><path d="M46.7 19.3l-13.7 23.75L46.7 19.3zm27.4 0H46.7l13.7 23.75zm0 0" fill="#EA4335"/><path d="M32.95 43.05h27.4L46.7 19.3zm0 0" fill="#FFBA00"/><path d="M1.1 66.85C.4 68.25 0 69.8 0 71.35c0 4.55 3.7 8.25 8.25 8.25 1.55 0 3.1-.4 4.5-1.2l3.85-6.65L1.1 66.85zm0 0" fill="#00832D"/><path d="M73.75 19.3H46.7l13.7 23.75 13.7-23.75zm0 0" fill="#2684FC"/><path d="M86.2 66.85l-25.8-44.8-13.7 23.75 13.7 21.05 10.2-25c0 0 0 0 0 0 0-1.55.4-3.1 1.2-4.5l3.85 6.65 1.2 4.5h-5.4L86.2 66.85c.8-1.4 1.2-2.95 1.2-4.5 0-1.55-.4-3.1-1.2-4.5zm0 0" fill="#4285F4"/></svg>,
  },
  {
    id: "gcal", name: "Google Calendar",
    logo: <svg viewBox="0 0 48 48" className="w-full h-full"><rect x="6" y="6" width="36" height="36" rx="4" fill="#fff"/><path d="M6 18h36v-8a4 4 0 00-4-4H10a4 4 0 00-4 4v8z" fill="#1a73e8"/><path d="M6 18h36v4H6z" fill="#1a73e8"/><text x="24" y="36" textAnchor="middle" fill="#1a73e8" fontSize="14" fontWeight="bold">31</text><rect x="16" y="6" width="4" height="6" rx="2" fill="#1a73e8"/><rect x="28" y="6" width="4" height="6" rx="2" fill="#1a73e8"/></svg>,
  },
  {
    id: "linear", name: "Linear",
    logo: <svg viewBox="0 0 100 100" fill="none" className="w-full h-full"><defs><linearGradient id="lin-g" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#5E6AD2"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#lin-g)"/><path d="M17 64.5L35.5 83c16.5-3 30-13 37-27L17 64.5zm-2.8-4.5L56 18.8C44.5 15.5 32 18 22.5 26L14.2 60zm50.6 21.5C78 74 85 62.5 85 50c0-4-.7-7.8-2-11.2L45 78.8c2.6.8 5.3 1.2 8.1 1.3l11.7 1.7zm7.5-58C68 15 59.5 13 50.8 14L19 45.5c-1.3 4-1.5 8.3-.5 12.5L72.3 23z" fill="#fff"/></svg>,
  },
  {
    id: "slack", name: "Slack",
    logo: <svg viewBox="0 0 54 54" className="w-full h-full"><path d="M19.712.133a5.381 5.381 0 00-5.376 5.387 5.381 5.381 0 005.376 5.386h5.376V5.52A5.381 5.381 0 0019.712.133m0 14.365H5.376A5.381 5.381 0 000 19.884a5.381 5.381 0 005.376 5.386h14.336a5.381 5.381 0 005.376-5.386 5.381 5.381 0 00-5.376-5.386" fill="#36C5F0"/><path d="M53.76 19.884a5.381 5.381 0 00-5.376-5.386 5.381 5.381 0 00-5.376 5.386v5.386h5.376a5.381 5.381 0 005.376-5.386m-14.336 0V5.52A5.381 5.381 0 0034.048.133a5.381 5.381 0 00-5.376 5.387v14.364a5.381 5.381 0 005.376 5.386 5.381 5.381 0 005.376-5.386" fill="#2EB67D"/><path d="M34.048 54a5.381 5.381 0 005.376-5.387 5.381 5.381 0 00-5.376-5.386h-5.376v5.386A5.381 5.381 0 0034.048 54m0-14.365h14.336a5.381 5.381 0 005.376-5.386 5.381 5.381 0 00-5.376-5.386H34.048a5.381 5.381 0 00-5.376 5.386 5.381 5.381 0 005.376 5.386" fill="#ECB22E"/><path d="M0 34.249a5.381 5.381 0 005.376 5.386 5.381 5.381 0 005.376-5.386v-5.386H5.376A5.381 5.381 0 000 34.249m14.336 0v14.364A5.381 5.381 0 0019.712 54a5.381 5.381 0 005.376-5.387V34.249a5.381 5.381 0 00-5.376-5.386 5.381 5.381 0 00-5.376 5.386" fill="#E01E5A"/></svg>,
  },
  {
    id: "vscode", name: "VS Code",
    logo: <svg viewBox="0 0 100 100" fill="none" className="w-full h-full"><defs><linearGradient id="vsc-g" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#0078d4"/><stop offset="1" stopColor="#28c7f7"/></linearGradient></defs><rect width="100" height="100" rx="16" fill="url(#vsc-g)"/><path d="M72.4 16.5L54.2 34.8 38.7 21.4 29 26.3l21.9 23.7L29 73.7l9.7 4.9 15.5-13.4 18.2 18.3 9.6-4.6V21.1l-9.6-4.6zM72 65.4L55.9 50 72 34.6v30.8z" fill="white"/></svg>,
  },
];

const SEED_DATA = [
  {
    id: "s1", source: "github",
    date: "Today · 11:42 PM",
    title: "JWT auth with refresh tokens shipped",
    lines: [
      "You just shipped JWT auth with refresh token support. This is exactly what junior devs struggle with — and senior devs love seeing documented properly.",
      "The commit touched 14 files across the auth layer. Your LinkedIn audience would bookmark a post about this.",
      "This is prime content — technical but relatable, with real implementation depth that demonstrates expertise.",
    ],
  },
  {
    id: "s2", source: "notion",
    date: "Yesterday · 3:15 PM",
    title: "Q2 roadmap updated — 8 features prioritised",
    lines: [
      "You finalised your Q2 product roadmap today. 8 features prioritised by real user feedback, not guesswork.",
      "Behind-the-scenes trade-off posts do incredibly well with founders. Show how you decided what to cut — that's the real story.",
      "Snooks already flagged Thursday morning as optimal posting time for this type of strategic content.",
    ],
  },
  {
    id: "s3", source: "figma",
    date: "Jun 28 · 10:05 AM",
    title: "Glassmorphism dashboard component designed",
    lines: [
      "You finalized a new glassmorphic dashboard layout today. The design decisions — contrast, blur depth, colour hierarchy — are exactly what gets shared in design communities.",
      "Process documentation posts outperform final-reveal posts 3:1. A Figma walkthrough thread on Twitter would kill it.",
      "Instagram carousel for the before/after comparison would be a natural second piece of content from this seed.",
    ],
  },
  {
    id: "s4", source: "gcal",
    date: "Jun 27 · 2:00 PM",
    title: "Demo call with 3 enterprise leads",
    lines: [
      "You ran a 45-minute live demo with three enterprise decision-makers. The objections they raised are a goldmine for content.",
      "Most founders never think to turn sales calls into marketing material. A post about what enterprise buyers actually ask about AI tools would perform well.",
      "This could be your most-engaged post this month — the specificity and insider perspective is exactly what builds authority.",
    ],
  },
  {
    id: "s5", source: "vscode",
    date: "Jun 26 · 8:30 PM",
    title: "Refactored entire data pipeline — 60% faster",
    lines: [
      "You spent 4 hours refactoring your data pipeline and cut latency by 60%. Technical builders on LinkedIn love speed improvement breakdowns.",
      "Before/after benchmarks with a one-line explanation of what changed — this is the kind of post that engineers screenshot and save.",
      "Short Twitter thread: the problem, the fix, the number. Done. Simple format, maximum impact.",
    ],
  },
];

/* ─── Cursor-following dot background ─── */
function CursorDotsBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPACING = 26;
    let cols = 0, rows = 0;
    const dots: { x: number; y: number }[] = [];

    const buildGrid = () => {
      cols = Math.ceil(canvas.width / SPACING) + 1;
      rows = Math.ceil(canvas.height / SPACING) + 1;
      dots.length = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: c * SPACING, y: r * SPACING });
        }
      }
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      buildGrid();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const RADIUS = 130;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      for (const d of dots) {
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RADIUS) {
          const alpha = (1 - dist / RADIUS) * 0.55;
          ctx.beginPath();
          ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(160,160,160,${alpha})`;
          ctx.fill();
        }
      }
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
    canvas.parentElement?.addEventListener("mousemove", onMove);
    canvas.parentElement?.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      canvas.parentElement?.removeEventListener("mousemove", onMove);
      canvas.parentElement?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* ─── All-apps integration strip (always visible, connected = highlighted) ─── */
function AllIntegrationCircles({ connectedIds }: { connectedIds: string[] }) {
  const SIZE = 38;
  const OVERLAP = 10;
  const total = INTEGRATIONS.length;
  const totalWidth = SIZE + (total - 1) * (SIZE - OVERLAP);

  return (
    <div className="relative flex items-center" style={{ width: totalWidth, height: SIZE + 6 }}>
      {INTEGRATIONS.map((intg, idx) => {
        const isConn = connectedIds.includes(intg.id);
        return (
          <motion.div
            key={intg.id}
            whileHover={{ zIndex: 50, y: -5, scale: 1.15 }}
            title={intg.name}
            style={{
              position: "absolute",
              left: idx * (SIZE - OVERLAP),
              top: 3,
              width: SIZE,
              height: SIZE,
              borderRadius: "50%",
              background: isConn ? "#fff" : "rgba(255,255,255,0.55)",
              border: isConn
                ? "2.5px solid rgba(34,197,94,0.7)"
                : "2px solid rgba(255,255,255,0.7)",
              zIndex: total - idx,
              overflow: "hidden",
              padding: 7,
              cursor: "pointer",
              boxSizing: "border-box",
              boxShadow: isConn
                ? "0 4px 14px rgba(0,0,0,0.18), 0 0 0 2px rgba(34,197,94,0.25), inset 0 1px 0 rgba(255,255,255,0.9)"
                : "0 3px 10px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)",
              filter: isConn ? "none" : "grayscale(55%) opacity(0.6)",
              transition: "filter 0.2s, box-shadow 0.2s",
            }}
            className="flex items-center justify-center"
          >
            <div className="w-full h-full flex items-center justify-center">
              {intg.logo}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── 3D Sticky note with bottom-lift paper effect ─── */
function StickyNote({
  seed,
  onEdit,
}: {
  seed: typeof SEED_DATA[0];
  onEdit: (seed: typeof SEED_DATA[0]) => void;
}) {
  const intg = INTEGRATIONS.find(i => i.id === seed.source);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Shadow that blooms below the note from the 3D bend */}
      <div
        style={{
          position: "absolute",
          bottom: -18,
          left: "8%",
          right: "8%",
          height: 36,
          background: "rgba(160,120,0,0.22)",
          filter: "blur(18px)",
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Perspective wrapper for 3D effect */}
      <div
        style={{
          perspective: "900px",
          perspectiveOrigin: "50% 100%",
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Main note body */}
        <div
          className="w-full h-full flex flex-col relative select-none"
          style={{
            background: "linear-gradient(160deg, #fff9c4 0%, #fff176 55%, #ffee58 100%)",
            borderRadius: "3px 3px 0px 3px",
            boxShadow: `
              0 1px 2px rgba(0,0,0,0.10),
              0 6px 18px rgba(200,160,0,0.20),
              8px 10px 28px rgba(180,140,0,0.14),
              0 0 0 1px rgba(220,180,0,0.2)
            `,
            padding: "22px 22px 20px",
            overflow: "hidden",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Ruled lines */}
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: 70 + i * 32, height: 1, background: "rgba(100,80,0,0.07)" }}
            />
          ))}

          {/* Red margin line */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ left: 52, width: 1, background: "rgba(220,60,60,0.16)" }}
          />

          {/* Pin */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #ff7070, #c0392b)",
              boxShadow: "0 2px 7px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.4)",
              border: "1.5px solid rgba(0,0,0,0.15)",
            }}
          />

          {/* Edit button — larger, more prominent */}
          <button
            onClick={() => onEdit(seed)}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-xl transition-all hover:bg-black/10"
            style={{
              background: "rgba(0,0,0,0.07)",
              border: "1px solid rgba(0,0,0,0.12)",
              padding: "8px 14px",
            }}
            title="Edit note"
          >
            <Pencil size={13} style={{ color: "rgba(0,0,0,0.5)" }} />
            <span className="font-pixel-thin" style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>Edit</span>
          </button>

          {/* Header: bigger source icon + name + date */}
          <div className="flex items-center gap-3 mb-4 mt-3">
            {intg && (
              <div
                style={{
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.85)",
                  padding: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(255,255,255,0.9)",
                  border: "1px solid rgba(255,255,255,0.95)",
                }}
              >
                {intg.logo}
              </div>
            )}
            <div className="flex flex-col">
              <span
                className="font-pixel-thin text-black/75"
                style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}
              >
                {intg?.name}
              </span>
              <span
                className="font-pixel-thin text-black/40"
                style={{ fontSize: 12, lineHeight: 1.3 }}
              >
                {seed.date}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3
            className="font-pixel-thin text-black/85 mb-4 leading-snug"
            style={{ fontSize: 19, fontWeight: 700 }}
          >
            {seed.title}
          </h3>

          {/* Content as paragraphs — 18px, not bullet lines */}
          <div className="flex-1 flex flex-col gap-3 overflow-hidden">
            {seed.lines.map((line, i) => (
              <p
                key={i}
                className="font-pixel-thin text-black/70 leading-relaxed"
                style={{ fontSize: 18, lineHeight: 1.65 }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* 3D bottom fold — lifts upward */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            transformOrigin: "top center",
            transform: "rotateX(-22deg)",
            background: "linear-gradient(to bottom, #ffe929 0%, #f5c800 60%, #e0b300 100%)",
            borderRadius: "0 0 3px 3px",
            boxShadow: "0 18px 36px rgba(150,100,0,0.30), 0 6px 12px rgba(0,0,0,0.12)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        {/* Fold highlight shimmer */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            transformOrigin: "top center",
            transform: "rotateX(-22deg)",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 60%)",
            borderRadius: "0 0 3px 3px",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Edit modal for notes ─── */
function EditNoteModal({
  seed,
  onClose,
  onSave,
}: {
  seed: typeof SEED_DATA[0];
  onClose: () => void;
  onSave: (updated: typeof SEED_DATA[0]) => void;
}) {
  const [title, setTitle] = useState(seed.title);
  const [lines, setLines] = useState<string[]>([...seed.lines]);

  const updateLine = (idx: number, val: string) => {
    const next = [...lines];
    next[idx] = val;
    setLines(next);
  };

  const handleSave = () => {
    onSave({ ...seed, title, lines });
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -30 }}
        className="fixed z-50 overflow-hidden"
        style={{
          top: 48, left: "50%", transform: "translateX(-50%)",
          width: 520, maxHeight: "82vh",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(48px) saturate(180%)",
          WebkitBackdropFilter: "blur(48px) saturate(180%)",
          border: "1.5px solid rgba(255,255,255,0.9)",
          borderRadius: 22,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,1)",
        }}
      >
        <div className="px-6 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h3 className="font-pixel text-black/80" style={{ fontSize: 9 }}>EDIT NOTE</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.05)" }}>
            <X size={13} className="text-black/40" />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex flex-col gap-4" style={{ maxHeight: "calc(82vh - 130px)" }}>
          <div>
            <p className="font-pixel-thin text-black/50 mb-2" style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Title</p>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl font-pixel-thin text-black/80 outline-none"
              style={{ fontSize: 18, background: "#f8f8f8", border: "1.5px solid rgba(0,0,0,0.09)" }}
            />
          </div>
          {lines.map((line, i) => (
            <div key={i}>
              <p className="font-pixel-thin text-black/40 mb-1.5" style={{ fontSize: 12, textTransform: "uppercase" }}>Paragraph {i + 1}</p>
              <textarea
                value={line}
                onChange={e => updateLine(i, e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl font-pixel-thin text-black/70 outline-none resize-none"
                style={{ fontSize: 18, lineHeight: 1.6, background: "#f8f8f8", border: "1.5px solid rgba(0,0,0,0.09)" }}
              />
            </div>
          ))}
        </div>
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-xl font-pixel-thin text-white"
            style={{ fontSize: 16, fontWeight: 600, background: "#1a1a2e" }}
          >
            Save Changes
          </motion.button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl font-pixel-thin text-black/50" style={{ fontSize: 16, background: "rgba(0,0,0,0.04)" }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default function SkippyPage() {
  const [connected, setConnected] = useState<string[]>(["github", "notion", "gdrive", "gcal"]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [swipeDir, setSwipeDir] = useState(1);
  const [seedData, setSeedData] = useState(SEED_DATA);
  const [editingSeed, setEditingSeed] = useState<typeof SEED_DATA[0] | null>(null);
  const dragStartX = useRef(0);

  const goTo = useCallback((idx: number, dir: number) => {
    const clamped = Math.max(0, Math.min(seedData.length - 1, idx));
    if (clamped === currentSlide) return;
    setSwipeDir(dir);
    setCurrentSlide(clamped);
  }, [seedData.length, currentSlide]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 30) {
      if (dx < 0) goTo(currentSlide + 1, 1);   // swipe left → next → exits left, enters right
      else goTo(currentSlide - 1, -1);           // swipe right → prev → exits right, enters left
    }
  };

  const handleSaveEdit = (updated: typeof SEED_DATA[0]) => {
    setSeedData(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  return (
    <div className="h-full flex overflow-hidden relative" style={{ background: "#ffffff" }}>
      <CursorDotsBg />

      {/* ─── LEFT 1/4 ─── */}
      <div
        className="flex flex-col overflow-y-auto flex-shrink-0 relative z-10"
        style={{ width: "26%", minWidth: 240, borderRight: "1px solid rgba(0,0,0,0.07)" }}
      >
        <div className="px-5 pt-6 pb-2">
          <h1 className="font-pixel text-black/80" style={{ fontSize: 12 }}>SKIPPY</h1>
          <p className="font-pixel-thin text-black/40 mt-1" style={{ fontSize: 15 }}>
            Your silent workspace observer
          </p>
        </div>

        {/* Integration pill bar — always shows ALL apps */}
        <div className="px-4 py-3">
          <div
            className="flex items-center gap-3 px-4 py-3 relative"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1.5px solid rgba(255,255,255,0.8)",
              borderRadius: 999,
              boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)",
            }}
          >
            <div style={{ flex: 1, overflow: "hidden" }}>
              <AllIntegrationCircles connectedIds={connected} />
            </div>
            <motion.button
              onClick={() => setShowPopup(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1.5px solid rgba(0,0,0,0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Plus size={16} className="text-black/50" />
            </motion.button>
          </div>

          {/* Active apps row below the bar */}
          <div className="flex flex-wrap gap-1.5 mt-2 px-1">
            {connected.map(id => {
              const intg = INTEGRATIONS.find(i => i.id === id);
              if (!intg) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    fontSize: 11,
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#22c55e" }}
                  />
                  <span className="font-pixel-thin text-black/60" style={{ fontSize: 10 }}>{intg.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connected list */}
        <div className="px-4 flex-1">
          <p className="font-pixel-thin text-black/30 mb-2" style={{ fontSize: 12, letterSpacing: "0.15em" }}>
            CONNECTED APPS
          </p>
          <div className="flex flex-col gap-1.5">
            {connected.map(id => {
              const intg = INTEGRATIONS.find(i => i.id === id);
              if (!intg) return null;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: "#fff",
                      padding: 5,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                      border: "1px solid rgba(0,0,0,0.07)",
                    }}
                  >
                    {intg.logo}
                  </div>
                  <span className="font-pixel-thin text-black/65 flex-1" style={{ fontSize: 14 }}>{intg.name}</span>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#22c55e" }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── RIGHT 3/4 ─── */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div
          className="px-7 pt-6 pb-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div>
            <h2 className="font-pixel text-black/70" style={{ fontSize: 10 }}>CONTENT SEEDS</h2>
            <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 14 }}>
              Drag left or right to browse · {seedData.length} seeds ready
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => goTo(currentSlide - 1, -1)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              disabled={currentSlide === 0}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.9)", opacity: currentSlide === 0 ? 0.3 : 1 }}
            >
              <ChevronLeft size={14} className="text-black/50" />
            </motion.button>
            <span className="font-pixel-thin text-black/40" style={{ fontSize: 14 }}>{currentSlide + 1} / {seedData.length}</span>
            <motion.button
              onClick={() => goTo(currentSlide + 1, 1)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              disabled={currentSlide === seedData.length - 1}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.9)", opacity: currentSlide === seedData.length - 1 ? 0.3 : 1 }}
            >
              <ChevronRight size={14} className="text-black/50" />
            </motion.button>
          </div>
        </div>

        {/* Note card carousel */}
        <div
          className="flex-1 flex items-center justify-center px-8 py-6 relative overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {/* Prev peek */}
          {currentSlide > 0 && (
            <div
              className="absolute left-2 top-1/2 opacity-20"
              style={{ width: 40, height: "60%", background: "#fff9c4", borderRadius: 4, transform: "translateY(-50%) rotate(-3deg)" }}
            />
          )}
          {/* Next peek */}
          {currentSlide < seedData.length - 1 && (
            <div
              className="absolute right-2 top-1/2 opacity-20"
              style={{ width: 40, height: "60%", background: "#fff9c4", borderRadius: 4, transform: "translateY(-50%) rotate(3deg)" }}
            />
          )}

          <AnimatePresence mode="wait" custom={swipeDir}>
            <motion.div
              key={currentSlide}
              custom={swipeDir}
              initial={{ opacity: 0, x: swipeDir * 90, rotate: swipeDir * 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: swipeDir * -90, rotate: swipeDir * -2 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="relative"
              style={{ width: "min(480px, 90%)", height: "min(520px, 90vh)", cursor: "grab" }}
            >
              <StickyNote
                seed={seedData[currentSlide]}
                onEdit={setEditingSeed}
              />
            </motion.div>
          </AnimatePresence>

          {/* Dot nav */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {seedData.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => goTo(i, i > currentSlide ? 1 : -1)}
                animate={{ scale: i === currentSlide ? 1.2 : 0.8, opacity: i === currentSlide ? 1 : 0.35 }}
                className="w-2 h-2 rounded-full"
                style={{ background: "rgba(0,0,0,0.6)" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Integration popup ─── */}
      <AnimatePresence>
        {showPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -20 }}
              className="fixed z-50 overflow-hidden"
              style={{
                top: 40,
                left: "50%",
                transform: "translateX(-50%)",
                width: 480,
                maxHeight: "80vh",
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(60px) saturate(200%)",
                WebkitBackdropFilter: "blur(60px) saturate(200%)",
                border: "1.5px solid rgba(255,255,255,0.95)",
                borderRadius: 24,
                boxShadow: "0 32px 80px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)",
              }}
            >
              <div className="px-6 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <div>
                  <h3 className="font-pixel text-black/80" style={{ fontSize: 9 }}>CONNECT APPS</h3>
                  <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 13 }}>Choose tools for Skippy to watch</p>
                </div>
                <button onClick={() => setShowPopup(false)} className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.05)" }}>
                  <X size={13} className="text-black/40" />
                </button>
              </div>

              <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "calc(80vh - 80px)" }}>
                <div className="grid grid-cols-2 gap-3">
                  {INTEGRATIONS.map(intg => {
                    const isConn = connected.includes(intg.id);
                    return (
                      <motion.button
                        key={intg.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setConnected(prev => isConn ? prev.filter(id => id !== intg.id) : [...prev, intg.id])}
                        className="relative flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                        style={{
                          background: isConn ? "rgba(34,197,94,0.06)" : "rgba(248,248,248,0.8)",
                          border: isConn ? "2px solid rgba(34,197,94,0.4)" : "1.5px solid rgba(0,0,0,0.07)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                      >
                        {isConn && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            background: "#fff",
                            flexShrink: 0,
                            padding: 8,
                            boxShadow: "0 2px 10px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
                            border: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          {intg.logo}
                        </div>
                        <div>
                          <p className="font-pixel-thin text-black/80" style={{ fontSize: 15, fontWeight: 600 }}>{intg.name}</p>
                          <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 12 }}>
                            {isConn ? "Connected · Active" : "Click to connect"}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit note modal */}
      <AnimatePresence>
        {editingSeed && (
          <EditNoteModal
            seed={editingSeed}
            onClose={() => setEditingSeed(null)}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
