"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Zap, TrendingUp, Award, Activity, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const Flippo3DCharacter = dynamic(
  () => import("@/components/3d/FlippoCharacter").then((mod) => mod.Flippo3DCharacter),
  { 
    ssr: false,
    loading: () => (
      <div className="w-64 h-64 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }
);

export default function FlippoPage() {
  const stats = [
    { label: "Today's Focus", value: "4h 23m", change: "+12%", icon: Clock },
    { label: "Flow Score", value: "94%", change: "+8%", icon: Zap },
    { label: "Streak", value: "12 days", change: "Best!", icon: Award },
  ];

  const timeline = [
    { time: "9:00 AM", activity: "Deep work session", score: 98 },
    { time: "11:30 AM", activity: "Code review", score: 85 },
    { time: "2:00 PM", activity: "Team meeting", score: 72 },
    { time: "4:00 PM", activity: "Documentation", score: 91 },
  ];

  return (
    <div className="p-8 h-full flex flex-col bg-gradient-to-br from-slate-50 to-cyan-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Flippo</h1>
            <p className="text-sm text-slate-500">Productivity Timeline</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs font-bold">
            <Activity size={14} className="animate-pulse" />
            Live Tracking
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full h-64 bg-gradient-to-br from-white to-cyan-50 rounded-3xl shadow-lg flex items-center justify-center overflow-hidden"
        >
          <Flippo3DCharacter isActive={true} size="large" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100"
            >
              <stat.icon size={20} className="text-cyan-500 mb-3" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              <p className="text-[9px] text-green-500 font-bold mt-1">{stat.change}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Today's Timeline</h2>
            <button className="text-xs font-bold text-cyan-600 flex items-center gap-1">
              View Full <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-4">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-16 text-[10px] font-mono text-slate-400">{item.time}</div>
                <div className="flex-1 bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{item.activity}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-600">{item.score}%</span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-xs font-bold uppercase tracking-wider">Weekly Progress</p>
              <p className="text-3xl font-bold mt-2">+23%</p>
              <p className="text-cyan-100 text-sm mt-1">Better than last week</p>
            </div>
            <TrendingUp size={48} className="opacity-50" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
