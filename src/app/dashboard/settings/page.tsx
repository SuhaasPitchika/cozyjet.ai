"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Trash2, X, MessageSquare, ChevronRight } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { useReplitAuth } from "@/contexts/replit-auth-context";
import { signOut, deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";

/* ─── Animated dots — move upward, slightly bigger ─── */
function DotsBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const dotsRef = useRef<{ x: number; y: number; opacity: number; speed: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPACING = 28;
    let cols = 0, rows = 0;

    const buildGrid = () => {
      cols = Math.ceil(canvas.width / SPACING) + 1;
      rows = Math.ceil(canvas.height / SPACING) + 2;
      dotsRef.current = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dotsRef.current.push({
            x: c * SPACING,
            y: r * SPACING,
            opacity: 0.1 + Math.random() * 0.15,
            speed: 0.18 + Math.random() * 0.22,
          });
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

    const totalH = () => (Math.ceil(canvas.height / SPACING) + 2) * SPACING;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const th = totalH();
      for (const d of dotsRef.current) {
        d.y -= d.speed;
        if (d.y < -SPACING) d.y += th;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${d.opacity})`;
        ctx.fill();
      }
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
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

/* ─── Liquid glass options card ─── */
function LiquidGlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(245,250,255,0.82) 50%, rgba(255,255,255,0.85) 100%)",
        backdropFilter: "blur(48px) saturate(200%) brightness(105%)",
        WebkitBackdropFilter: "blur(48px) saturate(200%) brightness(105%)",
        border: "1.5px solid rgba(255,255,255,0.9)",
        borderRadius: 20,
        boxShadow: "0 8px 32px rgba(180,210,240,0.18), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(200,220,240,0.2)",
      }}
    >
      {/* Shimmer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(120deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%, rgba(200,230,255,0.15) 100%)",
          borderRadius: "inherit",
        }}
      />
      {/* Top edge highlight */}
      <div
        className="absolute top-0 left-4 right-4 pointer-events-none"
        style={{
          height: 1,
          background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))",
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/* ─── Confirm Delete Modal ─── */
function ConfirmDeleteModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 20 }}
        className="fixed z-50 p-6"
        style={{
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 380,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(40px) saturate(180%)",
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          border: "1.5px solid rgba(255,255,255,0.9)",
        }}
      >
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
            <Trash2 size={20} className="text-red-500" />
          </div>
          <h3 className="font-pixel text-black/80 mb-2" style={{ fontSize: 9 }}>DELETE ACCOUNT</h3>
          <p className="font-pixel-thin text-black/50 leading-relaxed" style={{ fontSize: 15 }}>
            This permanently deletes your CozyJet account, all saved data, content history, voice profiles, and your login credentials. This cannot be undone.
          </p>
        </div>
        <p className="font-pixel-thin text-black/40 mb-2 text-center" style={{ fontSize: 14 }}>Type <strong>DELETE</strong> to confirm</p>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="w-full px-4 py-3 rounded-xl font-pixel-thin text-black/70 outline-none mb-4 text-center"
          style={{ fontSize: 16, background: "#f8f9fa", border: "1.5px solid rgba(0,0,0,0.09)" }}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-pixel-thin text-black/50" style={{ fontSize: 16, background: "rgba(0,0,0,0.04)" }}>
            Cancel
          </button>
          <motion.button
            onClick={onConfirm}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            disabled={confirmText !== "DELETE"}
            className="flex-1 py-3 rounded-xl font-pixel-thin text-white"
            style={{
              fontSize: 16,
              background: confirmText === "DELETE" ? "#ef4444" : "rgba(239,68,68,0.3)",
              transition: "background 0.2s",
            }}
          >
            Delete Account
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Feedback Modal ─── */
function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 1800);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)" }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 20 }}
        className="fixed z-50 overflow-hidden"
        style={{
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 420,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(40px) saturate(180%)",
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1.5px solid rgba(255,255,255,0.9)",
        }}
      >
        <div className="px-6 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <MessageSquare size={16} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="font-pixel text-black/80" style={{ fontSize: 9 }}>SEND FEEDBACK</h2>
              <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 13 }}>Help us improve CozyJet</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
            <X size={14} className="text-black/40" />
          </button>
        </div>
        <div className="px-6 py-5">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
            placeholder="Share your thoughts, report a bug, or suggest a feature..."
            className="w-full px-4 py-3 rounded-xl font-pixel-thin text-black/70 outline-none resize-none"
            style={{ fontSize: 15, background: "#f8f9fa", border: "1.5px solid rgba(0,0,0,0.09)" }}
          />
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <motion.button
            onClick={handleSend}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-xl font-pixel-thin text-white"
            style={{ fontSize: 16, fontWeight: 600, background: sent ? "#22c55e" : "#6366f1", transition: "background 0.2s" }}
          >
            {sent ? "✓ Sent!" : "Send Feedback"}
          </motion.button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl font-pixel-thin text-black/50" style={{ fontSize: 16, background: "rgba(0,0,0,0.04)" }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { replitUser } = useReplitAuth();
  const { signOutReplit } = useReplitAuth();
  const router = useRouter();

  const displayName = user?.displayName || user?.email?.split("@")[0] || replitUser?.name || "User";
  const email = user?.email || replitUser?.name || "—";
  const initials = displayName.slice(0, 2).toUpperCase();

  const [showDelete, setShowDelete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleLogout = async () => {
    try {
      if (user) await signOut(auth);
      if (replitUser) signOutReplit();
      router.push("/auth");
    } catch (e) { console.error(e); }
  };

  const handleDeleteAccount = async () => {
    try {
      if (user) await deleteUser(user);
      if (replitUser) signOutReplit();
      router.push("/");
    } catch (e) { console.error(e); }
    setShowDelete(false);
  };

  return (
    <div className="h-full overflow-y-auto relative" style={{ background: "#f5f6f8" }}>
      <DotsBg />

      <div className="relative z-10 flex flex-col items-center px-6 py-10 min-h-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-pixel text-black/75" style={{ fontSize: 13, letterSpacing: "0.15em" }}>SETTINGS</h1>
          <p className="font-pixel-thin text-black/35 mt-1" style={{ fontSize: 15 }}>Account & preferences</p>
        </div>

        <div className="w-full max-w-md flex flex-col gap-4">

          {/* Account card — liquid glass */}
          <LiquidGlassCard>
            <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(200,220,240,0.3)" }}>
              <span className="font-pixel text-black/40" style={{ fontSize: 8, letterSpacing: "0.15em" }}>ACCOUNT</span>
            </div>

            {/* Avatar + name row */}
            <div className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: "1px solid rgba(200,220,240,0.2)" }}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6ee7f7, #b8a4ff)", boxShadow: "0 4px 16px rgba(110,231,247,0.3)" }}
              >
                <span className="font-pixel text-white" style={{ fontSize: 12 }}>{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-pixel-thin text-black/80 truncate" style={{ fontSize: 18, fontWeight: 700 }}>{displayName}</p>
                <p className="font-pixel-thin text-black/40 truncate" style={{ fontSize: 14 }}>{email}</p>
              </div>
              <span
                className="font-pixel-thin px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ fontSize: 13, background: "rgba(110,231,247,0.12)", color: "#0ea5e9", border: "1px solid rgba(110,231,247,0.25)" }}
              >
                Pro
              </span>
            </div>

            {/* Logout row */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ background: "rgba(0,0,0,0.015)" }}
              className="w-full px-5 py-4 flex items-center gap-3 transition-colors"
              style={{ borderBottom: "1px solid rgba(200,220,240,0.2)" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <LogOut size={15} className="text-black/40" />
              </div>
              <div className="text-left flex-1">
                <p className="font-pixel-thin text-black/75" style={{ fontSize: 16, fontWeight: 600 }}>Log Out</p>
                <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 13 }}>Sign out of your CozyJet account</p>
              </div>
              <ChevronRight size={14} className="text-black/25" />
            </motion.button>

            {/* Delete account row */}
            <motion.button
              onClick={() => setShowDelete(true)}
              whileHover={{ background: "rgba(239,68,68,0.025)" }}
              className="w-full px-5 py-4 flex items-center gap-3 transition-colors"
              style={{ borderBottom: "1px solid rgba(200,220,240,0.2)" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.12)" }}>
                <Trash2 size={15} className="text-red-400" />
              </div>
              <div className="text-left flex-1">
                <p className="font-pixel-thin text-red-400" style={{ fontSize: 16, fontWeight: 600 }}>Delete Account</p>
                <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 13 }}>Permanently removes all data and credentials</p>
              </div>
              <ChevronRight size={14} className="text-red-300" />
            </motion.button>

            {/* Feedback row */}
            <motion.button
              onClick={() => setShowFeedback(true)}
              whileHover={{ background: "rgba(0,0,0,0.015)" }}
              className="w-full px-5 py-4 flex items-center gap-3 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                <MessageSquare size={15} className="text-indigo-400" />
              </div>
              <div className="text-left flex-1">
                <p className="font-pixel-thin text-black/75" style={{ fontSize: 16, fontWeight: 600 }}>Send Feedback</p>
                <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 13 }}>Suggestions, bugs, or ideas for CozyJet</p>
              </div>
              <ChevronRight size={14} className="text-black/25" />
            </motion.button>
          </LiquidGlassCard>

          {/* Footer */}
          <div className="text-center pt-2 pb-4">
            <p className="font-pixel-thin text-black/25" style={{ fontSize: 13 }}>CozyJet v1.0 · Built for makers</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDelete && <ConfirmDeleteModal onClose={() => setShowDelete(false)} onConfirm={handleDeleteAccount} />}
      </AnimatePresence>
      <AnimatePresence>
        {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      </AnimatePresence>
    </div>
  );
}
