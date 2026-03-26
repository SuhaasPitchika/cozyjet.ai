"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Zap, ArrowLeft, Send, 
  Calendar, CheckCircle2, Loader2, 
  Layout, MessageSquare, Heart, 
  Clock, Save, SlidersHorizontal, ArrowRight,
  Eye, Monitor, Smartphone, PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

export default function ReviewPage() {
  const { seedId } = useParams();
  const router = useRouter();
  const [variations, setVariations] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    const fetchVariations = async () => {
      try {
        const { data } = await api.get(`/api/content/variations/${seedId}`);
        setVariations(data);
        setLoading(false);
      } catch (e) {
        console.error("Failed to load variations", e);
        setLoading(false);
      }
    };
    fetchVariations();
  }, [seedId]);

  const handleUpdateText = (newText: string) => {
    const nextVal = [...variations];
    nextVal[activeIndex].text = newText;
    setVariations(nextVal);
  };

  const handleApprove = async () => {
    setSaving(true);
    const content = variations[activeIndex];
    try {
      // 1. Save Polish
      await api.patch(`/api/content/${content.id}`, { text: content.text });
      // 2. Approve
      await api.post(`/api/content/${content.id}/approve`);
      
      router.push("/dashboard/calendar");
    } catch (e) {
      console.error("Failed to approve", e);
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#fdfbf7] h-screen">
       <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  const activeContent = variations[activeIndex];

  return (
    <div className="flex-1 space-y-10 p-10 bg-[#fdfbf7] min-h-screen pb-40 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
           <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
              <ArrowLeft size={20} />
           </button>
           <div className="space-y-1">
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Review & Polish</h1>
              <p className="text-sm text-slate-500 font-medium">Select a variation and refine the AI's first draft.</p>
           </div>
        </div>
        
        <div className="flex gap-4">
           <Button 
             variant="outline" 
             onClick={() => setShowSchedule(true)}
             className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-xs font-bold font-sans hover:bg-slate-50 hover:border-indigo-100 transition-all shadow-sm"
           >
              <Calendar size={16} className="mr-2" /> SCHEDULE
           </Button>
           <Button 
             onClick={handleApprove}
             disabled={saving}
             className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-widest uppercase shadow-xl shadow-indigo-500/10 transition-all group"
           >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <> <Send size={16} className="mr-2" /> PUBLISH NOW </>}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Main Editor */}
         <div className="lg:col-span-2 space-y-8">
            {/* Variation Toggler */}
            <div className="p-2 bg-slate-100 rounded-[2rem] flex gap-2">
               {variations.map((v, i) => (
                 <button
                   key={v.id}
                   onClick={() => setActiveIndex(i)}
                   className={cn(
                     "flex-1 h-14 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                     activeIndex === i 
                       ? "bg-white text-indigo-600 shadow-md" 
                       : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                    {v.type}
                 </button>
               ))}
            </div>

            {/* Prose Editor */}
            <div className="p-12 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8 relative group">
               <div className="absolute top-8 left-8 p-3 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <PenTool size={18} />
               </div>
               <textarea 
                 value={activeContent.text}
                 onChange={(e) => handleUpdateText(e.target.value)}
                 className="w-full h-[400px] bg-transparent border-none text-lg font-medium text-slate-700 leading-relaxed placeholder:text-slate-300 focus:ring-0 outline-none resize-none pt-4"
                 placeholder="Write your masterpiece here..."
               />
               <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                  <div className="flex gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                     <span>{activeContent.text.length} Characters</span>
                     <span>{activeContent.text.split(' ').length} Words</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-400">
                     <Sparkles size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Meta Tuned</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Preview & Sidebar */}
         <div className="space-y-8">
            {/* Live Preview Wall */}
            <div className="p-10 rounded-[3rem] bg-slate-900 text-white space-y-8 shadow-2xl shadow-slate-900/40 relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full -mr-10 -mt-10 blur-3xl" />
               
               <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div className="flex items-center gap-2">
                     <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold">L</span>
                     <span className="text-xs font-bold tracking-tight">LinkedIn Preview</span>
                  </div>
                  <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                     <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </div>
               </div>

               <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-200" />
                     <div className="space-y-1">
                        <div className="h-2 w-24 bg-white/20 rounded-full" />
                        <div className="h-1.5 w-16 bg-white/10 rounded-full" />
                     </div>
                  </div>
                  <div className="text-[13px] text-white/80 leading-relaxed font-medium line-clamp-[12] whitespace-pre-wrap">
                     {activeContent.text}
                  </div>
               </div>

               <div className="pt-4 flex gap-6 text-white/40">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                     <Heart size={14} /> Like
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                     <MessageSquare size={14} /> Comment
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                     <ArrowRight size={14} /> Share
                  </div>
               </div>
            </div>
         </div>
      </div>
      
      {/* Scheduling Modal Overlay (Mock) */}
      <AnimatePresence>
         {showSchedule && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6"
           >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-3xl space-y-8"
              >
                 <div className="space-y-2">
                    <h3 className="text-2xl font-headline font-bold text-slate-900">Pick Timing</h3>
                    <p className="text-sm text-slate-400 font-medium">When should we drop this masterpiece?</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all">
                       <span className="text-sm font-bold text-slate-900">Tomorrow Morning</span>
                       <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">9:00 AM</span>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all">
                       <span className="text-sm font-bold text-slate-900">Tuesday Afternoon</span>
                       <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">2:30 PM</span>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setShowSchedule(false)} className="flex-1 h-14 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest">CANCEL</Button>
                    <Button onClick={handleApprove} className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/10">CONFIRM</Button>
                 </div>
              </motion.div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
