"use client";

import React, { useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const IMAGES = PlaceHolderImages.filter((img) => img.id.startsWith("workspace")).slice(0, 12);

// Configuration for the 3D Perspective
const VISIBLE_COUNT = 9;
const CARD_WIDTH = 320; 
const DEPTH_STRENGTH = 900; 
const AUTO_ROTATION_SPEED = 0.0006;
const MOMENTUM_DAMPING = 0.96;

const ThreeSlideshowComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const rafIdRef = useRef<number>(0);

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

      const visibleSpan = 0.48; 
      const isVisible = Math.abs(focus) < visibleSpan;

      if (!isVisible) {
        card.style.opacity = "0";
        card.style.pointerEvents = "none";
        return;
      }

      const normalizedFocus = focus / visibleSpan; 
      
      // Calculate horizontal spread to join edges with 1px gap
      // The images join by calculating x as a function of their normalized position
      const x = focus * (window.innerWidth + CARD_WIDTH * 0.8);
      
      const z = (1 - Math.abs(normalizedFocus)) * -DEPTH_STRENGTH;
      const scaleBase = 0.45;
      const scaleGrowth = 1.45;
      const scale = scaleBase + Math.abs(normalizedFocus) * scaleGrowth;
      const rotateY = normalizedFocus * -55;

      const fadeDist = visibleSpan - Math.abs(focus);
      const opacity = Math.min(1, fadeDist * 15);

      // Isosceles Trapezoid Clip Path Logic
      let p1, p2, p3, p4, p5, p6, p7, p8;
      const trapAmount = Math.abs(normalizedFocus) * 32;

      if (normalizedFocus < 0) {
        // Left side: Outer is taller, inner is shorter
        p1 = 0; p2 = 0;
        p3 = 100; p4 = trapAmount;
        p5 = 100; p6 = 100 - trapAmount;
        p7 = 0; p8 = 100;
      } else {
        // Right side: Inner is shorter, outer is taller
        p1 = 0; p2 = trapAmount;
        p3 = 100; p4 = 0;
        p5 = 100; p6 = 100;
        p7 = 0; p8 = 100 - trapAmount;
      }

      const clipPath = `polygon(${p1}% ${p2}%, ${p3}% ${p4}%, ${p5}% ${p6}%, ${p7}% ${p8}%)`;

      card.style.opacity = opacity.toString();
      card.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
      card.style.zIndex = Math.round((1 - Math.abs(normalizedFocus)) * 100).toString();
      card.style.transform = `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`;
      card.style.clipPath = clipPath;
      // 1px gap is ensured by the combination of absolute position x and margin
      card.style.marginLeft = "0.5px";
      card.style.marginRight = "0.5px";
    });

    rafIdRef.current = requestAnimationFrame(updateCards);
  }, []);

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(updateCards);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [updateCards]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    lastMouseXRef.current = x;
    velocityRef.current = 0;
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const deltaX = x - lastMouseXRef.current;
    const rotationOffset = deltaX / (window.innerWidth * 0.7);
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
      
      {/* 3D Glassmorphic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] w-64 h-64 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/20 shadow-2xl rotate-12"
        />
        <motion.div 
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[12%] w-80 h-80 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 shadow-inner"
        />
        <div className="absolute top-[40%] right-[5%] w-32 h-32 bg-primary/5 backdrop-blur-xl rounded-2xl border border-white/10 -rotate-45" />
      </div>

      {/* Cinematic Header */}
      <div className="relative z-20 text-center mb-6 px-6 max-w-3xl">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-primary/40 font-bold text-[10px] uppercase tracking-[0.4em] mb-4"
        >
          Behind the Designs
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-[48px] md:text-[72px] font-extrabold text-black leading-none tracking-tighter font-headline mb-6 drop-shadow-sm"
        >
          Curious What Else<br />I&apos;ve Created?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          className="text-sm font-medium text-black max-w-md mx-auto leading-relaxed"
        >
          A seamless orbit through my latest architectural and digital prototypes.
        </motion.p>
      </div>

      {/* Full Screen 3D Perspective Stage */}
      <div 
        ref={containerRef}
        className="relative w-full h-[80vh] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-[3000px]"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {IMAGES.map((img, i) => (
            <div
              key={img.id}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="absolute bg-black will-change-transform overflow-hidden shadow-2xl"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `520px`,
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
                sizes="600px"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
              
              {/* Internal Card Text Reflection */}
              <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                 <p className="text-[10px] font-bold text-white uppercase tracking-widest">{img.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Perspective Guide Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0 flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
          <line x1="1000" y1="0" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
          <line x1="0" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
          <line x1="1000" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Static CTA Button */}
      <div className="relative z-20 mt-12">
        <button className="group flex items-center gap-4 bg-black text-white px-10 py-5 rounded-full font-bold text-[10px] hover:scale-105 transition-all shadow-2xl active:scale-95">
          See more Projects
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <span className="text-white text-[10px]">→</span>
          </div>
        </button>
      </div>
    </section>
  );
};

export const ThreeSlideshow = memo(ThreeSlideshowComponent);
