
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const skyImage = PlaceHolderImages.find(img => img.id === "auth-sky");

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Blue Pink Nature Sky Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={skyImage?.imageUrl || "https://picsum.photos/seed/bluepinksky/1920/1080"}
          alt="Blue Pink Sky"
          fill
          className="object-cover"
          priority
          data-ai-hint="blue pink sky"
        />
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md p-10 z-20 mx-4"
      >
        {/* Glassmorphic Auth Card */}
        <div className="bg-white/15 backdrop-blur-3xl border border-white/30 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-10 relative overflow-hidden ring-1 ring-white/20">
          <div className="mb-10 text-center">
            <h1 className="pixel-text text-xl font-bold mb-3 text-white drop-shadow-sm uppercase tracking-tighter">
              Studio Access
            </h1>
            <p className="text-white/70 text-[10px] uppercase font-bold tracking-[0.25em]">
              Verify your credentials
            </p>
          </div>

          <form 
            className="space-y-8" 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if(email.includes('@') && passcode.length > 3) {
                window.location.href = '/dashboard'; 
              }
            }}
          >
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest text-white/80 ml-2">
                Email Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                required
                placeholder="user@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 h-14 rounded-2xl focus:ring-white/40 text-white placeholder:text-white/40 px-6 backdrop-blur-sm" 
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="passcode" className="text-[10px] uppercase font-bold tracking-widest text-white/80 ml-2">
                Passcode
              </Label>
              <Input 
                id="passcode" 
                type="password" 
                required
                placeholder="••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="bg-white/10 border-white/20 h-14 rounded-2xl focus:ring-white/40 text-white font-mono tracking-widest placeholder:text-white/40 px-6 backdrop-blur-sm" 
              />
            </div>

            <Button 
              className="w-full h-16 rounded-2xl bg-white text-black font-bold text-md shadow-2xl hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={!email.includes('@') || passcode.length < 4}
            >
              Enter Studio
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-[8px] text-white/50 leading-relaxed uppercase tracking-widest">
              Secured by <br />
              <span className="font-bold text-white/70">CozyJet Studio Environment</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
