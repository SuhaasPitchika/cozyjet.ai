"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Plus, Calendar, BarChart3, Settings, 
  Settings2, Activity, User, ChevronLeft, 
  ChevronRight, Sparkles, SlidersHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Create", icon: Plus, path: "/dashboard/create" },
  { label: "Calendar", icon: Calendar, path: "/dashboard/calendar" },
  { label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { label: "Tune", icon: SlidersHorizontal, path: "/dashboard/tune" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const AGENTS = [
  { id: "skippy", name: "Skippy", status: "active" },
  { id: "snooks", name: "Snooks", status: "idle" },
  { id: "meta", name: "Meta", status: "active" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "h-screen flex flex-col bg-[#1a1c23] text-white transition-all duration-300 relative",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-indigo-500 border border-indigo-400 flex items-center justify-center z-50 hover:bg-indigo-400 transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
           <span className="text-white font-bold text-lg leading-none">C</span>
        </div>
        {!collapsed && (
          <span className="font-headline font-bold text-xl tracking-tight">CozyJet</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
           const isActive = pathname === item.path;
           return (
             <Link 
               key={item.path} 
               href={item.path}
               className={cn(
                 "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                 isActive 
                   ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/10" 
                   : "text-slate-400 hover:text-white hover:bg-white/5"
               )}
             >
               <item.icon size={20} className={cn("shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
               {!collapsed && <span className="text-sm font-medium tracking-wide">{item.label}</span>}
             </Link>
           );
        })}
      </nav>

      {/* Agents Status */}
      <div className="px-6 py-6 border-t border-white/5 space-y-4">
        {!collapsed && <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Active Agents</span>}
        <div className="space-y-3">
          {AGENTS.map(agent => (
            <div key={agent.id} className="flex items-center gap-3 group cursor-help">
               <div className={cn(
                 "w-2 h-2 rounded-full",
                 agent.status === "active" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-slate-600"
               )} />
               {!collapsed && <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">{agent.name}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mt-auto border-t border-white/5">
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-2")}>
           <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              S
           </div>
           {!collapsed && (
             <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate">Suhaas</p>
                <p className="text-[10px] text-slate-500 font-bold">PRO TIER</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
