"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, User, Bot, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_MESSAGES = [
  { id: 1, role: 'bot', content: "I've analyzed your recent Figma work on 'Project Phoenix'. Should I generate a LinkedIn thread or an industry blog post?", type: 'text' },
];

export default function SnooksPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), role: 'user', content: input, type: 'text' };
    setMessages([...messages, newMsg]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        content: "Drafting LinkedIn Post... Context: User style 'Authoritative', Platform 'LinkedIn'. Check this out: \n\n'Zero-trust is not a feature, it's a foundation...'",
        type: 'content'
      }]);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-10 border-b border-black/5">
        <h1 className="text-3xl font-bold uppercase tracking-tighter">Snooks <span className="text-black/40">Marketing Chat</span></h1>
        <p className="text-black/40 text-[10px] font-bold uppercase tracking-[0.2em]">High-Fidelity Content Memory Engine</p>
      </div>

      <div className="flex-1 p-10 overflow-y-auto space-y-8 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4 max-w-3xl",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
              msg.role === 'user' ? "bg-black" : "bg-white border border-black/5"
            )}>
              {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} />}
            </div>
            
            <div className={cn(
              "p-6 rounded-3xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-black text-white rounded-tr-none" 
                : "bg-white border border-black/5 rounded-tl-none shadow-sm"
            )}>
              {msg.type === 'content' && (
                <div className="mb-4 p-2 bg-gray-50 rounded-xl flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-black/40">Generated Draft</span>
                  <Edit3 size={12} className="text-black/40" />
                </div>
              )}
              <p className={cn(msg.type === 'content' ? "font-serif italic text-base" : "font-pixel text-[10px]")}>
                {msg.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-10 bg-white/50 border-t border-black/5">
        <div className="max-w-4xl mx-auto relative group">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell Snooks what to write..."
            className="h-16 pl-6 pr-16 rounded-3xl bg-white border-black/5 shadow-xl group-hover:shadow-2xl transition-all"
          />
          <button 
            onClick={handleSend}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-black text-white rounded-2xl hover:scale-105 transition-all shadow-lg"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="mt-4 text-center text-[8px] font-bold text-black/20 uppercase tracking-widest">
          Snooks is using your latest 'Flippo' session data for context.
        </p>
      </div>
    </div>
  );
}