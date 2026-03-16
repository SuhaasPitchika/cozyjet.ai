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
    <div className="p-12 space-y-16 font-pixel">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold uppercase tracking-tighter">AI <span className="text-black/40">Tuning</span></h1>
          <p className="text-black/40 text-[8px] font-bold uppercase tracking-[0.3em]">Personalized LLM Calibration Interface</p>
        </div>
        <Button className="h-16 px-12 rounded-full bg-black text-white hover:bg-black/90 font-bold text-[8px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
          <Save size={18} className="mr-3" /> Save Weights
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upload & Training */}
        <section className="space-y-10">
          <Card className="rounded-[3rem] border-4 border-black bg-white/60 backdrop-blur-sm overflow-hidden shadow-2xl">
            <CardContent className="p-12 space-y-10">
              <div className="flex items-center gap-4 mb-4">
                <Database size={24} className="text-black/40" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Source Material</h3>
              </div>
              <div className="p-16 border-4 border-dashed border-black/10 rounded-[3rem] flex flex-col items-center justify-center text-center group hover:bg-black hover:text-white hover:border-white transition-all cursor-pointer shadow-xl">
                <Upload size={48} className="mb-6 group-hover:scale-110 transition-transform" />
                <p className="text-[8px] font-bold uppercase tracking-[0.2em]">Drop writing samples or voice clips</p>
                <p className="text-[6px] text-black/20 group-hover:text-white/40 mt-4 uppercase">Max size: 50MB</p>
              </div>
              
              {isTraining ? (
                <div className="space-y-6">
                  <div className="flex justify-between text-[6px] font-bold uppercase tracking-[0.4em]">
                    <span>Optimizing Weights...</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full border-2 border-black p-1 overflow-hidden">
                    <motion.div 
                      className="h-full bg-black rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Button onClick={startTraining} className="w-full h-16 rounded-[2rem] bg-black text-white font-bold uppercase text-[8px] tracking-widest border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all">
                  <Sparkles size={18} className="mr-3" /> Start Retraining
                </Button>
              )}
            </CardContent>
          </Card>
        </section>

        {/* API & Weights */}
        <section className="space-y-10">
          <Card className="rounded-[3rem] border-4 border-black bg-white/60 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-12 space-y-12">
              <div className="flex items-center gap-4 mb-4">
                <Settings size={24} className="text-black/40" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Hyperparameters</h3>
              </div>

              {[
                { label: "Creativity (Temp)", val: 0.7 },
                { label: "Focus (Top-P)", val: 0.9 },
                { label: "Identity Weight", val: 0.85 },
              ].map((param, i) => (
                <div key={i} className="space-y-6">
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
                    <span>{param.label}</span>
                    <span className="px-4 py-2 bg-black text-white rounded-xl shadow-lg">{param.val}</span>
                  </div>
                  <div className="h-2 w-full bg-black/10 rounded-full border-2 border-black/5 p-0.5">
                    <div className="h-full bg-black rounded-full" style={{ width: `${param.val * 100}%` }} />
                  </div>
                </div>
              ))}

              <div className="pt-8 space-y-6">
                <div className="p-8 bg-gray-50 border-2 border-black rounded-[2.5rem] shadow-xl">
                  <h4 className="text-[8px] font-bold uppercase mb-6 text-black/40">Current System Context</h4>
                  <p className="text-[7px] font-mono leading-loose text-black/60 italic uppercase tracking-tighter">
                    "Act as a professional marketing lead with high-fidelity knowledge of the user's past 15 projects. Prioritize authoritative tone and zero-trust security..."
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
