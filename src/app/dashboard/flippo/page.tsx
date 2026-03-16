
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, Activity, Loader2, Calendar } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { flippoAnalyzeProductivity } from "@/ai/flows/flippo-analyze-productivity";
import { cn } from "@/lib/utils";

export default function FlippoPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [isGenerating, setIsGenerating] = useState(false);

  const sessionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "productivitySessions"),
      orderBy("createdAt", "desc"),
      limit(1)
    );
  }, [db, user]);

  const { data: sessions } = useCollection(sessionsQuery);
  const latestSession = sessions?.[0];

  const handleGenerate = async () => {
    if (!user || isGenerating) return;
    setIsGenerating(true);

    try {
      // Simulate activity data derived from "Skippy's observation"
      const result = await flippoAnalyzeProductivity({
        activitySummaries: [
          { startTime: "09:00", endTime: "10:15", description: "Deep focus on Figma landing page UI components" },
          { startTime: "10:15", endTime: "10:20", description: "Quick email check" },
          { startTime: "10:20", endTime: "11:45", description: "Coding the Next.js auth provider and logic" },
          { startTime: "13:00", endTime: "14:30", description: "Writing technical documentation in Notion" }
        ]
      });

      // Save to Firestore
      await addDoc(collection(db, "users", user.uid, "productivitySessions"), {
        userId: user.uid,
        score: result.deepWorkScore,
        insights: result.productivityInsights,
        timeline: result.timeline.map(event => ({
          time: event.timestamp,
          app: event.type === 'deep_work' ? 'VS Code / Figma' : 'Browser',
          action: event.description,
          type: event.type,
          emotion: event.type === 'deep_work' ? 'Intense Focus' : 'Fragmented'
        })),
        createdAt: serverTimestamp(),
      });

    } catch (error) {
      console.error("Flippo Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-12 space-y-12 font-pixel">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Flippo <span className="text-black/40">Timeline</span></h1>
          <p className="text-black/40 text-[8px] font-bold uppercase tracking-[0.2em]">Emotional Productivity Engine</p>
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-16 px-12 rounded-full bg-black text-white hover:bg-black/90 font-bold text-[8px] uppercase tracking-widest shadow-2xl transition-all hover:scale-105 disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin" size={16} />
              <span>Analyzing Brain Waves...</span>
            </div>
          ) : "Generate Matrix"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Score & Matrix */}
        <Card className="lg:col-span-1 rounded-[3rem] overflow-hidden border-2 border-black bg-white/60 backdrop-blur-md shadow-2xl">
          <CardContent className="p-12 space-y-10">
            <div className="text-center">
              <div className="w-40 h-40 mx-auto rounded-full flex flex-col items-center justify-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={latestSession?.score || 0}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-4xl font-bold">{latestSession?.score || "--"}</span>
                    <span className="text-[6px] font-bold text-black/40 uppercase tracking-widest mt-2">Focus</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-black/40">
                <span>Flow State</span>
                <span className={cn("text-black", latestSession?.score && latestSession.score > 80 ? "text-green-500" : "")}>
                  {latestSession ? (latestSession.score > 80 ? "EXCELLENT" : "STABLE") : "WAITING"}
                </span>
              </div>
              <div className="h-4 w-full bg-black/5 rounded-full overflow-hidden border-2 border-black/10 p-1">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${latestSession?.score || 0}%` }} 
                  className="h-full bg-black rounded-full" 
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-2 border-black rounded-3xl text-center shadow-inner">
              <h4 className="text-[6px] font-bold uppercase mb-3 text-black/40">AI Insight</h4>
              <p className="text-[7px] leading-relaxed uppercase">
                {latestSession?.insights || "Initializing sync with Skippy local activity store..."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Visualization */}
        <div className="lg:col-span-2 space-y-10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-4">
            <Clock size={20} />
            Causal History
          </h3>
          
          <div className="space-y-6 relative pb-10">
            <div className="absolute left-5 top-0 bottom-0 w-1 bg-black/10" />
            
            {latestSession ? latestSession.timeline.map((event: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-16 group"
              >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-4 border-black shadow-lg z-10" />
                <div className="bg-white/80 p-8 rounded-[2.5rem] border-2 border-black shadow-xl group-hover:scale-[1.02] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[8px] font-mono text-black/40">{event.time}</span>
                    <span className={cn(
                      "text-white text-[6px] font-bold uppercase px-4 py-2 rounded-full",
                      event.type === 'deep_work' ? "bg-black" : "bg-gray-400"
                    )}>
                      {event.type}
                    </span>
                  </div>
                  <h4 className="text-[10px] font-bold uppercase mb-2 tracking-tight">{event.app}: {event.action}</h4>
                  <p className="text-[8px] text-black/40 leading-relaxed uppercase">Evidence: {event.emotion}</p>
                </div>
              </motion.div>
            )) : (
              <div className="h-80 flex flex-col items-center justify-center border-4 border-dashed border-black/10 rounded-[3rem] space-y-6">
                <div className={cn("w-16 h-16 border-4 border-black/10 border-t-black rounded-full", isGenerating ? "animate-spin" : "")} />
                <p className="text-[8px] font-bold text-black/20 uppercase tracking-[0.3em]">
                  {isGenerating ? "Processing local encrypted activity data..." : "No synchronization data found"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
