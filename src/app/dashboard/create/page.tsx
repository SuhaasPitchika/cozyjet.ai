"use client";

import React, { useState } from "react";
import { 
  Plus, Github, FileText, Layout, 
  Trash2, Send, Sparkles, Mic, 
  Loader2, Smartphone, Globe, 
  Twitter, Linkedin, Instagram, 
  Youtube, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SkippyDots } from "@/components/dashboard/skippy-dots";

const MOCK_SEEDS = [
  { id: "1", platform: "github", title: "Implemented JWT Auth with Refresh Tokens", summary: "Added secure authentication layer with token rotation and bcrypt hashing.", time: "2h ago" },
  { id: "2", platform: "notion", title: "Strategy Phase for Q2 Growth", summary: "Drafted a content strategy roadmap for scaling the creator ecosystem.", time: "5h ago" },
  { id: "3", platform: "figma", title: "Redesigned Dashboard UI Components", summary: "New cream-themed layouts and interactive glassmorphism components.", time: "Yesterday" },
];

const PLATFORMS = [
  { id: "twitter", icon: Twitter, label: "X / Twitter", color: "text-sky-400" },
  { id: "linkedin", icon: Linkedin, label: "LinkedIn", color: "text-blue-500" },
  { id: "instagram", icon: Instagram, label: "Instagram", color: "text-pink-500" },
  { id: "youtube", icon: Youtube, label: "YouTube", color: "text-red-500" },
  { id: "reddit", icon: MessageSquare, label: "Reddit", color: "text-orange-500" },
];

