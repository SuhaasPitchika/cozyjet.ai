"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Linkedin, Twitter, Instagram, Youtube,
  Zap, TrendingUp, X, Edit2, Trash2, Plus,
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

/* ─── Hyperrealistic sticky note ─── */
function StickyNote({ post, color }: { post: { id: string; platform: string; text: string; time: string }; color: string }) {
  const PIcon = PLATFORM_ICONS[post.platform] || Twitter;
  const noteColors: Record<string, { bg: string; fold: string }> = {
    linkedin: { bg: "linear-gradient(160deg, #e8f4ff 0%, #d0e8ff 100%)", fold: "#b0d0f0" },
    twitter:  { bg: "linear-gradient(160deg, #e8f6ff 0%, #d0edff 100%)", fold: "#a8d8f5" },
    instagram:{ bg: "linear-gradient(160deg, #ffe8f0 0%, #ffd0e4 100%)", fold: "#f0a0c0" },
    youtube:  { bg: "linear-gradient(160deg, #fff0e8 0%, #ffe0d0 100%)", fold: "#f5b090" },
  };
  const nc = noteColors[post.platform] || noteColors.linkedin;

  return (
    <div
      className="relative rounded-sm overflow-visible"
      style={{
        background: nc.bg,
        boxShadow: `2px 3px 10px rgba(0,0,0,0.14), 1px 1px 3px rgba(0,0,0,0.08)`,
        padding: "10px 12px 14px",
        border: `1px solid ${color}25`,
      }}
    >
      {/* Bottom-right fold */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "0 0 16px 16px",
          borderColor: `transparent transparent ${nc.fold} transparent`,
          filter: "drop-shadow(-1px -1px 2px rgba(0,0,0,0.10))",
        }}
      />
      <div className="flex items-center gap-1.5 mb-2">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1.5px solid ${color}40` }}
        >
          <PIcon size={11} style={{ color }} />
        </div>
        <span className="font-pixel text-[9px] uppercase tracking-wider" style={{ color }}>
          {post.platform}
        </span>
        <span className="ml-auto font-pixel-thin text-[10px]" style={{ color: "rgba(0,0,0,0.32)" }}>
          {post.time}
        </span>
      </div>
      <p className="font-pixel-thin text-black/70 leading-snug line-clamp-3" style={{ fontSize: 12, lineHeight: 1.5 }}>
        {post.text}
      </p>
      <div className="flex items-center gap-1 mt-2.5 justify-end">
        <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-black/8 transition-colors">
          <Edit2 size={9} className="text-black/30" />
        </button>
        <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-50 transition-colors">
          <Trash2 size={9} style={{ color: "#ef4444" }} />
        </button>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const today = new Date(2026, 3, 7);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sidePanel, setSidePanel] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDay(null); setSidePanel(false);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDay(null); setSidePanel(false);
  };

  const getDateKey = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const key = getDateKey(day);
    setSidePanel(!!(MOCK_SCHEDULED[key]?.length));
  };

  const selectedKey = selectedDay ? getDateKey(selectedDay) : null;
  const selectedPosts = selectedKey ? (MOCK_SCHEDULED[selectedKey] || []) : [];

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: "linear-gradient(160deg, #fafbff 0%, #f0f4ff 50%, #f8f9ff 100%)",
      }}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar main area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Month nav — premium hyperrealistic header */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,255,0.92) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            <div className="flex items-center gap-3">
              <motion.button
                onClick={prevMonth}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
                }}
              >
                <ChevronLeft size={16} className="text-black/50" />
              </motion.button>
              <div>
                <h2 className="font-pixel-thin text-black/85" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
                  {MONTHS[viewMonth]}
                </h2>
                <p className="font-pixel text-black/30" style={{ fontSize: 9, letterSpacing: "0.12em" }}>{viewYear}</p>
              </div>
              <motion.button
                onClick={nextMonth}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
                }}
              >
                <ChevronRight size={16} className="text-black/50" />
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-pixel-thin text-white"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                fontSize: 13,
                boxShadow: "0 4px 16px rgba(79,70,229,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <Plus size={14} /> Schedule Post
            </motion.button>
          </div>

          {/* Calendar grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-3">
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className="text-center py-2"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.10em",
                    color: i === 0 || i === 6 ? "rgba(239,68,68,0.5)" : "rgba(0,0,0,0.22)",
                    fontFamily: "inherit",
                    textTransform: "uppercase",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const key = getDateKey(day);
                const posts = MOCK_SCHEDULED[key] || [];
                const isToday =
                  day === today.getDate() &&
                  viewMonth === today.getMonth() &&
                  viewYear === today.getFullYear();
                const isSelected = selectedDay === day;
                const isWeekend = new Date(viewYear, viewMonth, day).getDay() % 6 === 0;

                return (
                  <motion.div
                    key={day}
                    whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
                    onClick={() => handleDayClick(day)}
                    className="relative cursor-pointer transition-all duration-200"
                    style={{
                      minHeight: 76,
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(79,70,229,0.07) 0%, rgba(124,58,237,0.05) 100%)"
                        : isWeekend
                        ? "rgba(250,248,255,0.8)"
                        : "rgba(255,255,255,0.82)",
                      border: isSelected
                        ? "1.5px solid rgba(79,70,229,0.35)"
                        : isToday
                        ? "1.5px solid rgba(234,67,53,0.28)"
                        : "1px solid rgba(0,0,0,0.07)",
                      borderRadius: 14,
                      padding: "9px 10px",
                      boxShadow: isToday
                        ? "0 0 0 2px rgba(234,67,53,0.10), 0 4px 14px rgba(234,67,53,0.10)"
                        : "0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold relative"
                        style={
                          isToday
                            ? {
                                background: "#EA4335",
                                color: "white",
                                fontSize: 12,
                                boxShadow: "0 2px 8px rgba(234,67,53,0.45), 0 0 0 3px rgba(234,67,53,0.15)",
                              }
                            : {
                                color: isWeekend ? "rgba(180,60,60,0.55)" : "rgba(0,0,0,0.55)",
                                fontSize: 12,
                              }
                        }
                      >
                        {day}
                        {/* Red glow dot for today */}
                        {isToday && (
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full"
                            style={{ background: "rgba(234,67,53,0.35)" }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Platform color dots */}
                    <div className="flex flex-wrap gap-1">
                      {posts.slice(0, 4).map((post) => (
                        <div
                          key={post.id}
                          className="flex-shrink-0"
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: PLATFORM_COLORS[post.platform],
                            boxShadow: `0 1px 3px ${PLATFORM_COLORS[post.platform]}60`,
                          }}
                          title={post.platform}
                        />
                      ))}
                      {posts.length > 4 && (
                        <span style={{ fontSize: 8, color: "rgba(0,0,0,0.25)", fontWeight: 600 }}>
                          +{posts.length - 4}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Snooks suggestions strip */}
          <div
            className="border-t flex-shrink-0 p-4"
            style={{
              borderColor: "rgba(0,0,0,0.07)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(250,248,255,0.88) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.12)" }}
              >
                <Zap size={11} style={{ color: "#7c3aed" }} />
              </div>
              <p className="font-pixel text-black/55" style={{ fontSize: 9, letterSpacing: "0.10em" }}>
                SNOOKS SUGGESTS — THIS WEEK
              </p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {SNOOKS_SUGGESTIONS.map((s) => {
                const PIcon = PLATFORM_ICONS[s.platform] || Twitter;
                const pColor = PLATFORM_COLORS[s.platform];
                return (
                  <motion.div
                    key={s.id}
                    whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
                    className="flex-shrink-0 rounded-2xl p-3.5 cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      border: "1px solid rgba(0,0,0,0.07)",
                      width: 230,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <PIcon size={12} style={{ color: pColor }} />
                      <span className="font-pixel text-[9px] uppercase tracking-wider" style={{ color: pColor }}>
                        {s.platform}
                      </span>
                    </div>
                    <p className="font-pixel-thin text-black/72 leading-snug mb-2" style={{ fontSize: 13, fontWeight: 600 }}>
                      {s.title}
                    </p>
                    <div className="flex items-center gap-1 mb-3">
                      <TrendingUp size={9} className="text-black/25" />
                      <p className="font-pixel-thin text-black/35" style={{ fontSize: 11 }}>{s.reason}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="w-full h-7 rounded-xl font-pixel-thin text-white"
                      style={{
                        fontSize: 12,
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        boxShadow: "0 3px 10px rgba(79,70,229,0.28)",
                      }}
                    >
                      Generate This
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side panel — day detail with sticky notes */}
        <AnimatePresence>
          {sidePanel && selectedDay && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="border-l flex-shrink-0 overflow-hidden flex flex-col"
              style={{
                borderColor: "rgba(0,0,0,0.07)",
                background: "linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(250,248,255,0.92) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              <div className="w-80 flex flex-col h-full">
                {/* Panel header */}
                <div
                  className="flex items-center justify-between p-4 flex-shrink-0"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
                >
                  <div>
                    <p className="font-pixel-thin text-black/80" style={{ fontSize: 17, fontWeight: 700 }}>
                      {MONTHS[viewMonth]} {selectedDay}
                    </p>
                    <p className="font-pixel-thin text-black/35 mt-0.5" style={{ fontSize: 12 }}>
                      {selectedPosts.length} post{selectedPosts.length !== 1 ? "s" : ""} scheduled
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setSidePanel(false)}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.07)",
                    }}
                  >
                    <X size={13} className="text-black/40" />
                  </motion.button>
                </div>

                {/* Sticky notes list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {selectedPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 8, rotate: -1 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    >
                      <StickyNote post={post} color={PLATFORM_COLORS[post.platform]} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
