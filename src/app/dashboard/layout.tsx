"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { LogOut, ChevronLeft } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useReplitAuth } from "@/contexts/replit-auth-context";

const NAV_ITEMS = [
  { label: "Skippy",   href: "/dashboard/skippy",   abbr: "SK" },
  { label: "Snooks",   href: "/dashboard/snooks",   abbr: "SN" },
  { label: "Meta",     href: "/dashboard/meta",     abbr: "ME" },
  { label: "Tuning",   href: "/dashboard/tuning",   abbr: "TU" },
  { label: "Settings", href: "/dashboard/settings", abbr: "ST" },
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

  const sidebarW = collapsed ? 64 : 200;

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f0ece6" }}>
      {/* ─── SIDEBAR ─── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative shrink-0 flex flex-col z-40 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #f5ede0 0%, #ede3d4 100%)",
          borderRight: "1px solid rgba(0,0,0,0.09)",
          boxShadow: "2px 0 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo row */}
        <div
          className="flex items-center gap-2.5 px-3 flex-shrink-0"
          style={{ height: 72, borderBottom: "1px solid rgba(0,0,0,0.07)" }}
        >
          <Link href="/" className="flex-shrink-0">
            <motion.div whileHover={{ scale: 1.06 }} className="w-11 h-11 rounded-xl overflow-hidden">
              <Image src="/cozyjet-logo.png" alt="CozyJet" width={44} height={44} className="object-contain" />
            </motion.div>
          </Link>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="font-pixel text-black/75 leading-none truncate" style={{ fontSize: 12 }}>CozyJet</p>
                <p className="font-pixel-thin text-black/40 mt-0.5 truncate" style={{ fontSize: 13 }}>AI Studio</p>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setCollapsed(c => !c)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ml-auto"
            style={{ background: "rgba(0,0,0,0.06)" }}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronLeft size={13} className="text-black/40" />
            </motion.div>
          </motion.button>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-0.5 px-2 py-3 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center rounded-xl cursor-pointer transition-all"
                  style={{
                    height: 44,
                    paddingLeft: collapsed ? 0 : 12,
                    paddingRight: collapsed ? 0 : 12,
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: isActive ? "rgba(0,0,0,0.07)" : "transparent",
                    boxShadow: isActive ? "inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)" : "none",
                  }}
                >
                  {/* Abbr circle when collapsed */}
                  {collapsed ? (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isActive ? "rgba(0,0,0,0.09)" : "rgba(0,0,0,0.04)" }}
                    >
                      <span className="font-pixel text-black/60" style={{ fontSize: 7 }}>{item.abbr}</span>
                    </div>
                  ) : (
                    <>
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                          style={{ width: 3, height: 20, background: "rgba(0,0,0,0.3)" }}
                        />
                      )}
                      <span
                        className="font-pixel-thin truncate"
                        style={{
                          fontSize: 18,
                          color: isActive ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.45)",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(0,0,0,0.07)", margin: "0 12px" }} />

        {/* User footer */}
        <div className="px-2 py-3 flex-shrink-0">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.12)" }}
              >
                <span className="font-pixel text-black/60" style={{ fontSize: 8 }}>{initials}</span>
              </div>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.1 }}
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.05)" }}
              >
                <LogOut size={12} className="text-black/30 hover:text-red-400 transition-colors" />
              </motion.button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.7)" }}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,0,0,0.12)" }}
              >
                <span className="font-pixel text-black/60" style={{ fontSize: 8 }}>{initials}</span>
              </div>
              <p className="font-pixel-thin text-black/60 flex-1 truncate" style={{ fontSize: 14 }}>{displayName}</p>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.1 }}
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,0,0,0.04)" }}
              >
                <LogOut size={11} className="text-black/25 hover:text-red-400 transition-colors" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ─── MAIN ─── */}
      <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
    </div>
  );
}
