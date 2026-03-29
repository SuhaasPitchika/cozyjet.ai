"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LogOut, PenLine, CalendarDays, BarChart3, Sliders, Settings,
  ChevronRight, Clock, Zap, Activity, Bell, Search, Plus,
  ChevronLeft,
} from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useReplitAuth } from "@/contexts/replit-auth-context";

const NAV_ITEMS = [
  {
    label: "Create",
    href: "/dashboard/create",
    icon: PenLine,
    color: "#6366f1",
    gradient: "from-indigo-500 to-purple-600",
    desc: "Content Studio",
    badge: "3",
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    color: "#8b5cf6",
    gradient: "from-violet-500 to-purple-600",
    desc: "Schedule & Plan",
    badge: null,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    color: "#0ea5e9",
    gradient: "from-sky-500 to-blue-600",
    desc: "Performance",
    badge: null,
  },
  {
    label: "Tune",
    href: "/dashboard/tuning",
    icon: Sliders,
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-500",
    desc: "AI Voice Tuning",
    badge: null,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    color: "#64748b",
    gradient: "from-slate-500 to-slate-600",
    desc: "Integrations",
    badge: null,
  },
];

const AGENTS = [
  {
    id: "skippy",
    name: "Skippy",
    role: "Silent Observer",
    color: "#6366f1",
    status: "active",
    statusLabel: "Extracts content seeds",
    pulse: true,
    href: "/dashboard/skippy",
  },
  {
    id: "snooks",
    name: "Snooks",
    role: "Content Strategist",
    color: "#8b5cf6",
    status: "idle",
    statusLabel: "Plans your content week",
    pulse: false,
    href: "/dashboard/snooks",
  },
  {
    id: "meta",
    name: "Meta",
    role: "AI Copywriter",
    color: "#ec4899",
    status: "active",
    statusLabel: "3 variations · your voice",
    pulse: true,
    href: "/dashboard/meta",
  },
];

