"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Linkedin, Twitter, Instagram, Youtube,
  Zap, TrendingUp, Calendar, X, Edit2, Trash2, Plus,
} from "lucide-react";

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

const MOCK_SCHEDULED: Record<string, Array<{ id: string; platform: string; text: string; time: string }>> = {
  "2026-03-28": [
    { id: "1", platform: "linkedin", text: "Just shipped a major update to our AI dashboard. Here's what changed and why it matters for solo creators...", time: "09:00 AM" },
    { id: "2", platform: "twitter", text: "rebuilt our dashboard from scratch this week. before: clunky, slow, confusing. after: fast, clean, focused.", time: "11:30 AM" },
  ],
  "2026-03-30": [
    { id: "3", platform: "instagram", text: "big update just dropped 🚀 rebuilt the entire dashboard. faster loads, cleaner design, smarter AI.", time: "02:00 PM" },
  ],
  "2026-04-02": [
    { id: "4", platform: "linkedin", text: "Three things I learned building an AI agent from scratch — and why the third one surprised me most.", time: "08:00 AM" },
    { id: "5", platform: "youtube", text: "How I rebuilt our entire product dashboard in 5 days — what worked, what didn't, and what's next.", time: "12:00 PM" },
    { id: "6", platform: "twitter", text: "shipped 3 features in 2 days while working solo. here's the system I use to stay focused and not burn out", time: "06:00 PM" },
  ],
  "2026-04-05": [
    { id: "7", platform: "instagram", text: "consistency > perfection. posted every day for 30 days. here's what happened to my account 📊", time: "10:00 AM" },
  ],
  "2026-04-08": [
    { id: "8", platform: "linkedin", text: "The real reason most solopreneurs fail at content marketing (and how AI changes the equation).", time: "09:00 AM" },
  ],
};

