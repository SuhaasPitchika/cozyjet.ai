"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Loader2, Zap } from "lucide-react";
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
      const result = await flippoAnalyzeProductivity({
        activitySummaries: [
          { startTime: "09:00", endTime: "10:30", description: "Strategic UI architecture and component logic" },
          { startTime: "10:30", endTime: "10:35", description: "Brief comms catchup" },
          { startTime: "10:35", endTime: "12:00", description: "Backend integration and AI flow tuning" }
        ]
      });

      await addDoc(collection(db, "users", user.uid, "productivitySessions"), {
        userId: user.uid,
        score: result.deepWorkScore,
        insights: result.productivityInsights,
        timeline: result.timeline.map(event => ({
          time: event.timestamp,
          app: event.type === 'deep_work' ? 'IDE' : 'Browser',
          action: event.description,
          type: event.type,
          emotion: event.type === 'deep_work' ? 'High Focus' : 'Surface Level'
        })),
        createdAt: serverTimestamp(),
      });

    } catch (error) {
      console.error("Flippo Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-10 bg-white min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Activity Timeline</h1>
          <p className="text-xs text-gray-400 font-medium">Deep Work Analysis by Flippo</p>
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="rounded-xl bg-black text-white hover:bg-gray-800 text-xs px-6 h-11"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={14} />
              <span>Analyzing...</span>
            </div>
          ) : "Analyze Session"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-8 space-y-8">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full flex flex-col items-center justify-center border border-gray-100 bg-gray-50/50 relative">
                <span className="text-3xl font-bold">{latestSession?.score || "--"}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Score</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Flow Quality</span>
                <span className="text-black">{latestSession ? "Stable" : "Awaiting Data"}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${latestSession?.score || 0}%` }} 
                  className="h-full bg-black rounded-full" 
                />
              </div>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Flippo Insight</h4>
              <p className="text-xs leading-relaxed text-gray-600 italic">
                {latestSession?.insights || "Initializing observation logs..."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Clock size={14} />
            Focus Events
          </div>
          
          <div className="space-y-4 relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-50" />
            
            {latestSession ? latestSession.timeline.map((event: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative pl-10"
              >
                <div className="absolute left-3 top-3 w-2 h-2 rounded-full bg-black border-2 border-white shadow-sm" />
                <div className="p-5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-gray-400">{event.time}</span>
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 rounded-md",
                      event.type === 'deep_work' ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                    )}>
                      {event.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold tracking-tight">{event.app}: {event.action}</h4>
                </div>
              </motion.div>
            )) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-300 uppercase">No active log found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}