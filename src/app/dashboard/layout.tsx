"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { LogOut, Settings } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useReplitAuth } from "@/contexts/replit-auth-context";

const NAV_ITEMS = [
  { label: "SKIPPY", href: "/dashboard/skippy", color: "#6ee7f7", glow: "rgba(110,231,247,0.5)" },
  { label: "SNOOKS", href: "/dashboard/snooks", color: "#b8a4ff", glow: "rgba(184,164,255,0.5)" },
  { label: "META",   href: "/dashboard/meta",   color: "#ff9de2", glow: "rgba(255,157,226,0.5)" },
  { label: "TUNING", href: "/dashboard/tuning", color: "#ffd97d", glow: "rgba(255,217,125,0.5)" },
  { label: "SETTINGS", href: "/dashboard/settings", color: "#a0aec0", glow: "rgba(160,174,192,0.4)" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { replitUser, isReplitLoading, signOutReplit } = useReplitAuth();

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

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#0e0e14" }}>
      {/* ─── SIDEBAR ─── */}
      <aside
        className="relative shrink-0 flex flex-col z-40"
        style={{
          width: 72,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(48px) saturate(180%)",
          WebkitBackdropFilter: "blur(48px) saturate(180%)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "2px 0 40px rgba(0,0,0,0.4), inset -1px 0 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ boxShadow: "0 0 20px rgba(110,231,247,0.3), 0 2px 8px rgba(0,0,0,0.4)" }}
            >
              <Image src="/cozyjet-logo.png" alt="CozyJet" width={36} height={36} className="object-contain" />
            </motion.div>
          </Link>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col items-center gap-1 py-4 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className="w-full flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className="relative flex flex-col items-center justify-center gap-1 cursor-pointer rounded-2xl transition-all"
                  style={{
                    width: 52,
                    paddingTop: 8,
                    paddingBottom: 8,
                    background: isActive
                      ? `rgba(255,255,255,0.08)`
                      : "transparent",
                    border: isActive
                      ? `1px solid rgba(255,255,255,0.12)`
                      : "1px solid transparent",
                    boxShadow: isActive
                      ? `0 0 16px ${item.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
                      : "none",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                      style={{ width: 3, height: 24, background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className="font-pixel-thin"
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.12em",
                      color: isActive ? item.color : "rgba(255,255,255,0.3)",
                      textShadow: isActive ? `0 0 10px ${item.color}` : "none",
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                    }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* User */}
        <div className="flex flex-col items-center py-4 gap-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6ee7f7, #b8a4ff)" }}
          >
            <span className="font-pixel text-[8px] text-black">{initials}</span>
          </div>
          <motion.button
            onClick={handleSignOut}
            whileHover={{ scale: 1.1 }}
            className="w-7 h-7 rounded-xl flex items-center justify-center group"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <LogOut size={12} className="text-white/20 group-hover:text-red-400 transition-colors" />
          </motion.button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
    </div>
  );
}
