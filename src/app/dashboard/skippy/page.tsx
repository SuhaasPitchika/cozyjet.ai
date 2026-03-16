"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Power, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

export default function SkippyPage() {
  const { skippyActive, setSkippyActive } = useDashboardStore();

  return (
    <div className="p-10 h-full flex flex-col items-center justify-center bg-[#fdfaf5]">
      <div className="text-center space-y-12 max-w-xl">
        
        {/* Neumorphic Character Container */}
        <motion.div
          animate={{
            y: skippyActive ? [0, -10, 0] : 0,
            scale: skippyActive ? 1.02 : 1,
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-64 h-64 mx-auto rounded-[3.5rem] flex items-center justify-center transition-all duration-700",
            skippyActive 
              ? "neumorphic-button-active border-2 border-white/50" 
              : "neumorphic-flat border-transparent"
          )}
        >
          <div className="relative">
            <Bot 
              size={100} 
              className={cn(
                "transition-all duration-700",
                skippyActive ? "text-[#8c6b4f]" : "text-[#d9d6d1]"
              )} 
            />
            {skippyActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-4 -right-4 p-3 bg-amber-400 rounded-full shadow-lg border-2 border-white"
              >
                <Zap size={20} className="text-white fill-white" />
              </motion.div>
            )}
          </div>
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