export default function CreatePage() {
  const [selectedSeed, setSelectedSeed] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualInput, setManualInput] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="flex-1 flex bg-[#fdfbf6] overflow-hidden h-screen relative">
      <SkippyDots />

      <div className="flex-1 flex relative z-10 p-6 gap-6">
        {/* Left Panel: Skippy Feed */}
        <div className="w-[400px] flex flex-col gap-6 shrink-0">
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 block" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Silently Monitoring</span>
             </div>
             
             <div className="relative group">
                <Textarea 
                  placeholder="Share what's on your mind or what you built..." 
                  className="bg-slate-50 border-slate-100 min-h-[100px] pr-10 hover:border-indigo-200 transition-colors"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                />
                <button className="absolute right-3 bottom-3 p-2 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors">
                   <Mic size={18} />
                </button>
             </div>
             <Button 
               disabled={!manualInput} 
               onClick={handleGenerate}
               className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11"
             >
                Unleash Meta Factory
             </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Skippy Feed • Recent Activity</h3>
                <span className="text-xs font-medium text-indigo-500 cursor-pointer hover:underline underline-offset-4 transition-colors">Refresh</span>
             </div>
             
             {MOCK_SEEDS.map((seed, i) => (
                <motion.div 
                   key={seed.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   onClick={() => setSelectedSeed(seed)}
                   className={cn(
                     "p-5 rounded-3xl border transition-all cursor-pointer group",
                     selectedSeed?.id === seed.id 
                       ? "bg-white border-indigo-400 shadow-2xl shadow-indigo-500/10" 
                       : "bg-white border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/50"
                   )}
                >
                   <div className="flex items-start justify-between mb-3 text-slate-400">
                      <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {seed.platform === "github" ? <Github size={14} /> : seed.platform === "notion" ? <FileText size={14} /> : <Layout size={14} />}
                         </div>
                         <span className="text-[11px] font-bold uppercase tracking-widest">{seed.platform}</span>
                      </div>
                      <span className="text-[10px] font-medium">{seed.time}</span>
                   </div>
                   <h4 className="font-bold text-slate-900 text-sm mb-2 leading-snug group-hover:text-indigo-600 transition-colors">{seed.title}</h4>
                   <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{seed.summary}</p>
                   
                   <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="h-8 rounded-xl bg-white border-slate-100 text-[10px] font-bold px-3">DISMISS</Button>
                      <Button size="sm" className="h-8 rounded-xl bg-indigo-600 border-indigo-500 text-[10px] font-bold px-3 text-white">GENERATE</Button>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>

        {/* Right Panel: Meta Workspace */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
           {!selectedSeed && !isGenerating ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
                   <Sparkles size={32} />
                </div>
                <div className="max-w-xs">
                   <h3 className="text-lg font-bold text-slate-900 mb-2">Build Content with Meta</h3>
                   <p className="text-sm text-slate-400 leading-relaxed">Select a content seed from your Skippy Feed on the left to transform your work into native variations for every platform at once.</p>
                </div>
             </div>
           ) : isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                 <Loader2 size={32} className="animate-spin text-indigo-500" />
                 <div className="max-w-xs">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">CozyJet is generating...</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">Meta is crafting 3 variations per platform tailored to your voice profile and audience.</p>
                 </div>
              </div>
           ) : (
             <div className="flex-1 flex flex-col h-full bg-slate-50">
                {/* Platform Toggles */}
                 <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                    <div className="font-bold text-sm tracking-tight text-slate-900">Platforms to Generate</div>
                    <div className="flex gap-2">
                       {PLATFORMS.map(p => (
                          <div key={p.id} className="w-9 h-9 rounded-xl border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center cursor-pointer transition-all group">
                             <p.icon size={18} className={cn("text-slate-300 group-hover:", p.color)} />
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Variations Grid */}
                 <div className="flex-1 p-6 overflow-y-auto">
                    <Tabs defaultValue="twitter" className="h-full flex flex-col">
                       <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start rounded-none h-auto p-0 mb-6 gap-6">
                          {PLATFORMS.slice(0, 3).map(p => (
                             <TabsTrigger 
                               key={p.id} 
                               value={p.id}
                               className="px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none text-xs font-bold uppercase tracking-widest text-slate-400"
                             >
                               {p.label}
                             </TabsTrigger>
                          ))}
                       </TabsList>

                       <TabsContent value="twitter" className="flex-1 m-0 space-y-6 outline-none">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                             {[
                               { type: "Narrative & Emotional", icon: Globe },
                               { type: "Deeply Technical", icon: Smartphone },
                               { type: "Outcome & Results", icon: Sparkles }
                             ].map((v, i) => (
                                <motion.div 
                                   key={i}
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: i * 0.1 }}
                                   className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-200 transition-all flex flex-col h-full group"
                                >
                                   <div className="flex items-center gap-2 mb-4 text-slate-400">
                                      <v.icon size={14} className="group-hover:text-indigo-500 transition-colors" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{v.type}</span>
                                   </div>
                                   <p className="text-xs text-slate-700 leading-relaxed font-medium mb-6 flex-1">
                                      Generating secure JWT auth with refresh tokens today on @CozyJet. Refresh tokens are often overlooked but critical for user UX—zero log-outs while keeping short access TTLs.
                                      <br/><br/>
                                      Security + UX = Happy Users. 🔐✨
                                   </p>
                                   <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                      <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Variation {i+1}</div>
                                      <div className="flex gap-2">
                                         <Button variant="ghost" size="icon" className="w-8 h-8 hover:text-indigo-500 text-slate-400"><Send size={14}/></Button>
                                         <Button variant="ghost" size="icon" className="w-8 h-8 hover:text-indigo-500 text-slate-400"><Trash2 size={14}/></Button>
                                      </div>
                                   </div>
                                </motion.div>
                             ))}
                          </div>
                       </TabsContent>
                    </Tabs>
                 </div>

                 {/* Footer Actions */}
                 <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <span className="text-xs font-medium text-slate-400">Selected Seed: <strong>{selectedSeed?.title}</strong></span>
                    </div>
                    <div className="flex gap-3">
                       <Button variant="outline" className="border-slate-100 h-11 px-8 rounded-2xl text-xs font-bold font-sans">RE-GENERATE ALL</Button>
                       <Button className="bg-indigo-600 hover:bg-indigo-500 text-white h-11 px-8 rounded-2xl text-xs font-bold font-sans shadow-xl shadow-indigo-500/20">PUBLISH TO CALENDAR</Button>
                    </div>
                 </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

// Support components
function Textarea({ className, value, onChange, placeholder, ...props }: any) {
   return (
      <textarea 
        className={cn(
          "w-full p-4 text-sm font-medium text-slate-900 rounded-2xl outline-none placeholder:text-slate-300",
          className
        )}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
   );
}
