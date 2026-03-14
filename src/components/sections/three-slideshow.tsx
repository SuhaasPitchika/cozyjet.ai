
"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";

const CAROUSEL_IMAGES = PlaceHolderImages.filter((img) => img.id.startsWith("workspace")).slice(0, 9);

const Card = memo(({ 
  image, 
  index, 
  activeIndex, 
  total 
}: { 
  image: any; 
  index: number; 
  activeIndex: number; 
  total: number 
}) => {
  const isMobile = useIsMobile();
  
  // Calculate circular offset relative to active index
  let offset = index - activeIndex;
  
  // Circular wrap logic for a seamless 9-image loop
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;

  const absOffset = Math.abs(offset);
  
  // Base dimensions for full-screen feel
  const baseWidth = isMobile ? 120 : 280;
  const baseHeight = isMobile ? 180 : 420;
  
  // Scale logic: Center is smallest (vanishing point), edges grow massive (zoom in)
  // Center is ~0.4, Edges grow to ~1.8
  const scale = 0.4 + (Math.pow(absOffset, 1.5) * (isMobile ? 0.3 : 0.45)); 
  
  // Rotation creates the inward trapezoid tilt
  const rotateY = offset * (isMobile ? -20 : -35);
  
  // Tight 2px visual gap calculation
  const horizontalSpacing = (baseWidth * 0.7) + 2; 
  const x = offset * horizontalSpacing;
  
  // Depth effect: Edge cards move forward aggressively towards the user
  const translateZ = Math.pow(absOffset, 2.2) * (isMobile ? 100 : 250);

  // Hidden transition logic: fade out at the boundaries to hide the loop jump
  const fadeThreshold = (total / 2) - 0.5;
  const opacity = absOffset > fadeThreshold ? 0 : 1;

  return (
    <motion.div
      initial={false}
      animate={{
        x,
        scale,
        opacity,
        rotateY,
        translateZ,
        zIndex: Math.floor(absOffset * 10), // Outer cards sit on top as they zoom in
      }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 20,
        mass: 1,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-white/40 will-change-transform"
      style={{
        width: `${baseWidth}px`,
        height: `${baseHeight}px`,
        perspective: "2000px",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
    >
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        priority={absOffset < 3}
        className="object-cover"
        sizes="(max-width: 768px) 120px, 280px"
      />
      {/* Perspective Shading: edges are darker to emphasize the depth/tilt */}
      <motion.div 
        animate={{ opacity: (absOffset / (total/2)) * 0.4 }}
        className="absolute inset-0 bg-black pointer-events-none" 
      />
    </motion.div>
  );
});

Card.displayName = "CarouselCard";

export function ThreeSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 3500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section className="relative h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Perspective Guide Lines (Hidden triangle effect) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center z-0">
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="0" x2="500" y2="500" stroke="black" strokeWidth="2" />
              <line x1="1000" y1="0" x2="500" y2="500" stroke="black" strokeWidth="2" />
              <line x1="0" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="2" />
              <line x1="1000" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="2" />
              <line x1="500" y1="0" x2="500" y2="1000" stroke="black" strokeWidth="1" />
              <line x1="0" y1="500" x2="1000" y2="500" stroke="black" strokeWidth="1" />
          </svg>
      </div>

      {/* Section Header */}
      <div className="absolute top-12 left-0 right-0 px-6 text-center z-20 pointer-events-none">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-5xl font-extrabold text-black leading-tight tracking-tighter font-headline uppercase"
        >
          The Collective Vision
        </motion.h2>
        <p className="font-pixel text-[10px] text-black/40 mt-2 uppercase tracking-[0.2em]">
          Explore the immersive 3D workspace gallery
        </p>
      </div>

      {/* 3D Perspective Gallery Container */}
      <div 
        className="relative w-full h-full flex-1 flex items-center justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ perspective: "3000px" }}
      >
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {CAROUSEL_IMAGES.map((img, i) => (
            <Card 
              key={img.id} 
              image={img} 
              index={i} 
              activeIndex={activeIndex} 
              total={CAROUSEL_IMAGES.length} 
            />
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 flex gap-6 z-30">
        <button 
          onClick={prevSlide} 
          className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center bg-white/50 backdrop-blur-md hover:bg-black hover:text-white transition-all hover:scale-110 active:scale-90"
        >
            ←
        </button>
        <button 
          onClick={nextSlide} 
          className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center bg-white/50 backdrop-blur-md hover:bg-black hover:text-white transition-all hover:scale-110 active:scale-90"
        >
            →
        </button>
      </div>
    </section>
  );
}
