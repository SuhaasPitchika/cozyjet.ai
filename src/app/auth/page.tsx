"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const router = useRouter();
  
  const skyImage = PlaceHolderImages.find(img => img.id === "auth-sky");

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Auth Error:", error);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={skyImage?.imageUrl || "https://picsum.photos/seed/sky-dawn/1920/1080"}
          alt="Cinematic Sky"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-10 z-20 mx-4"
      >
        <div className="glass rounded-[3rem] p-10 shadow-2xl">
          <div className="mb-10 text-center">
            <h1 className="pixel-text text-lg font-bold mb-3 text-black">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-black/40 text-[8px] uppercase font-bold tracking-[0.2em]">
              Agent Studio Access
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleEmailAuth}>
            <div className="space-y-2">
              <Label className="text-[8px] uppercase font-bold tracking-widest text-black/60 ml-2">Email</Label>
              <Input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/50 border-white h-12 rounded-2xl focus:ring-black/5" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[8px] uppercase font-bold tracking-widest text-black/60 ml-2">Password</Label>
              <Input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/50 border-white h-12 rounded-2xl focus:ring-black/5" 
              />
            </div>

            <Button className="w-full h-14 rounded-2xl bg-black text-white hover:bg-black/90 font-bold text-xs uppercase tracking-widest">
              {isLogin ? "Enter Studio" : "Initialize Identity"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-black/5"></div>
              <span className="flex-shrink mx-4 text-[8px] text-black/30 font-bold">OR</span>
              <div className="flex-grow border-t border-black/5"></div>
            </div>

            <Button 
              variant="outline" 
              onClick={handleGoogleSignIn}
              className="w-full h-14 rounded-2xl border-white bg-white/50 hover:bg-white text-black font-bold text-xs"
            >
              Continue with Google
            </Button>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[8px] text-black/40 font-bold uppercase tracking-widest hover:text-black transition-colors"
            >
              {isLogin ? "New to the Studio? Sign Up" : "Already registered? Log In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}