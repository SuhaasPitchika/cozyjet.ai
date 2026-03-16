"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/hooks/use-dashboard-store";
import { Button } from "@/components/ui/button";

export default function SkippyPage() {
  const { skippyActive, setSkippyActive } = useDashboardStore();

  return (
    <div className="p-10 h-full flex flex-col items-center justify-center bg-white">
      <div className="text-center space-y-8 max-w-sm">
        <motion.div
          animate={{
            y: skippyActive ? [0, -8, 0] : 0,
            scale: skippyActive ? 1.05 : 1,
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-48 h-48 mx-auto rounded-3xl flex items-center justify-center transition-all duration-500 shadow-sm",
            skippyActive ? "bg-white border border-gray-100" : "bg-gray-50 border border-transparent"
          )}
        >
          <Bot size={80} className={skippyActive ? "text-black" : "text-gray-200"} />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight">Observer Intelligence</h1>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Skippy monitors your workspace to provide real-time assistance and flow state validation.
          </p>
        </div>

        <button
          onClick={() => setSkippyActive(!skippyActive)}
          className={cn(
            "group relative flex items-center gap-3 px-8 py-3.5 rounded-full text-xs font-bold transition-all border",
            skippyActive 
              ? "bg-black text-white border-black" 
              : "bg-white text-gray-500 border-gray-100 hover:border-black hover:text-black"
          )}
        >
          <Power size={14} className={cn(skippyActive ? "text-green-400" : "text-gray-300 group-hover:text-black")} />
          {skippyActive ? "OBSERVER ACTIVE" : "START OBSERVATION"}
        </button>
      </div>

      <div className="mt-16 text-center">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] leading-relaxed">
          Localized Privacy-First Reasoning <br/>
          Observing IDE · Browser · Comms
        </p>
      </div>
    </div>
  );
}