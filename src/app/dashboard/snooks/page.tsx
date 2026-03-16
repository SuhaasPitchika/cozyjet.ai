"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, User, Bot, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_MESSAGES = [
  { id: 1, role: 'bot', content: "I'VE ANALYZED YOUR RECENT FIGMA WORK ON 'PROJECT PHOENIX'. SHOULD I GENERATE A LINKEDIN THREAD OR AN INDUSTRY BLOG POST?", type: 'text' },
];

export default function SnooksPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), role: 'user', content: input.toUpperCase(), type: 'text' };
    setMessages([...messages, newMsg]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        content: "DRAFTING LINKEDIN POST... CONTEXT: USER STYLE 'AUTHORITATIVE', PLATFORM 'LINKEDIN'. \n\n'ZERO-TRUST IS NOT A FEATURE, IT'S A FOUNDATION...'",
        type: 'content'
      }]);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col font-pixel">
      <div className="p-12 border-b border-black/5 bg-white/40 backdrop-blur-sm">
        <h1 className="text-2xl font-bold uppercase tracking-tighter">Snooks <span className="text-black/40">Market</span></h1>
        <p className="text-black/40 text-[8px] font-bold uppercase tracking-[0.3em] mt-2">High-Fidelity Content Memory Engine</p>
      </div>

      <div className="flex-1 p-12 overflow-y-auto space-y-10 custom-scrollbar bg-white/10">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-6 max-w-4xl",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-xl border-2",
              msg.role === 'user' ? "bg-black border-white" : "bg-white border-black"
            )}>
              {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} />}
            </div>
            
            <div className={cn(
              "p-8 rounded-[2.5rem] text-[10px] leading-loose shadow-2xl border-2",
              msg.role === 'user' 
                ? "bg-black text-white border-white rounded-tr-none" 
                : "bg-white text-black border-black rounded-tl-none"
            )}>
              {msg.type === 'content' && (
                <div className="mb-6 p-3 bg-gray-100 rounded-2xl flex items-center justify-between border-2 border-black/10">
                  <span className="text-[6px] font-bold uppercase tracking-widest text-black/40">Generated Draft</span>
                  <Edit3 size={14} className="text-black/40" />
                </div>
              )}
              <p className="uppercase tracking-tight">
                {msg.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-12 bg-white/60 border-t border-black/5 backdrop-blur-md">
        <div className="max-w-5xl mx-auto relative group">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell Snooks what to write..."
            className="h-20 pl-8 pr-20 rounded-[2.5rem] bg-white border-4 border-black shadow-[0_20px_50px_rgba(0,0,0,0.1)] focus:scale-[1.01] transition-all text-xs"
          />
          <button 
            onClick={handleSend}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black text-white rounded-3xl hover:scale-110 active:scale-95 transition-all shadow-xl"
          >
            <Send size={24} />
          </button>
        </div>
        <p className="mt-6 text-center text-[6px] font-bold text-black/20 uppercase tracking-[0.4em]">
          Using latest 'Flippo' session data for context.
        </p>
      </div>
    </div>
  );
}
