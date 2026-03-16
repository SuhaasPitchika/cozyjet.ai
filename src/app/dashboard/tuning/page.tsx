"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Settings, Sliders, Database, Save, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function TuningPage() {
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  const startTraining = () => {
    setIsTraining(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setTrainingProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 200);
  };

  return (
    <div className="p-10 space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold uppercase tracking-tighter">AI <span className="text-black/40">Tuning</span></h1>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-[0.2em]">Hyper-Personalized LLM Calibration Interface</p>
        </div>
        <Button className="h-14 px-10 rounded-full bg-black text-white hover:bg-black/90 font-bold text-[10px] uppercase tracking-widest shadow-xl">
          <Save size={16} className="mr-2" /> Save Weights
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Upload & Training */}
        <section className="space-y-8">
          <Card className="rounded-[2.5rem] border-black/5 bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-10 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Database size={20} className="text-black/40" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Source Material</h3>
              </div>
              <div className="p-12 border-2 border-dashed border-black/5 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:bg-black/5 transition-all cursor-pointer">
                <Upload size={40} className="text-black/20 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Drop writing samples, voice clips, or PDFs</p>
                <p className="text-[8px] text-black/20 mt-2">Maximum file size: 50MB</p>
              </div>
              
              {isTraining ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                    <span>Re-calculating Attention Masks...</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <Progress value={trainingProgress} className="h-2 bg-black/5" />
                </div>
              ) : (
                <Button onClick={startTraining} className="w-full h-14 rounded-2xl bg-black text-white font-bold uppercase text-[10px] tracking-widest">
                  <Sparkles size={16} className="mr-2" /> Start Model Training
                </Button>
              )}
            </CardContent>
          </Card>
        </section>

        {/* API & Weights */}
        <section className="space-y-8">
          <Card className="rounded-[2.5rem] border-black/5 bg-white/50 backdrop-blur-sm shadow-sm">
            <CardContent className="p-10 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <Settings size={20} className="text-black/40" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Backend Hyperparameters</h3>
              </div>

              {[
                { label: "Creativity (Temperature)", val: 0.7 },
                { label: "Focus (Top-P)", val: 0.9 },
                { label: "Personality Weight", val: 0.85 },
              ].map((param, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
                    <span>{param.label}</span>
                    <span className="p-2 bg-black/5 rounded-lg">{param.val}</span>
                  </div>
                  <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full bg-black" style={{ width: `${param.val * 100}%` }} />
                  </div>
                </div>
              ))}

              <div className="pt-6 space-y-4">
                <div className="p-6 neumorphic-in rounded-[2rem] bg-gray-50/50">
                  <h4 className="text-[10px] font-bold uppercase mb-4 text-black/40">Current System Prompt</h4>
                  <p className="text-[9px] font-mono leading-relaxed text-black/60 italic">
                    "Act as a professional marketing head with high-fidelity knowledge of the user's past 15 projects. Prioritize authoritative tone and zero-trust security context..."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}