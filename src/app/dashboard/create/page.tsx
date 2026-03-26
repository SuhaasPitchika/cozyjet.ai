"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Book, Camera, Github, PenTool, Mic, Loader2, Sparkles, Send } from "lucide-react";
import { useEnhanceWork, useContentSeeds, useGenerateContent } from "@/hooks/use-agent-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreatePage() {
  const [activeSeedId, setActiveSeedId] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  
  const { data: seeds, isLoading: seedsLoading } = useContentSeeds();
  const enhanceMutation = useEnhanceWork();
  const generateMutation = useGenerateContent();

  const handleManualEnhance = async () => {
    if (!manualText) return;
    await enhanceMutation.mutateAsync({ description: manualText });
    setManualText("");
  };

  return (
    <div className="grid grid-cols-12 h-screen bg-[#0a0a0c] text-white">
      {/* Left Column: Skippy Input Panel */}
      <div className="col-span-12 lg:col-span-5 border-r border-white/5 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
             <span className="text-emerald-400">§</span> Skippy Content Brain
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <Tabs defaultValue="voice" className="w-full">
            <TabsList className="bg-white/5 border border-white/5 mb-4 grid grid-cols-5 w-full">
               <TabsTrigger value="voice"><Mic size={14} /></TabsTrigger>
               <TabsTrigger value="screenshot"><Camera size={14} /></TabsTrigger>
               <TabsTrigger value="github"><Github size={14} /></TabsTrigger>
               <TabsTrigger value="figma">🎨</TabsTrigger>
               <TabsTrigger value="manual"><PenTool size={14} /></TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
               <Textarea 
                 placeholder="What did you build today? Briefly describe it..." 
                 className="bg-white/5 border-white/10 min-h-[150px] resize-none"
                 value={manualText}
                 onChange={(e) => setManualText(e.target.value)}
               />
               <Button 
                 onClick={handleManualEnhance}
                 disabled={enhanceMutation.isPending}
                 className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
               >
                 {enhanceMutation.isPending ? <Loader2 className="animate-spin" /> : "Enhance with Skippy"}
               </Button>
            </TabsContent>
            {/* Other tabs placeholders */}
            <TabsContent value="voice" className="py-12 text-center text-white/40">
               Click microphone to start recording...
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/30 uppercase tracking-widest">Recent Content Seeds</h3>
            <div className="grid gap-3">
               {seedsLoading ? (
                 <Loader2 className="animate-spin mx-auto text-emerald-500" />
               ) : (
                 seeds?.map((seed: any) => (
                    <div 
                      key={seed.id} 
                      onClick={() => setActiveSeedId(seed.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${activeSeedId === seed.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <h4 className="font-medium mb-1">{seed.title}</h4>
                      <p className="text-xs text-white/40 line-clamp-2">{seed.description}</p>
                    </div>
                 ))
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Meta Factory */}
      <div className="col-span-12 lg:col-span-7 flex flex-col bg-black">
         <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <span className="text-sky-400">Δ</span> Meta Content Factory
            </h2>
         </div>

         <div className="flex-1 flex items-center justify-center p-12 text-center">
            {!activeSeedId ? (
              <div className="max-w-md space-y-4 opacity-30">
                 <Sparkles size={48} className="mx-auto" />
                 <h2 className="text-2xl font-bold tracking-tight">Select a Content Seed</h2>
                 <p className="text-sm leading-relaxed">
                   Meta will transform your work summary into multi-platform campaigns using storytelling, technical, and outcome-led hooks.
                 </p>
              </div>
            ) : (
                <div className="w-full h-full text-left space-y-8">
                   <div className="grid grid-cols-5 gap-4">
                      {["LinkedIn", "Twitter", "Instagram", "YouTube", "Reddit"].map(p => (
                         <div key={p} className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                            <input type="checkbox" className="accent-emerald-400" />
                            <span className="text-xs font-medium">{p}</span>
                         </div>
                      ))}
                   </div>
                   <Button 
                     onClick={() => generateMutation.mutate({ seed_id: activeSeedId!, platforms: ["twitter"] })}
                     className="w-full py-8 text-lg font-bold bg-white text-black hover:bg-white/90"
                   >
                     {generateMutation.isPending ? <Loader2 className="animate-spin" /> : "Factory Unleash"}
                   </Button>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}
