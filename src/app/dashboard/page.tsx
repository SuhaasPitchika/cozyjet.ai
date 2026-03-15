
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Eye, Zap, Clock, Terminal } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold mb-2">Command <span className="text-primary">Center</span></h1>
          <p className="text-foreground/60 font-mono text-xs uppercase tracking-widest">Unhackable Local-First Agent Infrastructure</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-4 py-2 border-green-500/20 bg-green-500/5 text-green-500 font-mono">
            <ShieldCheck className="w-3 h-3 mr-2" />
            ZERO TRUST ACTIVE
          </Badge>
          <Badge variant="outline" className="px-4 py-2 border-primary/20 bg-primary/5 text-primary font-mono">
            <Terminal className="w-3 h-3 mr-2" />
            SKIPPY SYNCED
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">Integrations</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 ACTIVE</div>
            <p className="text-[10px] text-foreground/40 mt-1">Notion, Figma, GitHub</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">Content Drafts</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 READY</div>
            <p className="text-[10px] text-foreground/40 mt-1">Pending SNOOKS Scan</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">Optimal Windows</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9:15 AM</div>
            <p className="text-[10px] text-foreground/40 mt-1">FLIPPO Recommendation</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">Security Hash</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono break-all text-primary">0x8F2A...E91C</div>
            <p className="text-[10px] text-foreground/40 mt-1">Audit Trail Verified</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
         <div className="space-y-4">
            <h3 className="font-headline text-xl font-bold uppercase tracking-tighter">Recent Workflow Events</h3>
            <div className="space-y-3 font-mono">
               {[
                 { label: "SKIPPY detected Notion milestone: 'Brand Deck'", time: "2m ago", type: "system" },
                 { label: "SNOOKS blocked PII in LinkedIn Draft #4", time: "15m ago", type: "alert" },
                 { label: "FLIPPO synced performance embeddings", time: "1h ago", type: "sync" },
                 { label: "Passkey authentication verified", time: "4h ago", type: "auth" }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center"
                 >
                   <span className="text-[10px] font-medium text-white/80">{item.label}</span>
                   <span className="text-[10px] text-white/20">{item.time}</span>
                 </motion.div>
               ))}
            </div>
         </div>
         
         <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col justify-center">
            <h3 className="font-headline text-2xl font-bold mb-4">Security Overview</h3>
            <p className="text-foreground/60 text-xs mb-6 leading-relaxed">
              Your system is currently running in <strong>Zero-Trust Mode</strong>. 
              All workspace data is monitored locally by SKIPPY via encrypted IPC. 
              No raw data has left this device in the last 24 hours.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <p className="text-[8px] uppercase font-bold text-white/30 mb-1">Encrypted Store</p>
                <p className="text-xs font-mono text-green-500">LOCKED</p>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <p className="text-[8px] uppercase font-bold text-white/30 mb-1">Passkey Status</p>
                <p className="text-xs font-mono text-primary">VERIFIED</p>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
