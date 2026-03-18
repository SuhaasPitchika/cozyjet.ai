"use client";

import React from "react";
import { motion } from "framer-motion";
import { Power, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";
import dynamic from "next/dynamic";

// Dynamically import 3D component with SSR disabled
const Skippy3DCharacter = dynamic(
  () => import("@/components/3d/SkippyCharacter").then((mod) => mod.Skippy3DCharacter),
  { 
    ssr: false,
    loading: () => (
      <div className="w-64 h-64 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#8c6b4f]/20 border-t-[#8c6b4f] rounded-full animate-spin" />
      </div>
    )
  }
);

// Fallback component for when 3D fails
function SkippyFallback({ isActive }: { isActive: boolean }) {
  return (
    <div className={cn(
      "w-48 h-48 rounded-full flex items-center justify-center",
      isActive 
        ? "bg-gradient-to-br from-[#8c6b4f] to-[#6b523c] shadow-[0_0_30px_rgba(245,158,11,0.4)]" 
        : "bg-gradient-to-br from-gray-200 to-gray-300"
    )}>
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill={isActive ? "#f59e0b" : "#9ca3af"} />
        <circle cx="8.5" cy="10" r="2" fill="white" />
        <circle cx="15.5" cy="10" r="2" fill="white" />
        <circle cx="8.5" cy="10" r="1" fill={isActive ? "#1e293b" : "#64748b"} />
        <circle cx="15.5" cy="10" r="1" fill={isActive ? "#1e293b" : "#64748b"} />
      </svg>
    </div>
  );
}

export default function SkippyPage() {
  const { skippyActive, setSkippyActive } = useDashboardStore();

  return (
    <div className="p-10 h-full flex flex-col items-center justify-center bg-[#fdfaf5]">
      <div className="text-center space-y-12 max-w-xl">
        
        {/* 3D Character Container */}
        <motion.div
          animate={{
            y: skippyActive ? [0, -10, 0] : 0,
            scale: skippyActive ? 1.02 : 1,
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-64 h-64 mx-auto rounded-[3.5rem] flex items-center justify-center transition-all duration-700 overflow-hidden",
            skippyActive 
              ? "neumorphic-button-active border-2 border-white/50" 
              : "neumorphic-flat border-transparent"
          )}
        >
          <Skippy3DCharacter isActive={skippyActive} size="medium" />
        </motion.div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f5e6d3] text-[#8c6b4f] text-[9px] font-bold uppercase tracking-[0.2em] mb-4">
            <ShieldCheck size={12} />
            Secure Studio Observer
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#8c6b4f]">
            Observer <span className="text-[#6b523c]/40 font-light italic">Intelligence</span>
          </h1>
          <p className="text-xs text-[#8c6b4f]/60 leading-relaxed font-medium max-w-sm mx-auto">
            Skippy activates your workspace perception. High-fidelity observation 
            of IDE, Browser, and Comms to protect your flow state and provide 
            contextual reasoning.
          </p>
        </div>

        {/* 3D Neumorphic Start Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setSkippyActive(!skippyActive)}
            className={cn(
              "group relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95",
              skippyActive 
                ? "neumorphic-inset" 
                : "neumorphic-flat hover:scale-105"
            )}
          >
            <div className={cn(
              "p-4 rounded-full transition-all duration-300",
              skippyActive 
                ? "bg-[#8c6b4f] shadow-inner" 
                : "bg-white shadow-sm group-hover:bg-[#f5e6d3]"
            )}>
              <Power 
                size={24} 
                className={cn(
                  "transition-colors",
                  skippyActive ? "text-white" : "text-[#d9d6d1] group-hover:text-[#8c6b4f]"
                )} 
              />
            </div>
          </button>
        </div>
        
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8c6b4f]/40">
          {skippyActive ? "Status: Observing Workspace" : "Status: Dormant"}
        </div>
      </div>

      <div className="mt-20 text-center max-w-md">
        <p className="text-[9px] text-[#8c6b4f]/30 font-bold uppercase tracking-[0.2em] leading-loose">
          Privacy-First Architecture <br/>
          Encrypted Metadata Extraction · Non-Persistent Visual Buffering
        </p>
      </div>
    </div>
  );
}