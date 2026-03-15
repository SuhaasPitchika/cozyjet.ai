
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, ShieldCheck, Cloud } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const skyImage = PlaceHolderImages.find(img => img.id === "auth-sky");

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Nature Sky Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={skyImage?.imageUrl || "https://picsum.photos/seed/authsky/1920/1080"}
          alt="Atmospheric Sky"
          fill
          className="object-cover"
          priority
          data-ai-hint="sky clouds"
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
      </div>

      {/* Floating Elements for Depth */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[10%] opacity-20 z-10 hidden lg:block"
      >
        <Cloud className="w-32 h-32 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md p-10 z-20 mx-4"
      >
        {/* Glassmorphic Auth Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 relative overflow-hidden ring-1 ring-white/20">
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/40 shadow-xl">
              <ShieldCheck className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <h1 className="pixel-text text-lg font-bold mb-2 text-white drop-shadow-sm uppercase tracking-tighter">
              Secure Access
            </h1>
            <p className="text-white/60 text-[9px] uppercase font-bold tracking-[0.2em]">
              Gmail & Private Passcode Required
            </p>
          </div>

          <form 
            className="space-y-8" 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if(email.includes('@gmail.com') && passcode.length > 3) {
                window.location.href = '/dashboard'; 
              }
            }}
          >
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest text-white/70 ml-2">
                Gmail Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                required
                placeholder="user@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 h-14 rounded-2xl focus:ring-white/50 text-white placeholder:text-white/30 px-6 backdrop-blur-sm" 
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="passcode" className="text-[10px] uppercase font-bold tracking-widest text-white/70 ml-2">
                Custom Passcode
              </Label>
              <Input 
                id="passcode" 
                type="password" 
                required
                placeholder="••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="bg-white/10 border-white/20 h-14 rounded-2xl focus:ring-white/50 text-white font-mono tracking-widest placeholder:text-white/30 px-6 backdrop-blur-sm" 
              />
            </div>

            <Button 
              className="w-full h-16 rounded-2xl bg-white text-black font-bold text-md shadow-2xl hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={!email.includes('@gmail.com') || passcode.length < 4}
            >
              Enter Studio
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <p className="text-[8px] text-white/40 leading-relaxed uppercase tracking-widest">
              Proprietary Access Controlled by <br />
              <span className="font-bold text-white/60">CozyJet Autonomous Systems</span>
            </p>
          </div>
          
          {/* Subtle Background Icon Decoration */}
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
            <Rocket className="w-48 h-48 rotate-45 text-white" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
