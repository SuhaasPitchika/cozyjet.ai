"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { LogOut, PenLine, CalendarDays, BarChart3, Sliders, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useReplitAuth } from "@/contexts/replit-auth-context";

const NAV_ITEMS = [
  { label: "Create", href: "/dashboard/create", icon: PenLine, color: "#4f46e5", desc: "Content Studio" },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays, color: "#7c3aed", desc: "Schedule & Plan" },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "#0ea5e9", desc: "Performance" },
  { label: "Tune", href: "/dashboard/tuning", icon: Sliders, color: "#f59e0b", desc: "AI Voice Tuning" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, color: "#64748b", desc: "Integrations" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { replitUser, isReplitLoading, signOutReplit } = useReplitAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  const activeItem = NAV_ITEMS.find((n) => n.href === pathname);
  const displayName = user?.displayName || user?.email || replitUser?.name || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f5f5f7" }}>
      <aside
        className="w-[72px] shrink-0 flex flex-col z-40 items-center py-5 gap-2 relative"
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          borderRight: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "1px 0 24px rgba(0,0,0,0.06), inset -1px 0 0 rgba(255,255,255,0.8)",
        }}
      >
        <Link href="/" className="mb-5 group block">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}
          >
            <Image src="/cozyjet-logo.png" alt="CozyJet" width={40} height={40} className="object-contain" />
          </motion.div>
        </Link>

        <div className="w-6 h-px mb-2" style={{ background: "rgba(0,0,0,0.08)" }} />

        <nav className="flex flex-col gap-2 flex-1 w-full px-2.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative w-full h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer"
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${item.color}18, ${item.color}10)`,
                          boxShadow: `0 0 0 1.5px ${item.color}35, 0 4px 16px ${item.color}20`,
                        }
                      : { background: "transparent" }
                  }
                >
                  <item.icon
                    size={18}
                    style={{ color: isActive ? item.color : "rgba(0,0,0,0.28)" }}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span
                    className="text-[8px] font-bold uppercase tracking-wide"
                    style={{ color: isActive ? item.color : "rgba(0,0,0,0.22)" }}
                  >
                    {item.label}
                  </span>

                  <AnimatePresence>
                    {hoveredItem === item.href && !isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -4, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-full ml-3 z-50 pointer-events-none"
                      >
                        <div
                          className="px-3 py-2 rounded-xl whitespace-nowrap"
                          style={{
                            background: "rgba(10,10,10,0.88)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                          }}
                        >
                          <p className="text-white text-[11px] font-semibold">{item.label}</p>
                          <p className="text-white/40 text-[9px] mt-0.5">{item.desc}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-2 w-full px-2.5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-2xl flex items-center justify-center cursor-pointer select-none"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
            }}
            title={user?.email || replitUser?.name || ""}
          >
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </motion.div>
          <motion.button
            onClick={handleSignOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all group"
            style={{ background: "rgba(0,0,0,0.04)" }}
            title="Sign out"
          >
            <LogOut size={14} className="text-black/25 group-hover:text-red-400 transition-colors" />
          </motion.button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className="h-11 shrink-0 flex items-center justify-between px-6 border-b"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center gap-2">
            {activeItem && (
              <>
                <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: `${activeItem.color}15` }}>
                  <activeItem.icon size={11} style={{ color: activeItem.color }} />
                </div>
                <span className="text-sm font-semibold text-gray-700">{activeItem.label}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-400">{activeItem.desc}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)" }}
            />
            <span className="text-[10px] text-gray-400 font-medium">Live</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
