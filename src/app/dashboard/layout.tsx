
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Command, 
  Clock, 
  Mic, 
  Sparkles, 
  BarChart3, 
  Settings, 
  Rocket, 
  LogOut 
} from "lucide-react";
import { useDashboardStore, AgentStatus } from "@/hooks/use-dashboard-store";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Command Center", href: "/dashboard", icon: Command },
  { label: "Timeline", href: "/dashboard/timeline", icon: Clock },
  { label: "Voice Studio", href: "/dashboard/voice", icon: Mic },
  { label: "Content Factory", href: "/dashboard/factory", icon: Sparkles },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function StatusIndicator({ name, status }: { name: string; status: AgentStatus }) {
  const colors = {
    active: "bg-green-500",
    processing: "bg-amber-500",
    idle: "bg-zinc-500"
  };

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 group">
      <div className={cn(
        "w-2 h-2 rounded-full",
        colors[status],
        status === 'processing' && "animate-pulse"
      )} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
        {name} Agent
      </span>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { skippyStatus, flippoStatus, snooksStatus, activities } = useDashboardStore();

  return (
    <div className="flex h-screen w-full bg-[#231F2A] overflow-hidden text-zinc-100 font-sans">
      {/* Sidebar: 240px, Dark Background */}
      <aside className="w-[240px] h-full bg-[#111116] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <Rocket className="w-6 h-6 text-amber-500" />
            <span className="font-pixel text-[10px] font-bold tracking-tighter text-white">MAXIM</span>
          </Link>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive 
                    ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-black" : "text-zinc-500 group-hover:text-amber-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Agent Status Section */}
        <div className="py-6 border-t border-white/5">
          <div className="px-6 mb-4 text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            Agent Matrix
          </div>
          <StatusIndicator name="Skippy" status={skippyStatus} />
          <StatusIndicator name="Flippo" status={flippoStatus} />
          <StatusIndicator name="Snooks" status={snooksStatus} />
        </div>

        {/* Real-time Activity Feed */}
        <div className="border-t border-white/5 bg-black/20">
          <div className="px-6 py-4 text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            Activity Log
          </div>
          <div className="px-6 pb-6 max-height-[160px] overflow-y-auto space-y-3 custom-scrollbar">
            <AnimatePresence initial={false}>
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-0.5"
                >
                  <p className="text-[10px] text-zinc-300 leading-tight">
                    <span className="font-bold text-amber-500/80">{activity.agent}</span> {activity.action}
                  </p>
                  <span className="text-[8px] text-zinc-600 font-mono">
                    {formatDistanceToNow(activity.timestamp)} ago
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group">
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
