"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar,
} from "recharts";
import {
  TrendingUp, TrendingDown, Linkedin, Twitter, Instagram, Youtube,
  BarChart3, Users, Zap, RefreshCw, ArrowUpRight, Flame, Eye, Heart,
} from "lucide-react";

const ENGAGEMENT_DATA = [
  { day: "Mar 1", linkedin: 3.2, twitter: 1.8, instagram: 4.1 },
  { day: "Mar 5", linkedin: 4.5, twitter: 3.1, instagram: 5.2 },
  { day: "Mar 9", linkedin: 5.1, twitter: 3.8, instagram: 6.0 },
  { day: "Mar 13", linkedin: 6.2, twitter: 4.5, instagram: 7.1 },
  { day: "Mar 17", linkedin: 7.0, twitter: 5.2, instagram: 8.2 },
  { day: "Mar 21", linkedin: 8.1, twitter: 6.1, instagram: 9.0 },
  { day: "Mar 25", linkedin: 9.2, twitter: 7.0, instagram: 10.1 },
  { day: "Mar 27", linkedin: 8.8, twitter: 6.5, instagram: 9.5 },
];

const CONTENT_TYPE_DATA = [
  { type: "Story", linkedin: 5.2, twitter: 3.4, instagram: 7.8 },
  { type: "Technical", linkedin: 7.1, twitter: 5.8, instagram: 4.2 },
  { type: "Data", linkedin: 8.5, twitter: 6.9, instagram: 3.6 },
  { type: "Thread", linkedin: 4.1, twitter: 9.2, instagram: 5.1 },
  { type: "Tutorial", linkedin: 6.8, twitter: 7.5, instagram: 6.3 },
];

const REACH_DATA = [
  { day: "W1", reach: 8400 },
  { day: "W2", reach: 12200 },
  { day: "W3", reach: 15800 },
  { day: "W4", reach: 11900 },
  { day: "W5", reach: 22100 },
  { day: "W6", reach: 28400 },
  { day: "W7", reach: 32000 },
  { day: "W8", reach: 48200 },
];

const TOP_POSTS = [
  { id: "1", platform: "instagram", preview: "big update just dropped 🚀 rebuilt the entire dashboard.", date: "Mar 21", likes: 1420, comments: 89, shares: 67, rate: 10.1, trend: "up" },
  { id: "2", platform: "linkedin", preview: "Just shipped a major update to our AI dashboard. Here's what changed...", date: "Mar 25", likes: 248, comments: 63, shares: 41, rate: 9.2, trend: "up" },
  { id: "3", platform: "twitter", preview: "rebuilt our dashboard from scratch. before: clunky, slow. after: fast, clean.", date: "Mar 23", likes: 892, comments: 124, shares: 231, rate: 8.8, trend: "up" },
  { id: "4", platform: "linkedin", preview: "Three things I learned building an AI agent from scratch.", date: "Mar 19", likes: 312, comments: 88, shares: 54, rate: 7.6, trend: "up" },
  { id: "5", platform: "twitter", preview: "shipped 3 features in 2 days while working solo.", date: "Mar 17", likes: 654, comments: 97, shares: 182, rate: 7.0, trend: "same" },
  { id: "6", platform: "linkedin", preview: "The real reason most solopreneurs fail at content marketing.", date: "Mar 15", likes: 187, comments: 52, shares: 38, rate: 6.5, trend: "down" },
];

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  instagram: "#E4405F",
  youtube: "#FF0000",
};

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
};

