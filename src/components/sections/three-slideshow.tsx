"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";

const CAROUSEL_IMAGES = PlaceHolderImages.filter((img) => img.id.startsWith("workspace"));

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
  
  // Circular wrap logic to find shortest path for the loop
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;

  const absOffset = Math.abs(offset);
  
  // REVERSE PERSPECTIVE LOGIC:
  // Center (offset 0) is a small, focused rectangle receding into the depth.
  // Edge images grow aggressively larger (trapezoid) and zoom towards the viewer.
  
  // Scale increases significantly as we move away from the center
  const baseScale = isMobile ? 0.5 : 0.65;
  const scale = baseScale + (absOffset * (isMobile ? 0.15 : 0.28)); 
  
  // Horizontal spacing
  const horizontalSpacing = isMobile ? 60 : 210;
  const x = offset * horizontalSpacing;
  
  // Perspective Shading & Opacity
  // We fade cards that are at the edge to hide the jump
  const fadeThreshold = (total / 2) - 0.4;
  const opacity = absOffset > fadeThreshold ? 0 : 1;

  // Trapezoid effect using rotateY
  // Cards at edges rotate inward to create the perspective drawing effect
  const rotateY = offset * (isMobile ? -18 : -35);
  
  // Depth effect: move larger edge cards forward closer to the screen (zoom in)
  // Center card (absOffset 0) has translateZ 0 (receded)
  const translateZ = absOffset * (isMobile ? 120 : 450);

  return (
    <motion.div
      initial={false}
      animate={{
        x,
        scale,
        opacity,
        rotateY,
        translateZ,
        zIndex: Math.floor(10 + absOffset), // Edge cards on top as they are closer to user
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 24,
        mass: 1,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px] md:rounded-[48px] overflow-hidden bg-white shadow-[0_40px_80px_rgba(0,0,0,0.3)] border border-white/40 will-change-transform"
      style={{
        width: isMobile ? "110px" : "280px",
        height: isMobile ? "150px" : "400px",
        perspective: "2000px",
        transformStyle: "preserve-3d",
      }}
    >
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        priority={absOffset < 3}
        className="object-cover"
        sizes="(max-width: 768px) 110px, 280px"
      />
      {/* Dynamic shading based on distance from center */}
      <motion.div 
        animate={{ opacity: (1 - (absOffset / total)) * 0.15 }}
        className="absolute inset-0 bg-black/50 pointer-events-none" 
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

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 30;
    if (info.offset.x < -threshold) nextSlide();
    else if (info.offset.x > threshold) prevSlide();
  };

  return (
    <section className="relative pt-0 pb-12 bg-background flex flex-col items-center overflow-visible">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-0 z-10 relative">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-[56px] font-extrabold text-black leading-tight tracking-tighter font-headline"
        >
          Curious What Else<br />I've Created?
        </motion.h2>
      </div>

      {/* 3D Perspective Gallery Container */}
      <div 
        className="relative h-[550px] md:h-[850px] w-full cursor-grab active:cursor-grabbing -mt-10 md:-mt-20"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ perspective: "2500px" }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Ensure 9 images are rendered for the panoramic view */}
          {CAROUSEL_IMAGES.slice(0, 9).map((img, i) => (
            <Card 
              key={img.id} 
              image={img} 
              index={i} 
              activeIndex={activeIndex} 
              total={9} 
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
