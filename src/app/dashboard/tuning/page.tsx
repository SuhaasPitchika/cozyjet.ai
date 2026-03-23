"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Sparkles, Loader2, RotateCcw } from "lucide-react";

const PARAMS = [
  { key: "creativity", label: "Creativity", sublabel: "Temperature", min: 0, max: 1, step: 0.05, default: 0.7 },
  { key: "focus", label: "Focus", sublabel: "Top-P Nucleus", min: 0, max: 1, step: 0.05, default: 0.9 },
  { key: "identity", label: "Identity Weight", sublabel: "Brand Consistency", min: 0, max: 1, step: 0.05, default: 0.85 },
];

export default function TuningPage() {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(PARAMS.map((p) => [p.key, p.default]))
  );
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleTrain = () => {
    setIsTraining(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); setIsTraining(false); return 100; }
        return p + 4;
      });
    }, 120);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setValues(Object.fromEntries(PARAMS.map((p) => [p.key, p.default])));
  };

  return (
    <div className="h-full bg-[#0f0f0f] p-8 flex flex-col gap-8 overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Model Configuration</span>
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Tuning</h1>
        <p className="text-sm text-white/40 mt-1">Customize agent personality and response style</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Hyperparameters */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-white/30" />
            <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Hyperparameters</span>
          </div>

          <div className="space-y-8">
            {PARAMS.map((param) => (
              <div key={param.key} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-white/70">{param.label}</div>
                    <div className="text-[10px] text-white/30">{param.sublabel}</div>
                  </div>
                  <div className="text-sm font-mono text-white bg-white/10 px-3 py-1 rounded-lg">
                    {values[param.key].toFixed(2)}
                  </div>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={values[param.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [param.key]: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
            >
              {saved ? "Saved!" : "Save Configuration"}
            </button>
          </div>
        </div>

        {/* Training + System context */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-white/30" />
              <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Model Retraining</span>
            </div>

            {isTraining ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Training in progress...</span>
                  <span className="font-mono text-white/40">{progress}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/30">
                  <Loader2 size={11} className="animate-spin" />
                  Fine-tuning identity vectors...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-white/40 leading-relaxed">
                  Retrain agents on your recent work patterns and communication style to improve personalization.
                </p>
                <button
                  onClick={handleTrain}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all border border-white/5"
                >
                  <Sparkles size={13} />
                  Start Retraining
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-xs text-white/30 font-medium uppercase tracking-wider">System Context</span>
            </div>
            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
              <p className="text-[11px] font-mono text-white/40 leading-loose italic">
                "Act as a professional marketing lead with high-fidelity knowledge of the user's recent projects.
                Prioritize authoritative tone, zero-trust security, and empathetic communication style."
              </p>
            </div>
            <button className="w-full px-4 py-2.5 rounded-xl border border-white/5 text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
              Edit System Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
