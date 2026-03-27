"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Linkedin, Twitter, Instagram, Youtube,
  BarChart3, Users, Zap, RefreshCw,
} from "lucide-react";

const ENGAGEMENT_DATA_30 = [
  { day: "Mar 1", linkedin: 3.2, twitter: 1.8, instagram: 4.1 },
  { day: "Mar 3", linkedin: 2.8, twitter: 2.4, instagram: 3.7 },
  { day: "Mar 5", linkedin: 4.5, twitter: 3.1, instagram: 5.2 },
  { day: "Mar 7", linkedin: 3.9, twitter: 2.7, instagram: 4.8 },
  { day: "Mar 9", linkedin: 5.1, twitter: 3.8, instagram: 6.0 },
  { day: "Mar 11", linkedin: 4.3, twitter: 2.9, instagram: 5.4 },
  { day: "Mar 13", linkedin: 6.2, twitter: 4.5, instagram: 7.1 },
  { day: "Mar 15", linkedin: 5.7, twitter: 4.1, instagram: 6.5 },
  { day: "Mar 17", linkedin: 7.0, twitter: 5.2, instagram: 8.2 },
  { day: "Mar 19", linkedin: 6.4, twitter: 4.8, instagram: 7.6 },
  { day: "Mar 21", linkedin: 8.1, twitter: 6.1, instagram: 9.0 },
  { day: "Mar 23", linkedin: 7.5, twitter: 5.7, instagram: 8.5 },
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

const TOP_POSTS = [
  { id: "1", platform: "linkedin", preview: "Just shipped a major update to our AI dashboard. Here's what changed...", date: "Mar 25", likes: 248, comments: 63, shares: 41, rate: 9.2 },
  { id: "2", platform: "twitter", preview: "rebuilt our dashboard from scratch. before: clunky, slow. after: fast, clean.", date: "Mar 23", likes: 892, comments: 124, shares: 231, rate: 8.8 },
  { id: "3", platform: "instagram", preview: "big update just dropped 🚀 rebuilt the entire dashboard.", date: "Mar 21", likes: 1420, comments: 89, shares: 67, rate: 10.1 },
  { id: "4", platform: "linkedin", preview: "Three things I learned building an AI agent from scratch.", date: "Mar 19", likes: 312, comments: 88, shares: 54, rate: 7.6 },
  { id: "5", platform: "twitter", preview: "shipped 3 features in 2 days while working solo.", date: "Mar 17", likes: 654, comments: 97, shares: 182, rate: 7.0 },
  { id: "6", platform: "linkedin", preview: "The real reason most solopreneurs fail at content marketing.", date: "Mar 15", likes: 187, comments: 52, shares: 38, rate: 6.5 },
];

const KPI_CARDS = [
  {
    label: "Posts This Month",
    value: "24",
    change: "+6",
    changeLabel: "vs last month",
    positive: true,
    icon: BarChart3,
    color: "#4f46e5",
    bg: "rgba(79,70,229,0.08)",
  },
  {
    label: "Avg Engagement Rate",
    value: "7.4%",
    change: "+1.2%",
    changeLabel: "vs last month",
    positive: true,
    icon: Zap,
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
  },
  {
    label: "Total Reach",
    value: "48.2K",
    change: "+12.5K",
    changeLabel: "vs last month",
    positive: true,
    icon: Users,
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.08)",
  },
  {
    label: "Best Platform",
    value: "Instagram",
    change: "9.5% avg",
    changeLabel: "engagement rate",
    positive: true,
    icon: Instagram,
    color: "#E4405F",
    bg: "rgba(228,64,95,0.08)",
  },
];

const PERIOD_OPTIONS = ["7d", "30d", "90d"];

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2.5 text-xs"
      style={{
        background: "rgba(10,10,15,0.9)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
      }}
    >
      <p className="font-bold text-white/70 mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="font-semibold">
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="p-6 space-y-6" style={{ background: "#f5f5f7", minHeight: "calc(100vh - 44px)" }}>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: kpi.bg }}
              >
                <kpi.icon size={17} style={{ color: kpi.color }} />
              </div>
              <div
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
              >
                <TrendingUp size={9} />
                {kpi.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-black/80 mb-0.5">{kpi.value}</p>
            <p className="text-[11px] font-medium text-black/35">{kpi.label}</p>
            <p className="text-[10px] text-black/25 mt-0.5">{kpi.changeLabel}</p>
          </motion.div>
        ))}
      </div>

      {/* Engagement Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-bold text-black/75">Engagement Rate Over Time</p>
            <p className="text-[11px] text-black/35 mt-0.5">% engagement per platform</p>
          </div>
          <div className="flex gap-1">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 h-7 rounded-lg text-xs font-semibold transition-all"
                style={
                  period === p
                    ? { background: "#4f46e5", color: "white" }
                    : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)" }
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={ENGAGEMENT_DATA_30}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgba(0,0,0,0.35)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(0,0,0,0.35)" }} tickLine={false} axisLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "rgba(0,0,0,0.45)", paddingTop: 12 }}
              formatter={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <Line type="monotone" dataKey="linkedin" name="linkedin" stroke="#0A66C2" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="twitter" name="twitter" stroke="#1DA1F2" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="instagram" name="instagram" stroke="#E4405F" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Content Type Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div className="mb-5">
          <p className="text-sm font-bold text-black/75">Engagement by Content Type</p>
          <p className="text-[11px] text-black/35 mt-0.5">Average % per content format</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={CONTENT_TYPE_DATA} barSize={18} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="type" tick={{ fontSize: 10, fill: "rgba(0,0,0,0.35)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(0,0,0,0.35)" }} tickLine={false} axisLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "rgba(0,0,0,0.45)", paddingTop: 8 }} />
            <Bar dataKey="linkedin" name="linkedin" fill="#0A66C2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="twitter" name="twitter" fill="#1DA1F2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="instagram" name="instagram" fill="#E4405F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top posts table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <p className="text-sm font-bold text-black/75">Top Performing Posts</p>
          <span className="text-[11px] text-black/35">Last 30 days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                {["Platform", "Content", "Date", "Likes", "Comments", "Shares", "Rate", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(0,0,0,0.3)" }}
                  >
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
                    className="border-b transition-colors hover:bg-black/[0.02]"
                    style={{ borderColor: "rgba(0,0,0,0.04)" }}
                  >
                    <td className="px-5 py-3">
                      <PIcon size={16} style={{ color: pColor }} />
                    </td>
                    <td className="px-5 py-3 max-w-[220px]">
                      <p className="text-xs text-black/60 truncate">{post.preview}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-black/40 whitespace-nowrap">{post.date}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-black/60">{post.likes.toLocaleString()}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-black/60">{post.comments}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-black/60">{post.shares}</td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
                      >
                        {post.rate}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        className="flex items-center gap-1 text-[11px] font-semibold px-2.5 h-6 rounded-lg transition-all"
                        style={{ background: "rgba(79,70,229,0.08)", color: "#4f46e5", border: "1px solid rgba(79,70,229,0.15)" }}
                      >
                        <RefreshCw size={10} /> Repurpose
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
