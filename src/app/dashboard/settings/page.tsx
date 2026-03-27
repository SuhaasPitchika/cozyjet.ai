"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github, Figma, Linkedin, Twitter, Instagram, Youtube,
  Check, RefreshCw, Trash2, Bell, Clock, CreditCard, Shield, ChevronRight,
} from "lucide-react";

const INTEGRATIONS = [
  {
    id: "github", label: "GitHub", icon: Github, color: "#6366f1",
    description: "Commits, pull requests, and repos",
    connected: true, username: "@yourhandle", lastSync: "12 min ago", seeds: "3 commits detected",
  },
  {
    id: "figma", label: "Figma", icon: Figma, color: "#a259ff",
    description: "File edits, prototypes, and designs",
    connected: true, username: "yourname@email.com", lastSync: "2 hours ago", seeds: "1 file updated",
  },
  {
    id: "notion", label: "Notion", icon: null, color: "#000000",
    description: "Pages, databases, and docs edited",
    connected: false, username: null, lastSync: null, seeds: null,
  },
  {
    id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2",
    description: "Publishing, scheduling, and analytics",
    connected: false, username: null, lastSync: null, seeds: null,
  },
  {
    id: "twitter", label: "Twitter/X", icon: Twitter, color: "#1DA1F2",
    description: "Tweet scheduling and analytics",
    connected: true, username: "@yourhandle", lastSync: "45 min ago", seeds: "0 new",
  },
  {
    id: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F",
    description: "Post scheduling and reach tracking",
    connected: false, username: null, lastSync: null, seeds: null,
  },
];

const SETTINGS_SECTIONS = [
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    color: "#4f46e5",
    items: [
      { id: "n1", label: "New seed detected", desc: "When Skippy finds new work to post about", enabled: true },
      { id: "n2", label: "Post scheduled", desc: "Confirmation when a post is added to the calendar", enabled: true },
      { id: "n3", label: "Post published", desc: "Confirmation when a post goes live", enabled: true },
      { id: "n4", label: "Weekly digest", desc: "Monday morning summary of performance and suggestions", enabled: false },
      { id: "n5", label: "Sync completed", desc: "When Skippy finishes a background sync", enabled: false },
    ],
  },
  {
    id: "posting",
    label: "Posting Preferences",
    icon: Clock,
    color: "#10b981",
    items: [
      { id: "p1", label: "Auto-schedule with Snooks", desc: "Let Snooks pick optimal posting times automatically", enabled: true },
      { id: "p2", label: "Confirm before publishing", desc: "Require manual approval before any post goes live", enabled: true },
      { id: "p3", label: "Time zone auto-detection", desc: "Automatically use your device's time zone", enabled: true },
    ],
  },
];

function NotionIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
    </svg>
  );
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(
    Object.fromEntries(SETTINGS_SECTIONS[0].items.map((i) => [i.id, i.enabled]))
  );
  const [posting, setPosting] = useState(
    Object.fromEntries(SETTINGS_SECTIONS[1].items.map((i) => [i.id, i.enabled]))
  );
  const [syncing, setSyncing] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const handleSync = async (id: string) => {
    setSyncing(id);
    await new Promise((r) => setTimeout(r, 1500));
    setSyncing(null);
  };

  const handleDisconnect = (id: string) => {
    setDisconnecting(id);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto" style={{ background: "#f5f5f7", minHeight: "calc(100vh - 44px)" }}>
      {/* Connected Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(79,70,229,0.1)" }}>
            <Shield size={17} style={{ color: "#4f46e5" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-black/80">Connected Apps</p>
            <p className="text-[11px] text-black/35">Manage your integrations — Skippy reads these automatically</p>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          {INTEGRATIONS.map((intg, i) => (
            <motion.div
              key={intg.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 px-6 py-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${intg.color}12`, border: `1px solid ${intg.color}20` }}
              >
                {intg.icon ? (
                  <intg.icon size={18} style={{ color: intg.color }} />
                ) : (
                  <span style={{ color: intg.color }}><NotionIcon size={18} /></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-black/75">{intg.label}</p>
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: intg.connected ? "#10b981" : "rgba(0,0,0,0.15)" }}
                  />
                  {intg.connected && (
                    <span className="text-[10px] font-semibold text-emerald-600">Connected</span>
                  )}
                </div>
                <p className="text-[11px] text-black/35 mt-0.5">{intg.description}</p>
                {intg.connected && (
                  <p className="text-[10px] text-black/25 mt-0.5">
                    {intg.username} · {intg.seeds} · Synced {intg.lastSync}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {intg.connected ? (
                  <>
                    <button
                      onClick={() => handleSync(intg.id)}
                      disabled={syncing === intg.id}
                      className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50"
                      style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,0,0,0.08)" }}
                    >
                      <RefreshCw size={11} className={syncing === intg.id ? "animate-spin" : ""} />
                      {syncing === intg.id ? "Syncing..." : "Sync Now"}
                    </button>
                    <button
                      onClick={() => handleDisconnect(intg.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}
                    >
                      <Trash2 size={12} style={{ color: "#ef4444" }} />
                    </button>
                  </>
                ) : (
                  <button
                    className="flex items-center gap-1.5 px-4 h-7 rounded-lg text-[11px] font-semibold text-white transition-all"
                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                  >
                    Connect
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Notification preferences */}
      {SETTINGS_SECTIONS.map((section, si) => {
        const toggleMap = si === 0 ? notifications : posting;
        const setToggleMap = si === 0 ? setNotifications : setPosting;
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + si * 0.08 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${section.color}12` }}>
                <section.icon size={17} style={{ color: section.color }} />
              </div>
              <p className="text-sm font-bold text-black/80">{section.label}</p>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
              {section.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm text-black/70 font-medium">{item.label}</p>
                    <p className="text-[11px] text-black/35 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setToggleMap((prev: any) => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                    style={{ background: toggleMap[item.id] ? "#4f46e5" : "rgba(0,0,0,0.12)" }}
                  >
                    <motion.div
                      animate={{ x: toggleMap[item.id] ? 16 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full"
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
            <CreditCard size={17} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-black/80">Subscription</p>
            <p className="text-[11px] text-black/35">Manage your CozyJet plan</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                >
                  Free Plan
                </span>
              </div>
              <p className="text-[11px] text-black/35">5 content generations/month · 1 integration · No scheduling</p>
            </div>
            <button
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              Upgrade to Pro <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Disconnect confirm dialog */}
      <AnimatePresence>
        {disconnecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setDisconnecting(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 w-80"
              style={{ background: "white", boxShadow: "0 24px 48px rgba(0,0,0,0.18)" }}
            >
              <p className="text-sm font-bold text-black/80 mb-2">Disconnect integration?</p>
              <p className="text-xs text-black/40 leading-relaxed mb-5">
                This will stop Skippy from syncing this tool. Your existing content seeds will not be deleted.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDisconnecting(null)}
                  className="flex-1 h-9 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setDisconnecting(null)}
                  className="flex-1 h-9 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#ef4444" }}
                >
                  Disconnect
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
