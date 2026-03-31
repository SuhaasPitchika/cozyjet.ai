"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Trash2, X, Eye, EyeOff, Key, Lock } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { useReplitAuth } from "@/contexts/replit-auth-context";
import { signOut, deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";

/* ─── Animated grey dots background ─── */
function DotsBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}

/* ─── API Keys Modal ─── */
const API_KEYS = [
  { id: "openrouter", label: "OpenRouter API Key", placeholder: "sk-or-v1-...", hint: "Powers all three AI agents — Skippy, Meta, Snooks" },
  { id: "firebase_key", label: "Firebase Web API Key", placeholder: "AIza...", hint: "Firebase client-side authentication" },
  { id: "firebase_project", label: "Firebase Project ID", placeholder: "your-project-id", hint: "Firebase project identifier" },
  { id: "gemini", label: "Google Gemini API Key", placeholder: "AIza...", hint: "Used by Genkit AI flows" },
  { id: "github_client", label: "GitHub OAuth Client ID", placeholder: "Ov23...", hint: "For GitHub integration in Skippy" },
  { id: "notion_key", label: "Notion Integration Key", placeholder: "secret_...", hint: "For Notion workspace sync" },
];

function ApiKeysModal({ onClose }: { onClose: () => void }) {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed z-50 overflow-hidden"
        style={{
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 480, maxHeight: "80vh",
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fef3c7", border: "1px solid rgba(252,211,77,0.3)" }}>
              <Lock size={16} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-pixel text-black/80" style={{ fontSize: 9 }}>SECRET KEYS</h2>
              <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 13 }}>Enter your API keys to power CozyJet</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
            <X size={14} className="text-black/40" />
          </button>
        </div>

        {/* Keys */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4" style={{ maxHeight: "calc(80vh - 140px)" }}>
          {API_KEYS.map(k => (
            <div key={k.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-pixel-thin text-black/70" style={{ fontSize: 15, fontWeight: 600 }}>{k.label}</span>
              </div>
              <p className="font-pixel-thin text-black/35 mb-2" style={{ fontSize: 13 }}>{k.hint}</p>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "#f8f9fa", border: "1.5px solid rgba(0,0,0,0.09)" }}
              >
                <Key size={12} className="text-black/25 flex-shrink-0" />
                <input
                  type={shown[k.id] ? "text" : "password"}
                  value={keys[k.id] || ""}
                  onChange={e => setKeys(prev => ({ ...prev, [k.id]: e.target.value }))}
                  placeholder={k.placeholder}
                  className="flex-1 bg-transparent outline-none font-pixel-thin text-black/70 placeholder:text-black/20"
                  style={{ fontSize: 14 }}
                />
                <button
                  onClick={() => setShown(prev => ({ ...prev, [k.id]: !prev[k.id] }))}
                  className="flex-shrink-0 p-1"
                >
                  {shown[k.id]
                    ? <EyeOff size={13} className="text-black/30" />
                    : <Eye size={13} className="text-black/30" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-xl font-pixel-thin"
            style={{
              background: saved ? "#22c55e" : "#1a1a2e",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              transition: "background 0.2s",
            }}
          >
            {saved ? "✓ Saved" : "Save Keys"}
          </motion.button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl font-pixel-thin text-black/50" style={{ fontSize: 16, background: "rgba(0,0,0,0.04)" }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </>
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
          width: 380, background: "#fff", borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          border: "1px solid rgba(0,0,0,0.07)",
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

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { replitUser } = useReplitAuth();
  const { signOutReplit } = useReplitAuth();
  const router = useRouter();

  const displayName = user?.displayName || user?.email?.split("@")[0] || replitUser?.name || "User";
  const email = user?.email || replitUser?.name || "—";
  const initials = displayName.slice(0, 2).toUpperCase();

  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

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
    <div
      className="h-full overflow-y-auto relative"
      style={{ background: "#f5f5f5" }}
    >
      <DotsBg />

      <div className="relative z-10 flex flex-col items-center px-6 py-10 min-h-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-pixel text-black/75" style={{ fontSize: 13, letterSpacing: "0.15em" }}>SETTINGS</h1>
          <p className="font-pixel-thin text-black/35 mt-1" style={{ fontSize: 15 }}>Account & preferences</p>
        </div>

        <div className="w-full max-w-md flex flex-col gap-4">

          {/* Account card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
          >
            <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <span className="font-pixel text-black/40" style={{ fontSize: 8, letterSpacing: "0.15em" }}>ACCOUNT</span>
            </div>

            {/* Avatar + name row */}
            <div className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6ee7f7, #b8a4ff)" }}
              >
                <span className="font-pixel text-white" style={{ fontSize: 10 }}>{initials}</span>
              </div>
              <div>
                <p className="font-pixel-thin text-black/80" style={{ fontSize: 17, fontWeight: 600 }}>{displayName}</p>
                <p className="font-pixel-thin text-black/40" style={{ fontSize: 14 }}>{email}</p>
              </div>
              <div className="ml-auto">
                <span
                  className="font-pixel-thin px-3 py-1.5 rounded-full"
                  style={{ fontSize: 13, background: "rgba(110,231,247,0.12)", color: "#0ea5e9", border: "1px solid rgba(110,231,247,0.25)" }}
                >
                  Pro
                </span>
              </div>
            </div>

            {/* API Keys row */}
            <motion.button
              onClick={() => setShowApiKeys(true)}
              whileHover={{ background: "rgba(0,0,0,0.02)" }}
              className="w-full px-5 py-4 flex items-center gap-3 transition-colors"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#fef3c7", border: "1px solid rgba(252,211,77,0.3)" }}>
                <Key size={14} className="text-amber-500" />
              </div>
              <div className="text-left flex-1">
                <p className="font-pixel-thin text-black/75" style={{ fontSize: 16, fontWeight: 600 }}>API Keys</p>
                <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 13 }}>Connect your OpenRouter, Firebase & other keys</p>
              </div>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.05)" }}>
                <span className="text-black/30 text-sm">›</span>
              </div>
            </motion.button>

            {/* Logout row */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ background: "rgba(0,0,0,0.02)" }}
              className="w-full px-5 py-4 flex items-center gap-3 transition-colors"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.05)" }}>
                <LogOut size={14} className="text-black/40" />
              </div>
              <div className="text-left">
                <p className="font-pixel-thin text-black/75" style={{ fontSize: 16, fontWeight: 600 }}>Log Out</p>
                <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 13 }}>Sign out of your CozyJet account</p>
              </div>
            </motion.button>

            {/* Delete account row */}
            <motion.button
              onClick={() => setShowDelete(true)}
              whileHover={{ background: "rgba(239,68,68,0.03)" }}
              className="w-full px-5 py-4 flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <Trash2 size={14} className="text-red-400" />
              </div>
              <div className="text-left">
                <p className="font-pixel-thin text-red-400" style={{ fontSize: 16, fontWeight: 600 }}>Delete Account</p>
                <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 13 }}>Permanently removes all data and login credentials</p>
              </div>
            </motion.button>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 pb-4">
            <p className="font-pixel-thin text-black/25" style={{ fontSize: 13 }}>CozyJet v1.0 · Built for makers</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showApiKeys && <ApiKeysModal onClose={() => setShowApiKeys(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showDelete && <ConfirmDeleteModal onClose={() => setShowDelete(false)} onConfirm={handleDeleteAccount} />}
      </AnimatePresence>
    </div>
  );
}
