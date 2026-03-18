"use client";

import React from "react";
import { motion } from "framer-motion";
import { Power, Eye, Sparkles, Zap, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Skippy3DCharacter = dynamic(
  () => import("@/components/3d/SkippyCharacter").then((mod) => mod.Skippy3DCharacter),
  { 
    ssr: false,
    loading: () => (
      <div className="w-64 h-64 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }
);

export default function SkippyPage() {
  const { skippyActive, setSkippyActive } = useDashboardStore();
  const router = useRouter();

  const stats = [
    { label: "Screen Views", value: "2,847", change: "+12%", icon: Eye },
    { label: "Flow State", value: "94%", change: "+8%", icon: Sparkles },
    { label: "Focus Score", value: "87", change: "+5", icon: Zap },
  ];

  const features = [
    { title: "Workspace Awareness", desc: "Observes IDE, Browser, and Comm tools" },
    { title: "Flow Protection", desc: "Detects distractions and suggests breaks" },
    { title: "Smart Context", desc: "Understands what you're working on" },
  ];

  return (
    <div className="p-8 h-full flex flex-col bg-gradient-to-br from-[#fdfaf5] to-[#fef3c7]/20 overflow-y-auto">
      <div className="text-center space-y-8 max-w-2xl mx-auto w-full">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-600 text-[9px] font-bold uppercase tracking-[0.2em]"
        >
          <Sparkles size={12} className="animate-pulse" />
          AI-Powered Observer
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "w-72 h-72 mx-auto rounded-[3rem] flex items-center justify-center transition-all duration-700 overflow-hidden",
            skippyActive 
              ? "bg-gradient-to-br from-amber-100 to-yellow-100 shadow-[0_0_60px_rgba(251,191,36,0.3)]" 
              : "bg-white shadow-lg"
          )}
        >
          <Skippy3DCharacter isActive={skippyActive} size="large" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">Skippy</h1>
          <p className="text-sm text-slate-500 mt-1">The Observant Intelligence</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={() => setSkippyActive(!skippyActive)}
            className={cn(
              "group relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95",
              skippyActive 
                ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-[0_0_40px_rgba(245,158,11,0.5)]" 
                : "bg-white shadow-xl hover:shadow-2xl hover:scale-105"
            )}
          >
            {skippyActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 rounded-full border-4 border-white/30"
              />
            )}
            <div className={cn(
              "p-5 rounded-full transition-all duration-300",
              skippyActive ? "bg-white/20" : "bg-gradient-to-br from-slate-50 to-slate-100"
            )}>
              <Power size={32} className={skippyActive ? "text-white drop-shadow-lg" : "text-slate-400 group-hover:text-amber-500"} />
            </div>
          </button>
        </motion.div>

        <motion.div
          key={skippyActive ? "active" : "inactive"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2"
        >
          <span className={cn("w-2 h-2 rounded-full", skippyActive ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
            {skippyActive ? "Observing Your Workspace" : "Dormant"}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 pt-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
            >
              <stat.icon size={16} className="text-amber-500 mb-2" />
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-[8px] text-green-500 font-bold">{stat.change}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 gap-3 pt-4"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-slate-100"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Eye size={14} className="text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-700">{feature.title}</p>
                <p className="text-[9px] text-slate-400">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => router.push('/dashboard/skippy/cv')}
          className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:from-slate-700 hover:to-slate-600 transition-all shadow-lg hover:shadow-xl"
        >
          <MessageSquare size={16} />
          Open Chat Interface
          <ArrowRight size={16} />
        </motion.button>
      </div>

      <div className="mt-auto pt-8 text-center">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
          Privacy-First | Encrypted | Local-First
        </p>
      </div>
    </div>
  );
}
