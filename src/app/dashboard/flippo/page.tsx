
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Clock, TrendingUp, Sparkles, Calendar, Share2 } from "lucide-react";

export default function FlippoDistributionPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="font-headline text-3xl font-bold uppercase tracking-tighter">FLIPPO <span className="text-white/40">Distribution</span></h1>
          </div>
          <p className="text-foreground/60 font-mono text-[10px] uppercase tracking-widest">Privacy-Preserving Network Intelligence</p>
        </div>
        <Button className="bg-primary text-white font-bold h-12 px-8 rounded-full shadow-2xl hover:scale-105 transition-all">
          Generate MAXIM Wrapped
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Optimal Posting Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">9:15 AM</div>
            <p className="text-[10px] text-green-500 mt-1 uppercase font-bold">+24% Engagement expected</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Viral Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.8x</div>
            <p className="text-[10px] text-foreground/40 mt-1 uppercase font-bold">Trending in #vfx & #motion</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Share2 className="w-3 h-3" />
              A/B Test Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">V2 WINNING</div>
            <p className="text-[10px] text-primary mt-1 uppercase font-bold">Storytelling &gt; Listicle</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="font-headline text-xl font-bold uppercase tracking-tighter">Distribution Queue</h3>
          <div className="space-y-4">
            {[
              { platform: 'LinkedIn', title: 'VFX Breakdown: Phoenix Project', time: 'Tomorrow, 9:15 AM', status: 'Scheduled' },
              { platform: 'X (Twitter)', title: '3 Tips for Motion Designers', time: 'Friday, 2:00 PM', status: 'Draft' },
              { platform: 'Instagram', title: 'Behind the Scenes: Setup', time: 'Saturday, 10:00 AM', status: 'Scheduled' }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:border-primary/20 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[8px] uppercase">{item.platform}</Badge>
                    <span className="text-[10px] font-bold text-white/80">{item.title}</span>
                  </div>
                  <p className="text-[10px] text-white/20 font-mono">{item.time}</p>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-xs">Manage</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-32 h-32 text-primary" />
          </div>
          <h3 className="font-headline text-2xl font-bold mb-4 uppercase tracking-tighter">Network Intelligence</h3>
          <p className="text-foreground/60 text-xs mb-8 leading-relaxed max-w-md">
            FLIPPO aggregates anonymized performance data across 1,200+ users to refine your distribution strategy. 
            <strong> Your content text is never shared.</strong>
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Monthly Voice Trajectory</p>
                <p className="text-[10px] text-white/40">Your brand is trending towards 'Authoritative Storyteller'</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
