"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  Clock, 
  MessageSquare, 
  Settings2,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

const NAV_ITEMS = [
  { label: "Skippy", href: "/dashboard/skippy", icon: Eye },
  { label: "Flippo", href: "/dashboard/flippo", icon: Clock },
  { label: "Snooks", href: "/dashboard/snooks", icon: MessageSquare },
  { label: "AI Tuning", href: "/dashboard/tuning", icon: Settings2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden text-black font-pixel selection:bg-black/5">
      <CustomCursor name={user?.displayName || user?.email || "Studio User"} />
      
      {/* Sidebar: Hyper-Glassmorphic */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        className="relative h-full glass border-r border-white/40 flex flex-col shrink-0 z-50 m-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
      >
        <div className="p-8 flex items-center justify-between">
          {!isCollapsed && (
            <span className="text-[10px] font-bold tracking-tighter text-black">STUDIO</span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-black/5 rounded-2xl transition-colors mx-auto"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-5 rounded-3xl text-sm font-medium transition-all duration-300 group relative",
                  isActive 
                    ? "bg-black text-white shadow-2xl scale-[1.02]" 
                    : "text-black/40 hover:bg-white/60 hover:text-black"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", isActive ? "text-white" : "text-black/40 group-hover:text-black")} />
                {!isCollapsed && <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>}
                {isCollapsed && isActive && (
                  <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-black/5">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-5 py-5 text-red-500 hover:bg-red-500/5 rounded-3xl transition-colors group"
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-[8px] font-bold uppercase tracking-widest">Exit</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area: Floating Glass */}
      <main className="flex-1 overflow-y-auto relative p-4 pl-0">
        <div className="glass h-full rounded-[3rem] overflow-y-auto custom-scrollbar relative border border-white/40 shadow-2xl">
          <div className="min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
