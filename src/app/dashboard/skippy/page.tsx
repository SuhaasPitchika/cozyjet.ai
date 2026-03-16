"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

export default function SkippyPage() {
  const { skippyActive, setSkippyActive } = useDashboardStore();

  return (
    <div className="p-10 min-h-screen relative flex flex-col items-center justify-center font-pixel">
      {/* Character Section */}
      <div className="text-center space-y-12">
        <motion.div
          animate={{
            y: skippyActive ? [0, -15, 0] : 0,
            scale: skippyActive ? 1.1 : 1,
            rotate: skippyActive ? [0, 2, -2, 0] : 0
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-64 h-64 mx-auto rounded-[4rem] flex flex-col items-center justify-center transition-all duration-700 shadow-2xl relative",
            skippyActive ? "bg-white border-4 border-black" : "bg-gray-100 border-2 border-dashed border-black/10"
          )}
        >
          <Bot size={120} className={skippyActive ? "text-black" : "text-black/10"} />
          {skippyActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -top-4 -right-4 bg-amber-500 text-black px-4 py-2 rounded-2xl border-2 border-black shadow-lg flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[8px] font-bold">OBSERVING</span>
            </motion.div>
          )}
        </motion.div>

        <div className="space-y-6">
          <h1 className="text-xl font-bold uppercase tracking-tighter">Skippy <span className="text-black/40">Intel</span></h1>
          <p className="text-black/40 text-[8px] font-bold uppercase tracking-[0.3em] max-w-md mx-auto leading-loose">
            Autonomous screen observation engine. <br/>Seeing and understanding your workflow in real-time.
          </p>
        </div>

        {/* Neumorphic Toggle */}
        <button
          onClick={() => setSkippyActive(!skippyActive)}
          className={cn(
            "px-16 py-8 rounded-full font-bold text-[8px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl border-4",
            skippyActive 
              ? "bg-black text-white border-white scale-105" 
              : "bg-white text-black border-black/5 hover:border-black"
          )}
        >
          {skippyActive ? "Observing: ON" : "Initialize Skippy"}
        </button>
      </div>

      <div className="mt-20 max-w-2xl text-center">
        <p className="text-[6px] text-black/20 uppercase tracking-[0.2em] leading-relaxed">
          Skippy uses localized AI context to verify your progress. <br/>
          If you get stuck, a comic intervention will trigger automatically <br/>
          regardless of which department you are working in.
        </p>
      </div>
    </div>
  );
}
