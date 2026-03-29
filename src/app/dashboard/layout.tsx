"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LogOut, Settings, Sliders, ChevronLeft,
} from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useReplitAuth } from "@/contexts/replit-auth-context";

const NAV_ITEMS = [
  {
    label: "Skippy",
    href: "/dashboard/skippy",
    color: "#6366f1",
    desc: "Observer & Integrations",
    emoji: "👁",
  },
  {
    label: "Snooks",
    href: "/dashboard/snooks",
    color: "#7c3aed",
    desc: "Content Strategist",
    emoji: "📅",
  },
  {
    label: "Meta",
    href: "/dashboard/meta",
    color: "#ec4899",
    desc: "AI Copywriter",
    emoji: "✍️",
  },
  {
    label: "Tuning",
    href: "/dashboard/tuning",
    color: "#f59e0b",
    desc: "Voice & API Config",
    emoji: "🎛",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    color: "#64748b",
    desc: "Account & Preferences",
    emoji: "⚙️",
    icon: Settings,
  },
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

  const displayName = user?.displayName || user?.email?.split("@")[0] || replitUser?.name || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const sidebarWidth = collapsed ? 68 : 220;

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#eeeef2" }}>
      {/* ─── SIDEBAR ─── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative shrink-0 flex flex-col z-40 overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          borderRight: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "2px 0 24px rgba(0,0,0,0.06), inset -1px 0 0 rgba(255,255,255,0.8)",
        }}
      >
        {/* ── Logo ── */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ height: 64, borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0 }}
        >
          <Link href="/" className="block flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.06 }}
              className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ boxShadow: "0 2px 10px rgba(99,102,241,0.22)" }}
            >
              <Image src="/cozyjet-logo.png" alt="CozyJet" width={32} height={32} style={{ width: "auto", height: "auto" }} className="object-contain" />
            </motion.div>
          </Link>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden flex-1"
              >
                <p className="text-[13px] font-bold text-black/75 leading-none">CozyJet</p>
                <p className="text-[10px] text-black/30 mt-0.5 font-medium">AI Studio</p>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ml-auto"
            style={{ background: "rgba(0,0,0,0.05)" }}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronLeft size={13} className="text-black/35" />
            </motion.div>
          </motion.button>
        </div>

        {/* ── Nav ── */}
        <div className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center gap-3 rounded-2xl transition-all duration-150 cursor-pointer"
                  style={{
                    height: 48,
                    paddingLeft: collapsed ? 0 : 12,
                    paddingRight: collapsed ? 0 : 12,
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: isActive
                      ? `rgba(255,255,255,0.75)`
                      : "transparent",
                    backdropFilter: isActive ? "blur(20px)" : "none",
                    WebkitBackdropFilter: isActive ? "blur(20px)" : "none",
                    border: isActive
                      ? `1px solid rgba(255,255,255,0.9)`
                      : "1px solid transparent",
                    boxShadow: isActive
                      ? `0 2px 12px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1)`
                      : "none",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                      style={{ height: 20, background: item.color }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{
                      background: isActive ? `${item.color}15` : "rgba(0,0,0,0.04)",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{item.emoji}</span>
                  </div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 min-w-0"
                      >
                        <p
                          className="text-[13px] font-semibold leading-none"
                          style={{ color: isActive ? item.color : "rgba(0,0,0,0.6)" }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-[10px] leading-none mt-0.5"
                          style={{ color: isActive ? `${item.color}80` : "rgba(0,0,0,0.28)" }}
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
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "0 16px" }} />

        {/* ── User footer ── */}
        <div className="px-3 py-3 flex-shrink-0">
          {!collapsed ? (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-black/70 leading-none truncate">{displayName}</p>
                <span className="text-[9px] font-bold px-1.5 py-px rounded-full inline-block mt-0.5"
                  style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>Pro</span>
              </div>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 group"
                style={{ background: "rgba(0,0,0,0.04)" }}
              >
                <LogOut size={11} className="text-black/25 group-hover:text-red-400 transition-colors" />
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.1 }}
                className="w-7 h-7 rounded-xl flex items-center justify-center group"
                style={{ background: "rgba(0,0,0,0.04)" }}
              >
                <LogOut size={12} className="text-black/25 group-hover:text-red-400 transition-colors" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ─── MAIN AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
