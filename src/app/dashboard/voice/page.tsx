
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Upload, Trash2, ThumbsUp, ThumbsDown, Sliders } from "lucide-react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

export default function VoiceStudioPage() {
  const { contentQueue } = useDashboardStore();

  const waveform = useMemo(() => {
    let d = "M 0 50";
    for (let i = 0; i < 100; i++) {
      const y = 50 + Math.sin(i * 0.2) * 20 * Math.random();
      d += ` L ${i * 10} ${y}`;
    }
    return d;
  }, []);

  const traits = ["Analytical", "Technical", "Conversational", "Professional", "Moderate Complexity"];

  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto">
      <div>
        <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-tighter text-white">Voice <span className="text-amber-500">Studio</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">Personalized LLM Fine-Tuning Interface</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Waveform & Profile */}
        <section className="space-y-6">
          <Card className="bg-zinc-900/50 border-white/5 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Signature Waveform</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="h-24 w-full bg-black/40 relative">
                <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                  <motion.path
                    d={waveform}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                  />
                </svg>
              </div>
              <div className="p-6 flex flex-wrap gap-2">
                {traits.map(t => (
                  <Badge key={t} variant="secondary" className="bg-white/5 text-zinc-400 border-none px-3 py-1 text-[10px] uppercase">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Voice Evolution</CardTitle>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center text-zinc-600 italic text-xs">
              Trend data accumulating...
            </CardContent>
          </Card>
        </section>

        {/* Middle: Training Manager */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Training Samples</h3>
            <Button size="sm" className="bg-amber-500 text-black font-bold h-8 text-[10px]">RETRAIN MODEL</Button>
          </div>
          
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Card key={i} className="bg-zinc-900/50 border-white/5 group">
                <CardContent className="p-4">
                  <p className="text-xs text-zinc-400 line-clamp-3 mb-2 italic">
                    "This architecture implements defense-in-depth where compromising one component does not cascade into system-wide breach..."
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-zinc-600 uppercase">124 words · Technical</span>
                    <button className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-10 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center text-center group hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer">
            <Upload className="w-8 h-8 text-zinc-600 mb-4 group-hover:text-amber-500" />
            <p className="text-xs text-zinc-500 font-bold uppercase group-hover:text-zinc-300">Drop writing samples here</p>
            <p className="text-[10px] text-zinc-700 mt-1 uppercase">.txt, .md, .docx supported</p>
          </div>
        </section>

        {/* Right: Rating System */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Generation Rating</h3>
          {contentQueue.slice(0, 1).map((item: { id: string; title?: string; body?: string }) => (
            <Card key={item.id} className="bg-zinc-900/50 border-white/5">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-500 uppercase">{item.title}</h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed italic line-clamp-4">"{item.body}"</p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 border-white/10 hover:bg-green-500/10 hover:text-green-500"><ThumbsUp className="w-4 h-4" /></Button>
                    <Button variant="outline" className="flex-1 border-white/10 hover:bg-red-500/10 hover:text-red-500"><ThumbsDown className="w-4 h-4" /></Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                      <span>Authenticity</span>
                      <span className="text-amber-500">8/10</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[80%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