const SNOOKS_SUGGESTIONS = [
  { id: "s1", title: "Behind the build: How I shipped 3 features solo in 2 days", platform: "linkedin", reason: "High engagement on behind-the-scenes content this week" },
  { id: "s2", title: "Why AI-assisted content sounds generic — and how to fix it", platform: "twitter", reason: "Trending topic: AI authenticity" },
  { id: "s3", title: "Day in the life of a solo dev building in public", platform: "instagram", reason: "Your audience responds well to personal stories" },
  { id: "s4", title: "I analyzed 100 viral dev threads — here's the pattern", platform: "twitter", reason: "Data-driven content performs 2.3× better for you" },
  { id: "s5", title: "The stack behind CozyJet: every tool we use and why", platform: "linkedin", reason: "Tech stack posts trending in your niche" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const today = new Date(2026, 2, 27);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sidePanel, setSidePanel] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDay(null);
    setSidePanel(false);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDay(null);
    setSidePanel(false);
  };

  const getDateKey = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const handleDayClick = (day: number) => {
    const key = getDateKey(day);
    if (MOCK_SCHEDULED[key]) {
      setSelectedDay(day);
      setSidePanel(true);
    } else {
      setSelectedDay(day);
      setSidePanel(false);
    }
  };

  const selectedKey = selectedDay ? getDateKey(selectedDay) : null;
  const selectedPosts = selectedKey ? (MOCK_SCHEDULED[selectedKey] || []) : [];

  return (
    <div className="flex flex-col h-full" style={{ background: "#f5f5f7" }}>
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Month nav */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ background: "rgba(255,255,255,0.8)", borderColor: "rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "rgba(0,0,0,0.04)" }}
              >
                <ChevronLeft size={16} className="text-black/50" />
              </button>
              <h2 className="text-base font-bold text-black/80">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "rgba(0,0,0,0.04)" }}
              >
                <ChevronRight size={16} className="text-black/50" />
              </button>
            </div>
            <button
              className="flex items-center gap-2 px-4 h-8 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
            >
              <Plus size={13} /> Schedule Post
            </button>
          </div>

          {/* Calendar grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-bold uppercase tracking-widest text-black/25 py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const key = getDateKey(day);
                const posts = MOCK_SCHEDULED[key] || [];
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const isSelected = selectedDay === day;

                return (
                  <motion.div
                    key={day}
                    whileHover={{ y: -1 }}
                    onClick={() => handleDayClick(day)}
                    className="relative rounded-xl cursor-pointer transition-all duration-150"
                    style={{
                      minHeight: 72,
                      background: isSelected
                        ? "rgba(79,70,229,0.08)"
                        : "rgba(255,255,255,0.75)",
                      border: `1.5px solid ${isSelected ? "rgba(79,70,229,0.35)" : isToday ? "rgba(79,70,229,0.25)" : "rgba(0,0,0,0.06)"}`,
                      padding: "8px",
                    }}
                  >
                    <div
                      className="text-xs font-bold mb-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                      style={
                        isToday
                          ? { background: "#4f46e5", color: "white", fontSize: 11 }
                          : { color: "rgba(0,0,0,0.55)", fontSize: 11 }
                      }
                    >
                      {day}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {posts.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: PLATFORM_COLORS[post.platform] }}
                          title={post.platform}
                        />
                      ))}
                      {posts.length > 3 && (
                        <span className="text-[8px] text-black/30 font-medium">+{posts.length - 3}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Snooks suggestions strip */}
          <div
            className="border-t p-4"
            style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.6)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.12)" }}
              >
                <Zap size={11} style={{ color: "#7c3aed" }} />
              </div>
              <p className="text-xs font-bold text-black/60">
                Snooks Suggests — This Week
              </p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {SNOOKS_SUGGESTIONS.map((s) => {
                const PIcon = PLATFORM_ICONS[s.platform] || Twitter;
                const pColor = PLATFORM_COLORS[s.platform];
                return (
                  <motion.div
                    key={s.id}
                    whileHover={{ y: -2 }}
                    className="flex-shrink-0 rounded-xl p-3 cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(0,0,0,0.07)",
                      width: 220,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <PIcon size={11} style={{ color: pColor }} />
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: pColor }}>
                        {s.platform}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-black/70 leading-snug mb-2">{s.title}</p>
                    <div className="flex items-center gap-1 mb-3">
                      <TrendingUp size={9} className="text-black/25" />
                      <p className="text-[10px] text-black/35 leading-tight">{s.reason}</p>
                    </div>
                    <button
                      className="w-full h-6 rounded-lg text-[11px] font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                    >
                      Generate This
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side panel — day detail */}
        <AnimatePresence>
          {sidePanel && selectedDay && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="border-l flex-shrink-0 overflow-hidden flex flex-col"
              style={{
                borderColor: "rgba(0,0,0,0.06)",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              <div className="w-80 flex flex-col h-full">
                <div
                  className="flex items-center justify-between p-4 border-b"
                  style={{ borderColor: "rgba(0,0,0,0.06)" }}
                >
                  <div>
                    <p className="text-sm font-bold text-black/75">
                      {MONTHS[viewMonth]} {selectedDay}
                    </p>
                    <p className="text-[11px] text-black/35">{selectedPosts.length} posts scheduled</p>
                  </div>
                  <button
                    onClick={() => setSidePanel(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.05)" }}
                  >
                    <X size={13} className="text-black/40" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedPosts.map((post) => {
                    const PIcon = PLATFORM_ICONS[post.platform] || Twitter;
                    const pColor = PLATFORM_COLORS[post.platform];
                    return (
                      <div
                        key={post.id}
                        className="rounded-xl p-3"
                        style={{
                          background: `${pColor}06`,
                          border: `1px solid ${pColor}20`,
                          borderLeft: `3px solid ${pColor}`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <PIcon size={12} style={{ color: pColor }} />
                            <span className="text-[11px] font-bold" style={{ color: pColor }}>
                              {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              className="w-6 h-6 rounded-lg flex items-center justify-center"
                              style={{ background: "rgba(0,0,0,0.05)" }}
                            >
                              <Edit2 size={10} className="text-black/35" />
                            </button>
                            <button
                              className="w-6 h-6 rounded-lg flex items-center justify-center"
                              style={{ background: "rgba(239,68,68,0.08)" }}
                            >
                              <Trash2 size={10} style={{ color: "#ef4444" }} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-black/55 leading-relaxed line-clamp-3">{post.text}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar size={10} className="text-black/25" />
                          <span className="text-[10px] text-black/30">{post.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
