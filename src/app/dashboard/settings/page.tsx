"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Key, User, Monitor, Check, ChevronRight } from "lucide-react";
import { useUser } from "@/firebase";
import { useReplitAuth } from "@/contexts/replit-auth-context";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <motion.button
      onClick={onChange}
      className="relative flex-shrink-0"
      style={{ width: 40, height: 22 }}
    >
      <div
        className="w-full h-full rounded-full transition-colors duration-200"
        style={{ background: enabled ? "#6ee7f7" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
      />
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="absolute top-0.5 rounded-full"
        style={{ width: 18, height: 18, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
      />
    </motion.button>
  );
}

function Section({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}
        >
          <Icon size={13} style={{ color }} />
        </div>
        <span className="font-pixel text-white/60" style={{ fontSize: 8, letterSpacing: "0.15em" }}>{title}</span>
      </div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({ label, sub, right, border = true }: { label: string; sub?: string; right: React.ReactNode; border?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: border ? "1px solid rgba(255,255,255,0.05)" : "none" }}
    >
      <div>
        <p className="font-pixel-thin text-white/75" style={{ fontSize: 16 }}>{label}</p>
        {sub && <p className="font-pixel-thin text-white/30 mt-0.5" style={{ fontSize: 13 }}>{sub}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">{right}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { replitUser } = useReplitAuth();
  const displayName = user?.displayName || user?.email?.split("@")[0] || replitUser?.name || "User";
  const email = user?.email || replitUser?.name || "—";

  const [notifs, setNotifs] = useState({ seeds: true, schedule: true, trends: false });
  const [privacy, setPrivacy] = useState({ analytics: true, pii: true });
  const [display, setDisplay] = useState({ compact: false });
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "#0e0e14" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-8 py-5"
        style={{
          background: "rgba(14,14,20,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h1 className="font-pixel text-white/90" style={{ fontSize: 12 }}>SETTINGS</h1>
        <p className="font-pixel-thin text-white/35 mt-1" style={{ fontSize: 14 }}>Account & preferences</p>
      </div>

      <div className="px-8 py-7 max-w-xl">

        {/* Account */}
        <Section title="ACCOUNT" icon={User} color="#6ee7f7">
          <Row
            label={displayName}
            sub={email}
            right={
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6ee7f7, #b8a4ff)" }}
              >
                <span className="font-pixel text-black/70" style={{ fontSize: 8 }}>
                  {displayName.slice(0, 2).toUpperCase()}
                </span>
              </div>
            }
          />
          <Row
            label="Plan"
            sub="CozyJet Pro"
            border={false}
            right={
              <span
                className="font-pixel-thin px-3 py-1 rounded-full"
                style={{ fontSize: 13, background: "rgba(110,231,247,0.12)", color: "#6ee7f7", border: "1px solid rgba(110,231,247,0.2)" }}
              >
                Pro
              </span>
            }
          />
        </Section>

        {/* API Key */}
        <Section title="API KEY" icon={Key} color="#ffd97d">
          <div className="px-5 py-4">
            <p className="font-pixel-thin text-white/40 mb-3" style={{ fontSize: 13 }}>OpenRouter key for AI features</p>
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Key size={12} className="text-white/20 flex-shrink-0" />
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="flex-1 bg-transparent outline-none font-pixel-thin text-white/60 placeholder:text-white/20"
                style={{ fontSize: 14 }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="font-pixel-thin text-white/30 hover:text-white/60 transition-colors"
                style={{ fontSize: 12 }}
              >
                {showKey ? "hide" : "show"}
              </button>
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="NOTIFICATIONS" icon={Bell} color="#b8a4ff">
          <Row
            label="New seed detected"
            sub="When Skippy finds work to post about"
            right={<Toggle enabled={notifs.seeds} onChange={() => setNotifs(p => ({ ...p, seeds: !p.seeds }))} />}
          />
          <Row
            label="Schedule reminders"
            sub="Upcoming posting times from Snooks"
            right={<Toggle enabled={notifs.schedule} onChange={() => setNotifs(p => ({ ...p, schedule: !p.schedule }))} />}
          />
          <Row
            label="Trend alerts"
            sub="When a topic in your niche trends"
            border={false}
            right={<Toggle enabled={notifs.trends} onChange={() => setNotifs(p => ({ ...p, trends: !p.trends }))} />}
          />
        </Section>

        {/* Privacy */}
        <Section title="PRIVACY" icon={Shield} color="#ff9de2">
          <Row
            label="Usage analytics"
            sub="Anonymous feature usage data"
            right={<Toggle enabled={privacy.analytics} onChange={() => setPrivacy(p => ({ ...p, analytics: !p.analytics }))} />}
          />
          <Row
            label="PII filtering"
            sub="Block personal info before AI processing"
            border={false}
            right={<Toggle enabled={privacy.pii} onChange={() => setPrivacy(p => ({ ...p, pii: !p.pii }))} />}
          />
        </Section>

        {/* Display */}
        <Section title="DISPLAY" icon={Monitor} color="#a0aec0">
          <Row
            label="Compact mode"
            sub="Reduce padding and card sizes"
            border={false}
            right={<Toggle enabled={display.compact} onChange={() => setDisplay(p => ({ ...p, compact: !p.compact }))} />}
          />
        </Section>

        {/* Version */}
        <div className="flex items-center justify-center pt-2 pb-8">
          <p className="font-pixel-thin text-white/15" style={{ fontSize: 12 }}>CozyJet v1.0 · Built for makers</p>
        </div>
      </div>
    </div>
  );
}
