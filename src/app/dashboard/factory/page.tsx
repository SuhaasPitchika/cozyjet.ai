
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Linkedin, 
  Twitter, 
  Instagram, 
  Youtube, 
  Search,
  Sparkles,
  ChevronRight,
  Send,
  FileText,
  User,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "PLATFORM" },
  { id: 2, label: "CONTENT TYPE" },
  { id: 3, label: "CONTEXT" }
];

const PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, desc: 'Professional posts and case studies' },
  { id: 'x', name: 'X (Twitter)', icon: Twitter, desc: 'Threads and viral hooks' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, desc: 'Carousel scripts and captions' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, desc: 'Video scripts and outlines' }
];

export default function ContentFactoryPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [context, setContext] = useState("");

  return (
    <div className="p-10 max-w-5xl mx-auto min-h-screen">
      {/* Progress Header */}
      <div className="mb-16">
        <div className="flex items-center justify-center gap-12">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-3 relative">
              <div className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300",
                currentStep === step.id ? "border-amber-500 text-amber-500 bg-amber-500/10 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : 
                currentStep > step.id ? "border-green-500 bg-green-500 text-black" : "border-zinc-800 text-zinc-600"
              )}>
                {currentStep > step.id ? <ChevronRight className="w-5 h-5" /> : step.id}
              </div>
              <span className={cn(
                "text-[8px] font-bold uppercase tracking-[0.2em]",
                currentStep === step.id ? "text-amber-500" : "text-zinc-600"
              )}>{step.label}</span>
              {step.id < 3 && (
                <div className="absolute top-5 left-16 w-24 h-px bg-zinc-800" />
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {PLATFORMS.map((p) => (
              <div
                key={p.id}
                onClick={() => { setSelectedPlatform(p.id); setCurrentStep(2); }}
                className="p-8 bg-zinc-900/50 border border-white/5 rounded-2xl cursor-pointer group hover:border-amber-500 transition-all hover:bg-zinc-900 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-6 mb-4">
                  <div className="p-4 rounded-xl bg-black/40 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                    <p.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{p.name}</h3>
                    <p className="text-xs text-zinc-500">{p.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <h2 className="text-2xl font-bold text-center uppercase tracking-tight">Select <span className="text-amber-500">Asset Template</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Case Study', 'Thought Leadership', 'Micro-Tutorial'].map((t) => (
                <div
                  key={t}
                  onClick={() => setCurrentStep(3)}
                  className="p-6 bg-zinc-900/50 border border-white/5 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-zinc-900 transition-all text-center"
                >
                  <FileText className="w-6 h-6 mx-auto mb-4 text-zinc-600" />
                  <h4 className="text-sm font-bold text-white">{t}</h4>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => setCurrentStep(1)} className="text-zinc-500 text-xs uppercase font-bold">Back to Platforms</Button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Brief Description</Label>
              <Textarea 
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="I just shipped a new feature that reduces page load time by 60%..."
                className="bg-zinc-900/50 border-white/10 h-40 focus:ring-amber-500/20 text-lg leading-relaxed placeholder:text-zinc-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <User className="w-3 h-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Audience</span>
                </div>
                <Badge variant="outline" className="w-full justify-center bg-white/5 border-white/10 text-zinc-400 py-2">Technical Founders</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <List className="w-3 h-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Tone</span>
                </div>
                <Badge variant="outline" className="w-full justify-center bg-white/5 border-white/10 text-zinc-400 py-2">Authoritative</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Inference</span>
                </div>
                <Badge variant="outline" className="w-full justify-center bg-white/5 border-white/10 text-zinc-400 py-2">Balanced-V3</Badge>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 pt-10">
              <Button 
                disabled={!context}
                className="bg-amber-500 text-black font-bold h-16 px-12 rounded-full text-lg shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:scale-105 transition-all group disabled:opacity-50"
              >
                INITIALIZE GENERATION <Send className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" onClick={() => setCurrentStep(2)} className="text-zinc-500 text-xs uppercase font-bold">Change Template</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
