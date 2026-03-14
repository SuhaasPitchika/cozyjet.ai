
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Rocket, MessageSquare, Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold mb-2">Welcome back, <span className="text-primary">Creator</span></h1>
          <p className="text-foreground/60">Your autonomous team is ready and waiting for instructions.</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 border-primary/20 bg-primary/5 text-primary">
          <Zap className="w-3 h-3 mr-2 fill-primary" />
          3 Agents Online
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deep Work Score</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">84%</div>
            <p className="text-xs text-foreground/40 mt-1">+12% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Generated</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">12</div>
            <p className="text-xs text-foreground/40 mt-1">Ready for review</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Rocket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">ACTIVE</div>
            <p className="text-xs text-foreground/40 mt-1">Skippy monitoring screen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
         <div className="space-y-4">
            <h3 className="font-headline text-xl font-bold">Recent Activity</h3>
            <div className="space-y-3">
               {[
                 { label: "Skippy detected stuck session", time: "2m ago", type: "alert" },
                 { label: "Flippo generated productivity report", time: "15m ago", type: "info" },
                 { label: "Snooks completed 5 platform posts", time: "1h ago", type: "success" }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center"
                 >
                   <span className="text-sm font-medium">{item.label}</span>
                   <span className="text-xs text-white/30">{item.time}</span>
                 </motion.div>
               ))}
            </div>
         </div>
         
         <div className="p-8 bg-primary/10 rounded-3xl border border-primary/20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-headline text-2xl font-bold mb-2">Upgrade to Jet Pro</h3>
            <p className="text-foreground/60 text-sm mb-6">Unlock multi-user agents and advanced vector memory storage.</p>
            <button className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary/80 transition-all">
              Elevate Now
            </button>
         </div>
      </div>
    </div>
  );
}