const RECENT_ACTIVITY = [
  { icon: Zap, text: "Meta generated 3 LinkedIn posts", time: "2m ago", color: "#6366f1" },
  { icon: Clock, text: "Snooks scheduled post for 9am", time: "18m ago", color: "#8b5cf6" },
  { icon: Activity, text: "GitHub activity detected", time: "1h ago", color: "#10b981" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { replitUser, isReplitLoading, signOutReplit } = useReplitAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isLoading = isUserLoading || isReplitLoading;
  const isAuthenticated = !!user || !!replitUser;

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth");
  }, [isLoading, isAuthenticated, router]);

  const handleSignOut = async () => {
    try {
      if (user) await signOut(auth);
      if (replitUser) signOutReplit();
      router.push("/auth");
    } catch (e) { console.error(e); }
  };

  if (isLoading || !isAuthenticated) return null;

  const activeItem = NAV_ITEMS.find((n) => n.href === pathname || pathname.startsWith(n.href + "/"));
  const displayName = user?.displayName || user?.email?.split("@")[0] || replitUser?.name || "User";
  const email = user?.email || (replitUser ? `${replitUser.name}@replit` : "");
  const initials = displayName.slice(0, 2).toUpperCase();
  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f0f0f5" }}>
      {/* ─── SIDEBAR ─── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative shrink-0 flex flex-col z-40 overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          borderRight: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "2px 0 32px rgba(0,0,0,0.06)",
        }}
      >
        {/* ── Logo ── */}
        <div
          className="flex items-center gap-3 px-4 border-b"
          style={{ height: 60, borderColor: "rgba(0,0,0,0.07)", flexShrink: 0 }}
        >
          <Link href="/" className="block flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.06 }}
              className="w-9 h-9 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ boxShadow: "0 2px 12px rgba(99,102,241,0.25)" }}
            >
              <Image src="/cozyjet-logo.png" alt="CozyJet" width={36} height={36} style={{ width: "auto", height: "auto" }} className="object-contain" />
            </motion.div>
          </Link>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-bold text-black/80 leading-none">CozyJet</p>
                <p className="text-[10px] text-black/35 mt-0.5 leading-none font-medium">AI Studio</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex-1" />
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.05)" }}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronLeft size={13} className="text-black/40" />
            </motion.div>
          </motion.button>
        </div>

        {/* ── Quick create button ── */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pt-4 pb-1"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => router.push("/dashboard/create")}
                className="w-full h-9 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <div
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #5254cc, #7c3aed)" }}
                />
                <Plus size={13} />
                <span className="relative">New Content</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Nav ── */}
        <div className="flex flex-col gap-0.5 px-3 py-3 overflow-y-auto flex-1">
          {!collapsed && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-black/25 px-2 mb-1">Workspace</p>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer"
                  style={{
                    height: 42,
                    paddingLeft: collapsed ? 0 : 10,
                    paddingRight: collapsed ? 0 : 10,
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: isActive
                      ? `linear-gradient(135deg, ${item.color}18, ${item.color}0d)`
                      : "transparent",
                    border: isActive
                      ? `1px solid ${item.color}28`
                      : "1px solid transparent",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                      style={{ height: 22, background: item.color }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isActive ? `${item.color}20` : "rgba(0,0,0,0.05)",
                    }}
                  >
                    <item.icon
                      size={15}
                      style={{ color: isActive ? item.color : "rgba(0,0,0,0.38)" }}
                      strokeWidth={isActive ? 2.2 : 1.9}
                    />
                  </div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[13px] font-semibold leading-none"
                            style={{ color: isActive ? item.color : "rgba(0,0,0,0.68)" }}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className="text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white"
                              style={{ background: item.color }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-[10px] leading-none mt-0.5"
                          style={{ color: isActive ? `${item.color}90` : "rgba(0,0,0,0.28)" }}
                        >
                          {item.desc}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}

          {/* ── Agent Status ── */}
          {!collapsed && (
            <div className="mt-4 mb-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-black/25 px-2 mb-2">AI Agents</p>
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl mb-0.5 cursor-default"
                  style={{ background: "rgba(0,0,0,0.025)" }}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{ background: `${agent.color}20` }}
                    >
                      <span className="text-[10px] font-bold" style={{ color: agent.color }}>
                        {agent.name[0]}
                      </span>
                    </div>
                    {agent.pulse && (
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                        style={{ background: "#10b981", border: "1.5px solid white" }}
                      />
                    )}
                    {!agent.pulse && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                        style={{ background: "#d1d5db", border: "1.5px solid white" }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-black/70 leading-none">{agent.name}</p>
                    <p className="text-[9px] text-black/35 mt-0.5 leading-none truncate">{agent.statusLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Recent Activity ── */}
          {!collapsed && (
            <div className="mt-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-black/25 px-2 mb-2">Recent</p>
              {RECENT_ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg mb-0.5">
                  <div
                    className="w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: `${item.color}15` }}
                  >
                    <item.icon size={9} style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-black/55 leading-snug">{item.text}</p>
                    <p className="text-[9px] text-black/28 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── User footer ── */}
        <div
          className="border-t flex-shrink-0"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          {!collapsed ? (
            <div className="px-4 py-3 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <span className="text-[11px] font-bold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-black/75 leading-none truncate">{displayName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}
                  >
                    Pro
                  </span>
                  <p className="text-[9px] text-black/30 truncate">{email}</p>
                </div>
              </div>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 group"
                style={{ background: "rgba(0,0,0,0.04)" }}
                title="Sign out"
              >
                <LogOut size={12} className="text-black/25 group-hover:text-red-400 transition-colors" />
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <span className="text-[11px] font-bold text-white">{initials}</span>
              </div>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 rounded-xl flex items-center justify-center group"
                style={{ background: "rgba(0,0,0,0.04)" }}
              >
                <LogOut size={13} className="text-black/25 group-hover:text-red-400 transition-colors" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ─── MAIN AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top bar ── */}
        <header
          className="h-[60px] shrink-0 flex items-center justify-between px-5 border-b"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(0,0,0,0.07)",
          }}
        >
          <div className="flex items-center gap-3">
            {activeItem ? (
              <>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${activeItem.color}18` }}
                >
                  <activeItem.icon size={15} style={{ color: activeItem.color }} strokeWidth={2.1} />
                </div>
                <div>
                  <p className="text-sm font-bold text-black/80 leading-none">{activeItem.label}</p>
                  <p className="text-[10px] text-black/35 mt-0.5 leading-none">{activeItem.desc}</p>
                </div>
                <ChevronRight size={14} className="text-black/15" />
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${activeItem.color}12`, color: activeItem.color }}
                >
                  Active
                </span>
              </>
            ) : (
              <p className="text-sm font-semibold text-black/60">Dashboard</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 h-8 rounded-xl"
              style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <Search size={12} className="text-black/30" />
              <span className="text-[11px] text-black/30 hidden sm:block">Search...</span>
            </div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="relative w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.05)" }}
            >
              <Bell size={14} className="text-black/45" />
              <div
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "#6366f1", border: "1.5px solid white" }}
              />
            </motion.button>

            {/* Live indicator */}
            <div
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#10b981" }}
              />
              <span className="text-[10px] font-semibold text-emerald-600">Live</span>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
