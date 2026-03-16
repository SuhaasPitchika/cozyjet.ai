"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useUser } from "@/firebase";

const NAV_ITEMS = [
  { label: "Skippy", href: "/dashboard/skippy", icon: Eye },
  { label: "Flippo", href: "/dashboard/flippo", icon: Clock },
  { label: "Snooks", href: "/dashboard/snooks", icon: MessageSquare },
  { label: "AI Tuning", href: "/dashboard/tuning", icon: Settings2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUser();

  return (
    <div className="flex h-screen w-full overflow-hidden text-black font-sans selection:bg-black/5">
      <CustomCursor name={user?.displayName || user?.email || "Studio User"} />
      
      {/* Sidebar: Glassmorphic & Shrinkable */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 240 }}
        className="relative h-full glass border-r-0 flex flex-col shrink-0 z-50 m-4 rounded-[2rem]"
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <span className="font-pixel text-[8px] font-bold tracking-tighter text-black">STUDIO</span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-black/5 rounded-xl transition-colors mx-auto"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "bg-black text-white shadow-lg" 
                    : "text-black/40 hover:bg-black/5 hover:text-black"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", isActive ? "text-white" : "text-black/40 group-hover:text-black")} />
                {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>}
                {isCollapsed && isActive && (
                  <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-black/5">
          <button className="w-full flex items-center gap-4 px-4 py-4 text-red-400 hover:bg-red-500/5 rounded-2xl transition-colors group">
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative p-4 pl-0">
        <div className="glass h-full rounded-[2rem] overflow-y-auto custom-scrollbar relative">
          <div className="min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}