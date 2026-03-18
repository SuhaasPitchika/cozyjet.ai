"use client";

import React, { useRef, useEffect, useCallback, memo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const IMAGES = PlaceHolderImages.filter((img) => img.id.startsWith("workspace")).slice(0, 12);

// Configuration for the 3D Perspective Ribbon
const CARD_WIDTH = 340; 
const DEPTH_STRENGTH = 1000; 
const AUTO_ROTATION_SPEED = 0.0006;
const MOMENTUM_DAMPING = 0.96;

const STEPS = [
  { id: "#01", label: "MARKETING CONTENT" },
  { id: "#02", label: "SOCIAL MEDIA GROWTH" },
  { id: "#03", label: "PRODUCTIVITY" },
  { id: "#04", label: "ON SCREEN SUPPORT" },
  { id: "#05", label: "AGENTIC PERSONAL AI" },
];

const ThreeSlideshowComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const rafIdRef = useRef<number>(0);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Cycle through steps every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const updateCards = useCallback(() => {
    if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.0001) {
      rotationRef.current += velocityRef.current;
      velocityRef.current *= MOMENTUM_DAMPING;
    } else if (!isDraggingRef.current) {
      rotationRef.current += AUTO_ROTATION_SPEED;
    }

    const cards = cardsRef.current;
    const total = IMAGES.length;
    
    cards.forEach((card, i) => {
      if (!card) return;

      const basePos = (i / total);
      let currentPos = (basePos + rotationRef.current) % 1;
      if (currentPos < 0) currentPos += 1;

      let focus = currentPos - 0.5;
      if (focus > 0.5) focus -= 1;
      if (focus < -0.5) focus += 1;

      const visibleSpan = 0.45; 
      const isVisible = Math.abs(focus) < visibleSpan;

      if (!isVisible) {
        card.style.opacity = "0";
        card.style.pointerEvents = "none";
        return;
      }

      const normalizedFocus = focus / visibleSpan; 
      
      const spreadFactor = 1.6;
      const x = focus * (window.innerWidth * spreadFactor);
      const z = (1 - Math.abs(normalizedFocus)) * -DEPTH_STRENGTH;
      
      const scaleBase = 0.4;
      const scaleGrowth = 0.35;
      const scale = scaleBase + Math.abs(normalizedFocus) * scaleGrowth;
      
      const rotateY = normalizedFocus * -60;

      const fadeDist = visibleSpan - Math.abs(focus);
      const opacity = Math.min(1, fadeDist * 10);

      card.style.opacity = opacity.toString();
      card.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
      
      const zIndexValue = Math.round(Math.abs(normalizedFocus) * 100);
      card.style.zIndex = zIndexValue.toString();
      
      card.style.transform = `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`;
      
      const tilt = Math.abs(normalizedFocus) * 15;
      card.style.clipPath = normalizedFocus > 0 
        ? `polygon(${tilt}% 0%, 100% 0%, 100% 100%, ${tilt}% 100%)`
        : `polygon(0% 0%, ${100 - tilt}% 0%, ${100 - tilt}% 100%, 0% 100%)`;
      
      card.style.margin = "0"; 
    });

    rafIdRef.current = requestAnimationFrame(updateCards);
  }, []);

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(updateCards);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [updateCards]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    const x = 'touches' in e ? (e as unknown as TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    lastMouseXRef.current = x;
    velocityRef.current = 0;
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    const x = 'touches' in e ? (e as unknown as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const deltaX = x - lastMouseXRef.current;
    const rotationOffset = deltaX / (window.innerWidth * 0.8);
    rotationRef.current -= rotationOffset;
    velocityRef.current = -rotationOffset;
    lastMouseXRef.current = x;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-[#f2e8d5] overflow-hidden flex flex-col items-center justify-center py-20">
      
      <div className="relative z-20 text-center px-6 max-w-4xl mb-12">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-[#f97316] font-bold text-[13px] uppercase tracking-[0.4em] mb-4 font-pixel"
        >
          Behind the Designs
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-[32px] md:text-[48px] font-extrabold text-black leading-tight tracking-tighter font-pixel drop-shadow-sm"
        >
          Curious What Else<br />I&apos;ve Created?
        </motion.h2>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-[65vh] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-[2500px] overflow-hidden"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{ 
          transformStyle: "preserve-3d",
          clipPath: "polygon(0% 0%, 25% 15%, 50% 25%, 75% 15%, 100% 0%, 100% 100%, 75% 85%, 50% 75%, 25% 85%, 0% 100%)" 
        }}
      >
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {IMAGES.map((img, i) => (
            <div
              key={img.id}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="absolute bg-black will-change-transform overflow-hidden shadow-2xl rounded-xl"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `580px`,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                transition: "none",
              }}
            >
              <Image
                src={img.imageUrl}
                alt={img.description}
                fill
                className="object-cover brightness-90 hover:brightness-100 transition-all duration-500"
                sizes="800px"
                loading="lazy"
                data-ai-hint={img.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none opacity-40" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 mt-20 h-24 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            className="text-center"
          >
            <motion.span 
              className="text-[#f97316] font-bold text-[14px] font-pixel tracking-widest block mb-2"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
            >
              {STEPS[currentStepIndex].id}
            </motion.span>
            
            <div className="flex justify-center overflow-hidden flex-wrap">
              {STEPS[currentStepIndex].label.split("").map((char, i) => (
                <motion.span
                  key={`${currentStepIndex}-${i}`}
                  initial={{ opacity: 0, x: -5, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 5, filter: "blur(8px)" }}
                  transition={{ 
                    delay: i * 0.04,
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                  className="text-black font-extrabold text-[18px] md:text-[24px] uppercase tracking-tighter font-pixel inline-block whitespace-pre"
                >
                  {char}
                </motion.span>
              ))}
            </div>

            <motion.div 
              className="w-full max-w-xs mx-auto h-1 bg-primary/10 mt-4 relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "linear" }}
            >
              <div className="absolute inset-0 bg-primary animate-pulse" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export const ThreeSlideshow = memo(ThreeSlideshowComponent);