
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 hero-grid">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-card border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Rocket className="w-32 h-32 rotate-45" />
        </div>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="pixel-text text-lg font-bold mb-2">Secure Access</h1>
          <p className="text-foreground/40 text-xs">Gmail & Private Passcode Required</p>
        </div>

        <form 
          className="space-y-6" 
          onSubmit={(e) => { 
            e.preventDefault(); 
            if(email.includes('@gmail.com') && passcode.length > 3) {
              window.location.href = '/dashboard'; 
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest opacity-50">Gmail Address</Label>
            <Input 
              id="email" 
              type="email" 
              required
              placeholder="user@gmail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 h-14 rounded-xl focus:ring-primary" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="passcode" className="text-[10px] uppercase font-bold tracking-widest opacity-50">Custom Passcode</Label>
            <Input 
              id="passcode" 
              type="password" 
              required
              placeholder="••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="bg-white/5 border-white/10 h-14 rounded-xl focus:ring-primary font-mono tracking-widest" 
            />
          </div>

          <Button 
            className="w-full h-14 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            disabled={!email.includes('@gmail.com') || passcode.length < 4}
          >
            Enter Studio
          </Button>
        </form>

        <p className="mt-8 text-center text-[10px] text-foreground/30 leading-relaxed uppercase tracking-tighter">
          Proprietary Access Controlled by <br />
          <span className="font-bold">CozyJet Autonomous Systems</span>
        </p>
      </motion.div>
    </div>
  );
}
