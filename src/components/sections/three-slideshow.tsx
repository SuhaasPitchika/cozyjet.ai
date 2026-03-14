"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  
  // REVERSE PERSPECTIVE LOGIC:
  // Center (offset 0) is smallest (vanishing point)
  // Edges grow significantly larger (zoom towards user)
  
  const baseWidth = isMobile ? 60 : 100;
  const baseHeight = isMobile ? 80 : 140;
  
  // Scale increases as we move away from the center (reverse parabolic)
  // Center is ~0.5, Edges grow to ~2.2
  const scale = 0.5 + (Math.pow(absOffset, 1.8) * (isMobile ? 0.15 : 0.25)); 
  
  // Rotation creates the "Trapezoid" shape via perspective projection
  // Cards tilt inward toward the center vanishing point
  const rotateY = offset * (isMobile ? -25 : -45);
  
  // Tight 2px visual gap calculation
  // We multiply by scale and account for the perspective tilt to keep them "joined"
  const horizontalSpacing = (baseWidth * 0.8) + 2; 
  const x = offset * horizontalSpacing;
  
  // Depth effect: Edge cards move forward aggressively (translateZ)
  const translateZ = Math.pow(absOffset, 2.5) * (isMobile ? 40 : 80);

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
        stiffness: 120,
        damping: 25,
        mass: 0.8,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white shadow-2xl border border-white/40 will-change-transform"
      style={{
        width: `${baseWidth}px`,
        height: `${baseHeight}px`,
        perspective: "1200px",
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
        sizes="(max-width: 768px) 60px, 100px"
      />
      {/* Perspective Shading: edges are darker to emphasize the depth/tilt */}
      <motion.div 
        animate={{ opacity: (absOffset / (total/2)) * 0.3 }}
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
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section className="relative pt-8 pb-16 bg-background flex flex-col items-center overflow-visible">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-0 z-20 relative pointer-events-none">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl md:text-3xl font-extrabold text-black leading-tight tracking-tighter font-headline uppercase"
        >
          Curious What Else<br />I've Created?
        </motion.h2>
      </div>

      {/* 3D Perspective Gallery Container */}
      <div 
        className="relative h-[300px] md:h-[450px] w-full mt-[-20px] md:mt-[-40px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ perspective: "2500px" }}
      >
        {/* Subtle Perspective Guide Lines (Hidden triangle-like effect) */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0L500 250L1000 0" stroke="black" strokeWidth="1" />
                <path d="M0 500L500 250L1000 500" stroke="black" strokeWidth="1" />
            </svg>
        </div>

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

      <div className="mt-8 flex gap-4 z-30">
        <button onClick={prevSlide} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
            ←
        </button>
        <button onClick={nextSlide} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
            →
        </button>
      </div>
    </section>
  );
}