const KPI_CARDS = [
  { label: "Posts This Month", value: "24", sub: "+6 vs last month", delta: "+6", positive: true, icon: BarChart3, color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
  { label: "Avg Engagement", value: "7.4%", sub: "+1.2% vs last month", delta: "+1.2%", positive: true, icon: Zap, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  { label: "Total Reach", value: "48.2K", sub: "+12.5K vs last month", delta: "+26%", positive: true, icon: Eye, color: "#0ea5e9", bg: "rgba(14,165,233,0.08)" },
  { label: "Best Platform", value: "Instagram", sub: "9.5% avg engagement", delta: "🔥", positive: true, icon: Flame, color: "#E4405F", bg: "rgba(228,64,95,0.08)" },
];

const PERIOD_OPTIONS = ["7d", "30d", "90d"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs" style={{ background: "rgba(15,15,20,0.92)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
      <p className="font-bold text-white/60 mb-1.5 text-[10px] uppercase tracking-wide">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="font-semibold mb-0.5">
          {entry.name}: {typeof entry.value === "number" && entry.value > 100 ? entry.value.toLocaleString() : `${entry.value}%`}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="p-5 space-y-5" style={{ background: "#f0f0f5", minHeight: "100%" }}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-black/75">Performance Overview</p>
          <p className="text-[11px] text-black/38 mt-0.5">Tracking 4 platforms · March 2026</p>
        </div>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 h-7 rounded-lg text-[11px] font-bold transition-all"
              style={period === p ? { background: "#6366f1", color: "white" } : { background: "rgba(255,255,255,0.8)", color: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-40 blur-2xl"
              style={{ background: kpi.color, transform: "translate(30%, -30%)" }}
            />
            <div className="flex items-center justify-between mb-3 relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
              <div
                className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: kpi.positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: kpi.positive ? "#10b981" : "#ef4444" }}
              >
                {kpi.positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {kpi.delta}
              </div>
            </div>
            <p className="text-2xl font-bold text-black/82 relative">{kpi.value}</p>
            <p className="text-[10px] font-semibold text-black/35 mt-0.5 relative">{kpi.label}</p>
            <p className="text-[9px] text-black/22 mt-0.5 relative">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Engagement over time — 3/5 width */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="lg:col-span-3 rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-black/75">Engagement Rate</p>
              <p className="text-[10px] text-black/35 mt-0.5">% per platform over time</p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: "LinkedIn", color: "#0A66C2" },
                { label: "Twitter", color: "#1DA1F2" },
                { label: "Instagram", color: "#E4405F" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[9px] text-black/40 font-medium">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ENGAGEMENT_DATA}>
              <defs>
                <linearGradient id="li" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A66C2" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0A66C2" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1DA1F2" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1DA1F2" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E4405F" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#E4405F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "rgba(0,0,0,0.3)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(0,0,0,0.3)" }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="linkedin" name="LinkedIn" stroke="#0A66C2" strokeWidth={2} fill="url(#li)" dot={false} />
              <Area type="monotone" dataKey="twitter" name="Twitter" stroke="#1DA1F2" strokeWidth={2} fill="url(#tw)" dot={false} />
              <Area type="monotone" dataKey="instagram" name="Instagram" stroke="#E4405F" strokeWidth={2} fill="url(#ig)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Reach over time — 2/5 */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="mb-4">
            <p className="text-sm font-bold text-black/75">Total Reach</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold text-black/80">48.2K</p>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)" }}>
                <ArrowUpRight size={9} /> +26%
              </span>
            </div>
            <p className="text-[10px] text-black/30 mt-0.5">vs last {period}</p>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <AreaChart data={REACH_DATA}>
              <defs>
                <linearGradient id="reach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "rgba(0,0,0,0.3)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="reach" name="Reach" stroke="#6366f1" strokeWidth={2} fill="url(#reach)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Content type bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-black/75">Engagement by Content Type</p>
            <p className="text-[10px] text-black/35 mt-0.5">Average % per format across platforms</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={CONTENT_TYPE_DATA} barSize={14} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis dataKey="type" tick={{ fontSize: 10, fill: "rgba(0,0,0,0.35)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "rgba(0,0,0,0.3)" }} tickLine={false} axisLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="linkedin" name="LinkedIn" fill="#0A66C2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="twitter" name="Twitter" fill="#1DA1F2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="instagram" name="Instagram" fill="#E4405F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top posts table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.43 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div>
            <p className="text-sm font-bold text-black/75">Top Performing Posts</p>
            <p className="text-[10px] text-black/35 mt-0.5">Sorted by engagement rate</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.38)" }}>
            Last 30 days
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "rgba(0,0,0,0.02)" }}>
                {["Platform", "Content Preview", "Date", "Likes", "Comments", "Shares", "Rate", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.28)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_POSTS.map((post, i) => {
                const PIcon = PLATFORM_ICONS[post.platform] || Twitter;
                const pColor = PLATFORM_COLORS[post.platform];
                return (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 + i * 0.04 }}
                    className="border-b transition-colors hover:bg-black/[0.015]"
                    style={{ borderColor: "rgba(0,0,0,0.04)" }}
                  >
                    <td className="px-4 py-3">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${pColor}14` }}>
                        <PIcon size={14} style={{ color: pColor }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-[12px] text-black/60 truncate">{post.preview}</p>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-black/35 whitespace-nowrap">{post.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Heart size={10} className="text-red-400" />
                        <span className="text-[11px] font-semibold text-black/60">{post.likes.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-semibold text-black/55">{post.comments}</td>
                    <td className="px-4 py-3 text-[11px] font-semibold text-black/55">{post.shares}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                        {post.rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 h-6 rounded-lg"
                        style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.18)" }}
                      >
                        <RefreshCw size={9} /> Repurpose
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
