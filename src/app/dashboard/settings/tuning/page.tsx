"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Zap, MessageSquare, Trash2, 
  Settings2, Plus, SlidersHorizontal, 
  CheckCircle2, Loader2, Info, ArrowRight,
  UserCircle, PenTool, Layout, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function TuningPage() {
  const [profile, setProfile] = useState<any>({
    tone: "Professional",
    style: "Concise",
    emoji_usage: 50,
    humor: 20,
    formality: 80,
    hashtags: true
  });
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSample, setNewSample] = useState("");

  const fetchData = async () => {
    try {
      const { data } = await api.get("/api/tuning/profile");
      setProfile(data.voice_profile);
      setSamples(data.samples);
      setLoading(false);
    } catch (e) {
      console.error("Failed to load tuning", e);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/api/tuning/profile", profile);
      setSaving(false);
    } catch (e) {
      console.error("Failed to save", e);
      setSaving(false);
    }
  };

  const addSample = async () => {
    if (!newSample.trim()) return;
    try {
      const { data } = await api.post("/api/tuning/samples", { text: newSample });
      setSamples([...samples, { id: data.id, text: newSample, platform: "linkedin" }]);
      setNewSample("");
    } catch (e) {
      console.error("Failed to add", e);
    }
  };

  const deleteSample = async (id: string) => {
    try {
      await api.delete(`/api/tuning/samples/${id}`);
      setSamples(samples.filter(s => s.id !== id));
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  return (
    <div className="flex-1 space-y-10 p-10 bg-[#fdfbf7] min-h-screen pb-40 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Voice Tuning</h1>
          <p className="text-sm text-slate-500 font-medium">Fine-tune how Meta clones and evolves your personal writing style.</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-widest uppercase shadow-xl transition-all"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <> <Save size={16} className="mr-2" /> SAVE PROFILE </>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Sliders & Presets */}
         <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                  <SlidersHorizontal size={20} />
               </div>
               <h3 className="text-xl font-headline font-bold text-slate-900">Style Sliders</h3>
            </div>

            <div className="space-y-8">
               {/* Humor */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Serious</span>
                     <span className="text-indigo-600">Humorous</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={profile.humor}
                    onChange={(e) => setProfile({...profile, humor: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                  />
               </div>

               {/* Formality */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Casual / Meme</span>
                     <span className="text-indigo-600">Ultra Professional</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={profile.formality}
                    onChange={(e) => setProfile({...profile, formality: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                  />
               </div>

               {/* Emoji Density */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Minimalist Text</span>
                     <span className="text-indigo-600">Heavy Emojis</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={profile.emoji_usage}
                    onChange={(e) => setProfile({...profile, emoji_usage: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                  />
               </div>

               {/* Hashtags Toggle */}
               <div className="pt-4 flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="space-y-1">
                     <p className="text-sm font-bold text-slate-900">Append Viral Hashtags</p>
                     <p className="text-[10px] text-slate-400 font-medium italic">Snooks will pick the top 3-5 tags for each post.</p>
                  </div>
                  <Button 
                    variant={profile.hashtags ? "default" : "outline"}
                    onClick={() => setProfile({...profile, hashtags: !profile.hashtags})}
                    className={cn(
                      "h-10 px-6 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                      profile.hashtags ? "bg-indigo-600 text-white" : "bg-white text-slate-400"
                    )}
                  >
                     {profile.hashtags ? "ON" : "OFF"}
                  </Button>
               </div>
            </div>
         </div>

         {/* Style Miner & Samples */}
         <div className="p-10 rounded-[3rem] bg-indigo-600 text-white space-y-10 shadow-2xl shadow-indigo-600/30 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full -mr-20 -mt-20 blur-3xl opacity-20" />
            
            <div className="flex items-center gap-3 relative z-10">
               <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-indigo-200">
                  <PenTool size={20} />
               </div>
               <h3 className="text-xl font-headline font-bold">Style Miner</h3>
            </div>

            <div className="space-y-6 relative z-10 flex-1">
               <p className="text-xs text-indigo-200 font-medium leading-relaxed">
                  Paste your best-performing posts here. Meta will analyze the sentence structure, vocabulary, and "vibe" to mirror it exactly.
               </p>
               
               <div className="space-y-4">
                  <textarea 
                    placeholder="Paste a recent LinkedIn post or Tweet here..."
                    value={newSample}
                    onChange={(e) => setNewSample(e.target.value)}
                    className="w-full h-32 p-6 rounded-[2rem] bg-white/10 border border-white/20 placeholder:text-white/30 text-xs font-medium focus:ring-0 focus:border-white/40 transition-all outline-none"
                  />
                  <Button 
                    onClick={addSample}
                    className="w-full h-14 rounded-2xl bg-white text-indigo-600 font-bold text-xs tracking-widest uppercase shadow-xl hover:bg-indigo-50 transition-all"
                  >
                     TRAIN META ENGINE
                  </Button>
               </div>

               {/* Recent Samples List */}
               <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Active Benchmarks</h4>
                  <div className="space-y-3">
                     {samples.length === 0 && <p className="text-[10px] italic text-indigo-300">No samples added yet.</p>}
                     {samples.map((s) => (
                       <div key={s.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group">
                          <p className="text-[10px] font-medium text-white/70 truncate mr-4 max-w-[200px]">{s.text}</p>
                          <button onClick={() => deleteSample(s.id)} className="text-white/20 hover:text-rose-400 transition-colors">
                             <Trash2 size={14} />
                          </button>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 flex items-center gap-6">
         <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <Sparkles size={24} />
         </div>
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Active Tuning: {profile.tone} & {profile.style}</h4>
            <p className="text-xs text-slate-500 font-medium italic">Snooks will now prioritize these parameters during your next generation cycle.</p>
         </div>
      </div>
    </div>
  );
}
