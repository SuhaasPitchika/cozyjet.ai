"use client";

import React, { useRef, useEffect, useCallback, memo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const JET_IMAGES = [
  { id: "jet-1", src: "/assets/jet-color.jpg", alt: "CozyJet Fighter - Color" },
  { id: "jet-2", src: "/assets/jet-blueprint.png", alt: "CozyJet Fighter - Blueprint" },
  { id: "jet-3", src: "/assets/jet-color.jpg", alt: "CozyJet Fighter - Side A" },
  { id: "jet-4", src: "/assets/jet-blueprint.png", alt: "CozyJet Blueprint Detail" },
  { id: "jet-5", src: "/assets/jet-color.jpg", alt: "CozyJet Fighter Launch" },
  { id: "jet-6", src: "/assets/jet-blueprint.png", alt: "CozyJet Technical Schema" },
  { id: "jet-7", src: "/assets/jet-color.jpg", alt: "CozyJet Afterburner" },
  { id: "jet-8", src: "/assets/jet-blueprint.png", alt: "CozyJet Wing Detail" },
];

const CARD_WIDTH = 480;
const DEPTH_STRENGTH = 1000;
const AUTO_ROTATION_SPEED = 0.0006;
const MOMENTUM_DAMPING = 0.96;

const STEPS = [
  "MARKETING CONTENT",
  "SOCIAL MEDIA GROWTH",
  "PRODUCTIVITY",
  "ON SCREEN SUPPORT",
  "AGENTIC PERSONAL AI",
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
    const total = JET_IMAGES.length;

    cards.forEach((card, i) => {
      if (!card) return;
      const basePos = i / total;
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
      const x = focus * (window.innerWidth * 1.6);
      const z = (1 - Math.abs(normalizedFocus)) * -DEPTH_STRENGTH;
      const scale = 0.4 + Math.abs(normalizedFocus) * 0.35;
      const rotateY = normalizedFocus * -60;
      const fadeDist = visibleSpan - Math.abs(focus);
      const opacity = Math.min(1, fadeDist * 10);
      card.style.opacity = opacity.toString();
      card.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
      card.style.zIndex = Math.round(Math.abs(normalizedFocus) * 100).toString();
      card.style.transform = `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`;
      const tilt = Math.abs(normalizedFocus) * 15;
      card.style.clipPath = normalizedFocus > 0
        ? `polygon(${tilt}% 0%, 100% 0%, 100% 100%, ${tilt}% 100%)`
        : `polygon(0% 0%, ${100 - tilt}% 0%, ${100 - tilt}% 100%, 0% 100%)`;
    });

    rafIdRef.current = requestAnimationFrame(updateCards);
  }, []);

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(updateCards);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [updateCards]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    const x = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    lastMouseXRef.current = x;
    velocityRef.current = 0;
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    const x = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const deltaX = x - lastMouseXRef.current;
    rotationRef.current -= deltaX / (window.innerWidth * 0.8);
    velocityRef.current = -deltaX / (window.innerWidth * 0.8);
    lastMouseXRef.current = x;
  };

  const handleMouseUp = () => { isDraggingRef.current = false; };

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
    <section className="relative w-full bg-[#f2e8d5] overflow-hidden flex flex-col items-center justify-center py-12">
      <div className="relative z-20 text-center px-6 mb-6">
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-[28px] md:text-[38px] font-extrabold text-black leading-tight tracking-tighter font-pixel drop-shadow-sm"
        >
          Projects
        </motion.h2>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[58vh] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ perspective: "2500px", transformStyle: "preserve-3d", clipPath: "polygon(0% 0%, 25% 15%, 50% 25%, 75% 15%, 100% 0%, 100% 100%, 75% 85%, 50% 75%, 25% 85%, 0% 100%)" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          {JET_IMAGES.map((img, i) => (
            <div
              key={img.id}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="absolute bg-black will-change-transform overflow-hidden shadow-2xl rounded-xl"
              style={{ width: `${CARD_WIDTH}px`, height: `520px`, transformStyle: "preserve-3d", backfaceVisibility: "hidden", transition: "none" }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-contain object-center brightness-90 hover:brightness-100 transition-all duration-500 bg-white"
                sizes="480px"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none opacity-40" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 mt-8 h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div key={currentStepIndex} className="text-center">
            <div className="flex justify-center overflow-hidden flex-wrap">
              {STEPS[currentStepIndex].split("").map((char, ci) => (
                <motion.span
                  key={`${currentStepIndex}-${ci}`}
                  initial={{ opacity: 0, x: -5, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 5, filter: "blur(8px)" }}
                  transition={{ delay: ci * 0.04, duration: 0.2, ease: "easeOut" }}
                  className="text-black font-extrabold text-[16px] md:text-[20px] uppercase tracking-tighter font-pixel inline-block whitespace-pre"
                >
                  {char}
                </motion.span>
              ))}
            </div>
            <div className="w-full max-w-xs mx-auto h-0.5 bg-primary/10 mt-3 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 4, ease: "linear" }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export const ThreeSlideshow = memo(ThreeSlideshowComponent);
