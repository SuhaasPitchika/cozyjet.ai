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
    <div className="p-10 min-h-screen relative flex flex-col items-center justify-center font-pixel">
      {/* Character Section */}
      <div className="text-center space-y-12">
        <motion.div
          animate={{
            y: isActive ? [0, -15, 0] : 0,
            scale: isActive ? 1.15 : 1,
            rotate: isActive ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-56 h-56 mx-auto rounded-[3rem] flex items-center justify-center transition-all duration-700 shadow-2xl",
            isActive ? "bg-white border-4 border-black" : "bg-gray-100 border-2 border-dashed border-black/10"
          )}
        >
          <Bot size={100} className={isActive ? "text-black" : "text-black/10"} />
        </motion.div>

        <div className="space-y-6">
          <h1 className="text-xl font-bold uppercase tracking-tighter">Skippy <span className="text-black/40">Intel</span></h1>
          <p className="text-black/40 text-[8px] font-bold uppercase tracking-[0.3em] max-w-md mx-auto leading-loose">
            Autonomous screen observation engine. <br/>Seeing and understanding your workflow in real-time.
          </p>
        </div>

        {/* Neumorphic Toggle */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "px-16 py-6 rounded-full font-bold text-[8px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl",
            isActive 
              ? "bg-black text-white scale-105" 
              : "bg-white text-black border-2 border-black/5 hover:border-black"
          )}
        >
          {isActive ? "Observing: ON" : "Initialize Skippy"}
        </button>
      </div>

      {/* Comic-style Popup */}
      <AnimatePresence>
        {isStuck && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-12 right-12 z-[60] flex flex-col items-end gap-6"
          >
            <div className="bg-black text-white p-8 rounded-[2rem] rounded-br-none shadow-[0_30px_60px_rgba(0,0,0,0.3)] relative border-2 border-white/20 max-w-sm">
              <div className="absolute -bottom-3 right-0 w-6 h-6 bg-black rotate-45" />
              <p className="text-[10px] leading-relaxed uppercase tracking-tighter">
                YO! YOU GOOD? 👀<br/>
                LOOKS LIKE YOU'RE STUCK ON THAT COMPONENT.<br/>
                WANNA TALK IT OUT?
              </p>
            </div>
            <Button 
              onClick={() => setShowChat(true)}
              className="bg-white text-black hover:bg-gray-100 rounded-3xl shadow-2xl px-10 h-14 font-bold text-[8px] uppercase border-2 border-black"
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
            initial={{ x: 500 }}
            animate={{ x: 0 }}
            exit={{ x: 500 }}
            className="fixed inset-y-6 right-6 w-[400px] glass rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.2)] z-[70] flex flex-col overflow-hidden border border-white/60"
          >
            <div className="p-8 border-b border-black/5 flex items-center justify-between bg-white/40">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Skippy Guide</span>
              </div>
              <button onClick={() => setShowChat(false)} className="text-black/40 hover:text-black text-xl">×</button>
            </div>
            
            <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-white/20">
              <div className="bg-black text-white p-6 rounded-3xl rounded-tl-none text-[8px] leading-loose uppercase tracking-tight shadow-xl">
                I see you're trying to connect the Firebase listener. <br/><br/>
                Tap the "Configure Sync" button in your dashboard first!
              </div>
            </div>

            <div className="p-8 bg-white/60 border-t border-black/5">
              <div className="relative">
                <Input className="pr-16 h-16 rounded-[2rem] bg-white border-2 border-black/10 focus:border-black text-[10px]" placeholder="Ask Skippy..." />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black text-white rounded-2xl">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
