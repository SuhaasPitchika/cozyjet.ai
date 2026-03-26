
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const AGENTS = [
  {
    name: "Skippy",
    role: "Screen Intelligence",
    color: "#C9B8FF",
    desc: "Autonomous screen analysis and contextual assistance for designers & devs.",
    powers: ["OCR extraction", "Activity tracking", "Anti-stuck logic"]
  },
  {
    name: "Flippo",
    role: "Productivity Brain",
    color: "#6297FF",
    desc: "Data-driven insights and deep work scoring based on real behavior.",
    powers: ["Timeline generation", "Flow state analysis", "Focus matrix"]
  },
  {
    name: "Snooks",
    role: "Marketing Head",
    color: "#A36BEE",
    desc: "Expert content strategy and platform-native marketing generation.",
    powers: ["Viral hook drafting", "Multi-platform sync", "SEO optimization"]
  }
];

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl h-full flex flex-col"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div 
        className="w-full aspect-square rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: `${agent.color}20` }}
      >
        <div 
          className="w-1/2 h-2/3 rounded-lg flex flex-col items-center justify-center shadow-2xl animate-float"
          style={{ backgroundColor: agent.color }}
        >
          {agent.name === "Skippy" && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
              <div className="w-10 h-1 bg-black/20 rounded-full" />
            </div>
          )}
          {agent.name === "Flippo" && (
             <div className="grid grid-cols-2 gap-1 p-2">
                {[1,2,3,4].map(i => <div key={i} className="w-4 h-4 bg-white/40 rounded-sm" />)}
             </div>
          )}
          {agent.name === "Snooks" && (
             <div className="w-12 h-12 border-4 border-white rounded-full border-t-transparent animate-spin" />
          )}
        </div>
      </div>

      <h3 className="font-headline text-3xl font-bold mb-1">{agent.name}</h3>
      <p className="text-primary font-medium mb-4">{agent.role}</p>
      <p className="text-foreground/60 text-sm mb-6 flex-grow">{agent.desc}</p>
      
      <div className="flex flex-wrap gap-2">
        {agent.powers.map(p => (
          <Badge key={p} variant="secondary" className="bg-white/10 text-xs py-0.5">
            {p}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

export function AgentsShowcase() {
  return (
    <section id="agents" className="py-32 px-6 bg-black relative overflow-hidden">
      {/* Background Particles Placeholder */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="font-headline text-5xl md:text-7xl font-bold mb-6">Meet Your New <br /><span className="text-primary">Autonomous Team</span></h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">Three specialized AI entities working in perfect harmony to handle everything from your focus sessions to your viral marketing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AGENTS.map(agent => (
            <AgentCard key={agent.name} agent={agent} />
          ))}
        </div>
      </div>
    </section>
  );
}
