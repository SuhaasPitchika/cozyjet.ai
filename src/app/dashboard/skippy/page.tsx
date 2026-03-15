
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Terminal, Shield, RefreshCcw, Layout, FileText, Github } from "lucide-react";

export default function SkippyWorkspacePage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const integrations = [
    { id: 'notion', name: 'Notion Workspace', icon: FileText, status: 'Connected', lastSync: '2m ago' },
    { id: 'figma', name: 'Figma Projects', icon: Layout, status: 'Connected', lastSync: '15m ago' },
    { id: 'github', name: 'GitHub Repos', icon: Github, status: 'Standby', lastSync: '1h ago' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-headline text-3xl font-bold uppercase tracking-tighter">SKIPPY <span className="text-white/40">Intelligence</span></h1>
          </div>
          <p className="text-foreground/60 font-mono text-[10px] uppercase tracking-widest">Local-First Workspace Monitoring & Training</p>
        </div>
        <Button 
          onClick={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 2000); }}
          className="bg-white text-black font-bold h-12 px-8 rounded-full shadow-2xl hover:scale-105 transition-all"
        >
          <RefreshCcw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          Force Local Sync
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((int) => (
          <Card key={int.id} className="bg-white/5 border-white/10 group hover:border-primary/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-black/40">
                  <int.icon className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest">{int.name}</CardTitle>
              </div>
              <Badge variant="outline" className="text-[8px] border-primary/20 bg-primary/5">{int.status}</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center text-[10px] text-white/40 mb-4">
                <span>Last Sync</span>
                <span>{int.lastSync}</span>
              </div>
              <div className="space-y-2">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%] rounded-full" />
                </div>
                <p className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">Memory-mapped IPC Active</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-black/40 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Inference Engine Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-[10px] text-primary/80 space-y-1">
            <p>[14:22:01] Loading LoRA Adapter: user_v3_balanced.bin</p>
            <p>[14:22:02] Ollama inference started on localhost:11434</p>
            <p>[14:22:05] Stream received: "I just completed a major..."</p>
            <p>[14:22:08] Privacy filter applied: 3 terms redacted</p>
            <p className="animate-pulse">_</p>
          </CardContent>
        </Card>

        <div className="p-8 bg-primary/10 rounded-3xl border border-primary/20 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-10 h-10 text-primary" />
            <h3 className="font-headline text-2xl font-bold uppercase tracking-tighter">Security Posture</h3>
          </div>
          <p className="text-foreground/60 text-xs mb-6 leading-relaxed">
            SKIPPY's <strong>Integration Reader</strong> is currently sandboxed with zero network access. 
            All extracted data is stored in your hardware-backed encrypted vault.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
              <span>Encryption Algorithm</span>
              <span className="text-white">AES-256-GCM</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
              <span>KDF Rounds</span>
              <span className="text-white">Argon2id (3 Iterations)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
