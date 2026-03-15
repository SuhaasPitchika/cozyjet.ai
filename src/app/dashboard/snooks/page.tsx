
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, Eye, Globe, User, Fingerprint, Ban, BarChart3 } from "lucide-react";
import { snooksComplianceCheck } from "@/ai/flows/snooks-compliance-enforcement";

export default function SnooksCompliancePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleRunCheck = async () => {
    setIsChecking(true);
    try {
      const result = await snooksComplianceCheck({
        content: "Completed brand identity design for Project Phoenix. Contact me at 555-0199 for inquiries!",
        platform: "LinkedIn",
        exclusionList: ["Project Phoenix", "Internal UI Specs"]
      });
      setReport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'passed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Ban className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="h-full flex flex-col bg-[#231F2A] p-8">
      <div className="mb-12 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="font-headline text-3xl font-bold uppercase tracking-tighter">SNOOKS <span className="text-white/40">Compliance Engine</span></h1>
          </div>
          <p className="text-foreground/60 font-mono text-[10px] uppercase tracking-widest">Edge-Based Adversarial Safety Checking</p>
        </div>
        <Button 
          onClick={handleRunCheck} 
          disabled={isChecking}
          className="bg-primary text-white font-bold h-12 px-8 rounded-full shadow-2xl hover:scale-105 transition-all"
        >
          {isChecking ? "Scanning Edge..." : "Initialize Compliance Scan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-black/20">
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-white/60">Active Content Buffer</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-mono text-sm leading-relaxed text-white/80 italic">
                "Completed brand identity design for <span className="bg-red-500/20 text-red-400 px-1 rounded">Project Phoenix</span>. Contact me at <span className="bg-amber-500/20 text-amber-400 px-1 rounded">555-0199</span> for inquiries!"
              </p>
            </CardContent>
          </Card>

          {report && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                { name: "PII Detection", key: "piiCheck", icon: Fingerprint },
                { name: "Link Safety", key: "linkSafety", icon: Globe },
                { name: "Sentiment Tone", key: "sentimentAnalysis", icon: User },
                { name: "Plagiarism Scan", key: "plagiarism", icon: Eye },
                { name: "Platform Policy", key: "platformPolicy", icon: Lock },
                { name: "Client Confidentiality", key: "clientConfidentiality", icon: Ban },
                { name: "Career Risk Score", key: "careerRisk", icon: BarChart3 }
              ].map((check) => (
                <div key={check.key} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/40">
                      <check.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{check.name}</p>
                      <p className="text-xs font-medium text-white/80">{report[check.key].message}</p>
                    </div>
                  </div>
                  {getStatusIcon(report[check.key].status)}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Scan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Overall Status</span>
                {report ? (
                  <Badge className={report.overallStatus === 'passed' ? 'bg-green-500' : 'bg-red-500'}>
                    {report.overallStatus.toUpperCase()}
                  </Badge>
                ) : (
                  <span className="text-xs font-mono">IDLE</span>
                )}
              </div>
              <div className="h-px bg-white/5" />
              <div className="text-[10px] text-white/60 leading-relaxed font-mono">
                VERA Protocol V2.4 enabled. Parallel checking across Cloudflare Edge nodes.
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl border border-white/5 bg-black/40 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white/20" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-2">Audit Hash</h4>
            <p className="text-[10px] font-mono text-white/40 break-all mb-4">SHA256: 9f86d081884c7d659a2f...</p>
            <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase tracking-tighter">View Merkle Trail</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
