"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { LogOut, ChevronRight, Flame, X } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useReplitAuth } from "@/contexts/replit-auth-context";
import { useAgentWebSocket } from "@/hooks/use-websocket";

const NAV_ITEMS = [
  { label: "Skippy",   href: "/dashboard/skippy",   abbr: "SK" },
  { label: "Snooks",   href: "/dashboard/snooks",   abbr: "SN" },
  { label: "Meta",     href: "/dashboard/meta",     abbr: "ME" },
  { label: "Tuning",   href: "/dashboard/tuning",   abbr: "TU" },
  { label: "Analytics",href: "/dashboard/analytics",abbr: "AN" },
  { label: "Settings", href: "/dashboard/settings", abbr: "ST" },
];

const ONBOARDING_KEY = "cozyjet_onboarding_done";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { replitUser, isReplitLoading, signOutReplit } = useReplitAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showMomentum, setShowMomentum] = useState(false);

  const isLoading = isUserLoading || isReplitLoading;
  const isAuthenticated = !!user || !!replitUser;

  const { lastMomentumAlert } = useAgentWebSocket();

  useEffect(() => {
    if (lastMomentumAlert) {
      setShowMomentum(true);
      const t = setTimeout(() => setShowMomentum(false), 8000);
      return () => clearTimeout(t);
    }
  }, [lastMomentumAlert]);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth");
  }, [isLoading, isAuthenticated, router]);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      try {
        if (!localStorage.getItem(ONBOARDING_KEY)) {
          router.push("/onboarding");
        }
      } catch {}
    }
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

  const sidebarW = collapsed ? 72 : 220;

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f0ece6" }}>

      {/* ─── SIDEBAR ─── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        className="relative shrink-0 flex flex-col z-40 overflow-visible"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.18) 50%, rgba(255,245,230,0.22) 100%)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          borderRight: "1px solid rgba(255,255,255,0.55)",
          boxShadow: "4px 0 40px rgba(0,0,0,0.07), inset 1px 0 0 rgba(255,255,255,0.7), inset -1px 0 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* Inner glass sheen */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 60%)",
            borderRadius: "inherit",
          }}
        />

        {/* ── Logo row ── */}
        <div
          className="relative flex items-center flex-shrink-0"
          style={{
            height: 84,
            borderBottom: "1px solid rgba(255,255,255,0.30)",
            paddingLeft: collapsed ? 0 : 16,
            paddingRight: collapsed ? 0 : 10,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="logo-only"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18 }}
              >
                <Link href="/">
                  <motion.div whileHover={{ scale: 1.06 }} className="w-11 h-11 rounded-2xl overflow-hidden">
                    <Image src="/cozyjet-logo.png" alt="CozyJet" width={44} height={44} className="object-contain" />
                  </motion.div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <Link href="/" className="flex-shrink-0">
                  <motion.div whileHover={{ scale: 1.05 }} className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
                    <Image src="/cozyjet-logo.png" alt="CozyJet" width={56} height={56} className="object-contain" />
                  </motion.div>
                </Link>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p
                    className="font-pixel leading-none"
                    style={{ fontSize: 16, color: "rgba(30,20,10,0.88)", letterSpacing: "0.02em" }}
                  >
                    CozyJet
                  </p>
                  <p
                    className="font-pixel-thin mt-1"
                    style={{ fontSize: 12, color: "rgba(30,20,10,0.40)", letterSpacing: "0.04em" }}
                  >
                    AI Studio
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Nav items ── */}
        <div className="flex flex-col gap-1 px-2.5 py-4 flex-1 relative z-10">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02, x: collapsed ? 0 : 2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center rounded-2xl cursor-pointer overflow-hidden"
                  style={{
                    height: 46,
                    paddingLeft: collapsed ? 0 : 14,
                    paddingRight: collapsed ? 0 : 14,
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.40) 100%)"
                      : "transparent",
                    backdropFilter: isActive ? "blur(12px)" : "none",
                    WebkitBackdropFilter: isActive ? "blur(12px)" : "none",
                    border: isActive
                      ? "1px solid rgba(255,255,255,0.70)"
                      : "1px solid transparent",
                    boxShadow: isActive
                      ? "0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.04)"
                      : "none",
                    transition: "background 0.2s, border 0.2s, box-shadow 0.2s",
                  }}
                >
                  {/* Active left accent bar */}
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="nav-accent"
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                      style={{ width: 3, height: 22, background: "rgba(20,10,0,0.35)" }}
                    />
                  )}

                  {collapsed ? (
                    <motion.div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.60)"
                          : "rgba(255,255,255,0.20)",
                        boxShadow: isActive
                          ? "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.06)"
                          : "none",
                      }}
                    >
                      <span className="font-pixel" style={{ fontSize: 9, color: isActive ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)" }}>
                        {item.abbr}
                      </span>
                    </motion.div>
                  ) : (
                    <span
                      className="font-pixel-thin truncate pl-2"
                      style={{
                        fontSize: 16,
                        color: isActive ? "rgba(15,10,5,0.82)" : "rgba(15,10,5,0.46)",
                        fontWeight: isActive ? 600 : 400,
                        letterSpacing: "0.01em",
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
            margin: "0 12px",
          }}
        />

        {/* ── User footer ── */}
        <div className="px-2.5 py-3 flex-shrink-0 relative z-10">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.40)",
                  border: "1px solid rgba(255,255,255,0.65)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                <span className="font-pixel text-black/70" style={{ fontSize: 8 }}>{initials}</span>
              </div>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.30)",
                  border: "1px solid rgba(255,255,255,0.55)",
                }}
              >
                <LogOut size={13} className="text-black/35 hover:text-red-400 transition-colors" />
              </motion.button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.30) 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.70)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.85)",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(0,0,0,0.10)",
                  border: "1px solid rgba(255,255,255,0.6)",
                }}
              >
                <span className="font-pixel text-black/65" style={{ fontSize: 8 }}>{initials}</span>
              </div>
              <p className="font-pixel-thin text-black/60 flex-1 truncate" style={{ fontSize: 13 }}>{displayName}</p>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,0,0,0.05)" }}
              >
                <LogOut size={11} className="text-black/30 hover:text-red-400 transition-colors" />
              </motion.button>
            </div>
          )}
        </div>

        {/* ── Floating toggle button ── */}
        <motion.button
          onClick={() => setCollapsed(c => !c)}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          className="absolute flex items-center justify-center"
          style={{
            top: 28,
            right: -14,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(240,235,228,0.85) 100%)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1.5px solid rgba(255,255,255,0.80)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
            zIndex: 50,
            cursor: "pointer",
          }}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronRight size={14} style={{ color: "rgba(0,0,0,0.50)" }} />
          </motion.div>
        </motion.button>
      </motion.aside>

      {/* ─── MAIN ─── */}
      <main className="flex-1 min-w-0 overflow-hidden">{children}</main>

      {/* ─── MOMENTUM ALERT TOAST ─── */}
      <AnimatePresence>
        {showMomentum && lastMomentumAlert && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,250,240,0.92) 100%)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(251,146,60,0.35)",
              boxShadow: "0 8px 40px rgba(251,146,60,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
              maxWidth: 340,
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              <Flame size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-pixel text-[11px] text-orange-700 uppercase tracking-wider mb-0.5">Momentum Alert</p>
              <p className="font-pixel-thin text-[13px] text-black/75 leading-snug">
                {lastMomentumAlert.platform} score hit {lastMomentumAlert.score} — {lastMomentumAlert.reason}
              </p>
            </div>
            <button onClick={() => setShowMomentum(false)} className="flex-shrink-0 mt-0.5">
              <X size={14} className="text-black/30 hover:text-black/60 transition-colors" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
