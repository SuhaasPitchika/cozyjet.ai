"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, MessageCircle, Hash, Zap, ArrowRight, Send, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";
import dynamic from "next/dynamic";

const Snooks3DCharacter = dynamic(
  () => import("@/components/3d/SnooksCharacter").then((mod) => mod.Snooks3DCharacter),
  { 
    ssr: false,
    loading: () => (
      <div className="w-64 h-64 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }
);

export default function SnooksPage() {
  const stats = [
    { label: "Viral Score", value: "94", change: "+12", icon: Sparkles },
    { label: "Engagement", value: "8.2K", change: "+23%", icon: TrendingUp },
    { label: "Shares", value: "1.4K", change: "+45%", icon: MessageCircle },
  ];

  const platforms = [
    { name: "Twitter", icon: Twitter, color: "bg-black", posts: 12 },
    { name: "LinkedIn", icon: Linkedin, color: "bg-blue-600", posts: 5 },
    { name: "YouTube", icon: Youtube, color: "bg-red-600", posts: 2 },
    { name: "Instagram", icon: Instagram, color: "bg-pink-600", posts: 8 },
  ];

  const suggestions = [
    { title: "Post thread on AI trends", platform: "Twitter", impact: "High", viral: 92 },
    { title: "Share productivity tips", platform: "LinkedIn", impact: "Medium", viral: 78 },
    { title: "Create carousel on growth", platform: "Instagram", impact: "High", viral: 88 },
  ];

  return (
    <div className="p-8 h-full flex flex-col bg-gradient-to-br from-orange-50 to-amber-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Snooks</h1>
            <p className="text-sm text-slate-500">Viral Content Strategist</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-xs font-bold">
            <Zap size={14} className="animate-pulse" />
            AI Marketing
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full h-64 bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-lg flex items-center justify-center overflow-hidden"
        >
          <Snooks3DCharacter isActive={true} size="large" />
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
              <stat.icon size={20} className="text-orange-500 mb-3" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              <p className="text-[9px] text-green-500 font-bold mt-1">{stat.change}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-lg"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-4">Connected Platforms</h2>
          <div className="grid grid-cols-4 gap-4">
            {platforms.map((platform, i) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <div className={`w-14 h-14 ${platform.color} rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                  <platform.icon size={24} className="text-white" />
                </div>
                <p className="text-xs font-bold text-slate-700">{platform.name}</p>
                <p className="text-[9px] text-slate-400">{platform.posts} posts</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">AI Suggestions</h2>
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-sm">{suggestion.title}</p>
                  <p className="text-xs text-orange-100">{suggestion.platform}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">{suggestion.impact} Impact</p>
                  <p className="text-xs">Viral: {suggestion.viral}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:from-slate-700 hover:to-slate-600 transition-all shadow-lg"
        >
          <Send size={16} />
          Generate Viral Content
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
