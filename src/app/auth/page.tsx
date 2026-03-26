
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Github, Chrome } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 hero-grid">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl grid md:grid-cols-2 bg-card/40 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        {/* Left Side: Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-primary/5 border-r border-white/5 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-64 bg-primary rounded-2xl flex flex-col items-center justify-center p-8 z-10 relative"
          >
             <div className="flex gap-4 mb-8">
               <div className="w-4 h-4 bg-white rounded-full" />
               <div className="w-4 h-4 bg-white rounded-full" />
             </div>
             <div className="w-20 h-2 bg-black/10 rounded-full" />
             <div className="absolute -bottom-4 -right-4 bg-secondary p-4 rounded-xl shadow-lg">
                <Rocket className="w-8 h-8 text-white" />
             </div>
          </motion.div>
          <div className="mt-12 text-center">
            <h2 className="font-headline text-2xl font-bold mb-2">Welcome Home</h2>
            <p className="text-foreground/40 text-sm">Sign in to your AI agent command center.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-bold mb-2">Sign In</h1>
            <p className="text-foreground/60 text-sm">Choose your preferred method</p>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            <Button variant="outline" className="w-full py-6 gap-3 rounded-xl border-white/10 hover:bg-white/5">
              <Chrome className="w-5 h-5" />
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full py-6 gap-3 rounded-xl border-white/10 hover:bg-white/5">
              <Github className="w-5 h-5" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#231F2A] px-2 text-foreground/40">Or email</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" className="bg-white/5 border-white/10 py-6 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" className="bg-white/5 border-white/10 py-6 rounded-xl" />
            </div>
            <Button className="w-full py-6 rounded-xl bg-primary text-white font-bold text-lg mt-4">
              Enter Dashboard
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-foreground/40">
            By continuing, you agree to CozyJet's <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
