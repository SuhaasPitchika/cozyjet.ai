"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, Power, ShieldCheck, Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

const CAPABILITY_ITEMS = [
  { label: "IDE Activity", desc: "VSCode, Cursor, Neovim tracking" },
  { label: "Browser Context", desc: "Tab titles, domain patterns" },
  { label: "Commit Detection", desc: "Git hooks + push signals" },
  { label: "PII Filtering", desc: "Zero-leak local redaction" },
];

export default function SkippyPage() {
  const { skippyActive, setSkippyActive } = useDashboardStore();

  return (
    <div className="h-full bg-[#0f0f0f] p-8 flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Observer Agent</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Skippy</h1>
          <p className="text-sm text-white/40 mt-1">Workspace perception & context intelligence</p>
        </div>

        <button
          onClick={() => setSkippyActive(!skippyActive)}
          className={cn(
            "relative flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300",
            skippyActive
              ? "bg-white text-black"
              : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
          )}
        >
          <Power size={15} />
          <span>{skippyActive ? "Active" : "Activate"}</span>
          {skippyActive && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            />
          )}
        </button>
      </div>

      <div
        className={cn(
          "rounded-2xl border p-6 transition-all duration-500",
          skippyActive ? "border-white/10 bg-white/5" : "border-white/5 bg-white/[0.02]"
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500",
              skippyActive ? "bg-white text-black" : "bg-white/5 text-white/20"
            )}
          >
            <Eye size={22} />
          </div>
          <div>
            <div className="text-base font-medium text-white">
              {skippyActive ? "Observation Running" : "Observer Dormant"}
            </div>
            <div className="text-sm text-white/40 mt-0.5">
              {skippyActive
                ? "Capturing workspace events in real-time"
                : "Toggle the button above to start observation"}
            </div>
          </div>
          {skippyActive && (
            <div className="ml-auto flex items-center gap-2">
              <Activity size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>
          )}
        </div>

        {skippyActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid grid-cols-2 gap-3"
          >
            {CAPABILITY_ITEMS.map((cap, i) => (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
              >
                <Zap size={12} className="text-white/30 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-white/70">{cap.label}</div>
                  <div className="text-[10px] text-white/30">{cap.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
        <ShieldCheck size={14} className="text-white/30 mt-0.5 shrink-0" />
        <p className="text-[11px] text-white/30 leading-relaxed">
          Privacy-first architecture. All workspace data is processed locally with zero-persistence.
          PII blocklist is applied before any content leaves your device.
        </p>
      </div>
    </div>
  );
}
