"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Bot, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SkippyPage() {
  const [isActive, setIsActive] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Simulated "Stuck" detection logic
  React.useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setIsStuck(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setIsStuck(false);
      setShowChat(false);
    }
  }, [isActive]);

  return (
    <div className="p-10 min-h-screen relative flex flex-col items-center justify-center">
      {/* Character Section */}
      <div className="text-center space-y-8">
        <motion.div
          animate={{
            y: isActive ? [0, -10, 0] : 0,
            scale: isActive ? 1.1 : 1
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-48 h-48 mx-auto rounded-3xl flex items-center justify-center transition-all duration-500",
            isActive ? "neumorphic-out bg-white" : "neumorphic-in bg-gray-50"
          )}
        >
          <Bot size={80} className={isActive ? "text-black" : "text-black/10"} />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Skippy <span className="text-black/40">Intelligence</span></h1>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-[0.2em] max-w-sm mx-auto">
            Autonomous screen observation engine. Understanding your workflow in real-time.
          </p>
        </div>

        {/* Neumorphic Toggle */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "px-12 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all duration-300",
            isActive ? "neumorphic-in text-black" : "neumorphic-out text-black/40 bg-white"
          )}
        >
          {isActive ? "Observing Engine: ON" : "Initialize Agent"}
        </button>
      </div>

      {/* Comic-style Popup */}
      <AnimatePresence>
        {isStuck && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-10 right-10 z-[60] flex flex-col items-end gap-4"
          >
            <div className="bg-black text-white p-6 rounded-3xl rounded-br-none shadow-2xl relative">
              <div className="absolute -bottom-2 right-0 w-4 h-4 bg-black rotate-45" />
              <p className="font-pixel text-[10px] leading-relaxed">
                YO! YOU GOOD? LOOKS LIKE YOU'RE STUCK ON THAT COMPONENT. 👀<br/>
                WANNA TALK IT OUT?
              </p>
            </div>
            <Button 
              onClick={() => setShowChat(true)}
              className="bg-white text-black hover:bg-gray-100 rounded-2xl shadow-xl px-8 font-bold text-[10px] uppercase border-black/5"
            >
              Start Debug Session
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Chat Interface */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed inset-y-4 right-4 w-96 glass rounded-[2.5rem] shadow-2xl z-[70] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Skippy Guide</span>
              </div>
              <button onClick={() => setShowChat(false)} className="text-black/40 hover:text-black">×</button>
            </div>
            
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <div className="bg-black text-white p-4 rounded-2xl rounded-tl-none text-[10px] leading-relaxed">
                I see you're trying to connect the Firebase listener. Tap the "Configure Sync" button in your dashboard first!
              </div>
            </div>

            <div className="p-6 bg-white/50 border-t border-black/5">
              <div className="relative">
                <Input className="pr-12 h-14 rounded-2xl bg-white border-black/5 focus:ring-black/5" placeholder="Ask Skippy..." />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-xl">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}