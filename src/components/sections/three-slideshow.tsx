
"use client";

import React, { useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const IMAGES = PlaceHolderImages.filter((img) => img.id.startsWith("workspace")).slice(0, 12);

// Configuration for the 3D Perspective Ribbon
const CARD_WIDTH = 340; 
const DEPTH_STRENGTH = 1200; 
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

      // focus 0 is center, -0.5 is left, 0.5 is right
      let focus = currentPos - 0.5;
      if (focus > 0.5) focus -= 1;
      if (focus < -0.5) focus += 1;

      // Span of visibility across the perspective arc
      const visibleSpan = 0.45; 
      const isVisible = Math.abs(focus) < visibleSpan;

      if (!isVisible) {
        card.style.opacity = "0";
        card.style.pointerEvents = "none";
        return;
      }

      const normalizedFocus = focus / visibleSpan; 
      
      // Horizontal positioning - Spread factor increased to ensure background is visible between images
      const spreadFactor = 1.35;
      const x = focus * (window.innerWidth * spreadFactor);
      
      // Z-depth: Center is farthest (-DEPTH_STRENGTH), Ends are closest (0)
      const z = (1 - Math.abs(normalizedFocus)) * -DEPTH_STRENGTH;
      
      // Scale: Center is smallest (shortest), Ends are tallest (zoom in)
      const scaleBase = 0.35;
      const scaleGrowth = 1.6;
      const scale = scaleBase + Math.abs(normalizedFocus) * scaleGrowth;
      
      const rotateY = normalizedFocus * -65;

      // Visibility fade threshold
      const fadeDist = visibleSpan - Math.abs(focus);
      const opacity = Math.min(1, fadeDist * 12);

      // Trapezoid Clip Path Logic
      // As focus goes from 0 to 1, the "outer" edge stays full height relative to scale
      // while the "inner" edge is clipped to match the height of the next card in
      const trapAmount = Math.abs(normalizedFocus) * 28;

      let p1, p2, p3, p4, p5, p6, p7, p8;

      if (normalizedFocus < 0) {
        // Left side of screen: Left edge (outer) is taller, Right edge (inner) is shorter
        p1 = 0; p2 = 0;
        p3 = 100; p4 = trapAmount;
        p5 = 100; p6 = 100 - trapAmount;
        p7 = 0; p8 = 100;
      } else {
        // Right side of screen: Right edge (outer) is taller, Left edge (inner) is shorter
        p1 = 0; p2 = trapAmount;
        p3 = 100; p4 = 0;
        p5 = 100; p6 = 100;
        p7 = 0; p8 = 100 - trapAmount;
      }

      const clipPath = `polygon(${p1}% ${p2}%, ${p3}% ${p4}%, ${p5}% ${p6}%, ${p7}% ${p8}%)`;

      card.style.opacity = opacity.toString();
      card.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
      
      // Corrected Z-Index: Ensure edge images (higher zoom) are above inner images
      const zIndexValue = Math.round(Math.abs(normalizedFocus) * 100);
      card.style.zIndex = zIndexValue.toString();
      
      card.style.transform = `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`;
      card.style.clipPath = clipPath;
      
      // Added margin to ensure consistent spacing between frames where background is visible
      card.style.margin = "0 6px";
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
      
      {/* Cinematic Header */}
      <div className="relative z-20 text-center mb-12 px-6 max-w-3xl">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-[#f97316] font-bold text-[13px] uppercase tracking-[0.4em] mb-4"
        >
          Behind the Designs
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-[52px] md:text-[72px] font-extrabold text-black leading-none tracking-tighter font-headline mb-6 drop-shadow-sm"
        >
          Curious What Else<br />I&apos;ve Created?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          className="text-[14px] font-medium text-black/60 max-w-md mx-auto leading-relaxed mb-8"
        >
          Explore our latest architectural and digital prototypes through this seamless 3D elliptical ribbon.
        </motion.p>
        
        <button className="group flex items-center gap-4 bg-black text-white px-10 py-5 rounded-full font-bold text-[10px] hover:scale-105 transition-all shadow-2xl mx-auto">
          See more Projects
          <div className="w-6 h-6 bg-[#f97316] rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <span className="text-white text-[10px]">→</span>
          </div>
        </button>
      </div>

      {/* Full Screen 3D Perspective Stage */}
      <div 
        ref={containerRef}
        className="relative w-full h-[65vh] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-[2500px]"
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
              />
              {/* Specular Shine Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none opacity-40" />
            </div>
          ))}
        </div>
      </div>

      {/* Process Steps */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { id: "01", label: "Strategy & Planning" },
            { id: "02", label: "Design & Development" },
            { id: "03", label: "Launch & Growth" },
            { id: "04", label: "Ongoing Support" },
          ].map((step) => (
            <div key={step.id} className="text-center space-y-2">
              <span className="text-[#f97316] font-bold text-[12px] font-pixel tracking-widest">#{step.id}</span>
              <p className="text-black/60 font-medium text-[13px] uppercase tracking-tighter">{step.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Perspective Guide Lines (Subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0 flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
          <line x1="1000" y1="0" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
          <line x1="0" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
          <line x1="1000" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
        </svg>
      </div>
    </section>
  );
};

export const ThreeSlideshow = memo(ThreeSlideshowComponent);
