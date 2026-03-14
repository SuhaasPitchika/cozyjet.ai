
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
  
  // Circular wrap logic to find shortest path
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;

  const absOffset = Math.abs(offset);
  
  // REVERSE PERSPECTIVE LOGIC:
  // Center (offset 0) is smallest and furthest (receded rectangle).
  // Sides grow larger (trapezoid) and move towards the viewer.
  
  const baseScale = isMobile ? 0.7 : 0.9;
  // Scale increases as we move away from the center
  const scale = baseScale + (absOffset * (isMobile ? 0.12 : 0.18)); 
  
  // Horizontal spacing
  const horizontalSpacing = isMobile ? 70 : 180;
  const x = offset * horizontalSpacing;
  
  // Hide the wrap-around "jump" by fading cards that are at the edge
  // This ensures the loop happens in a "hidden layer"
  const fadeThreshold = (total / 2) - 0.5;
  const opacity = absOffset > fadeThreshold ? 0 : 1;

  // Trapezoid effect using rotateY
  // Left cards rotate towards center, Right cards rotate towards center
  // This creates the perspective drawing look
  const rotateY = offset * (isMobile ? -10 : -22);
  
  // Depth effect: move larger edge cards forward (higher translateZ)
  const translateZ = absOffset * (isMobile ? 60 : 180);

  return (
    <motion.div
      initial={false}
      animate={{
        x,
        scale,
        opacity,
        rotateY,
        translateZ,
        zIndex: Math.floor(10 + absOffset), // Edge cards on top as they are closer
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 30,
        mass: 1,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[12px] md:rounded-[24px] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/40 will-change-transform"
      style={{
        width: isMobile ? "110px" : "220px",
        height: isMobile ? "160px" : "320px",
        perspective: "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        priority={absOffset < 3}
        className="object-cover"
        sizes="(max-width: 768px) 110px, 220px"
      />
      {/* Subtle vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20 pointer-events-none" />
      
      {/* Perspective Shading */}
      <motion.div 
        animate={{ opacity: absOffset * 0.1 }}
        className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity" 
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
    const threshold = 50;
    if (info.offset.x < -threshold) nextSlide();
    else if (info.offset.x > threshold) prevSlide();
  };

  return (
    <section className="relative pt-0 pb-10 bg-background overflow-visible flex flex-col items-center">
      {/* Header - Tightened Spacing */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-0 z-10 relative">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-[52px] font-extrabold text-black leading-tight tracking-tighter font-headline"
        >
          Curious What Else<br />I've Created?
        </motion.h2>
      </div>

      {/* Slideshow Container - Height adjusted for zoomed edge cards */}
      <div 
        className="relative h-[400px] md:h-[600px] w-full cursor-grab active:cursor-grabbing -mt-4 md:-mt-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ perspective: "1500px" }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Render 9 images in one view */}
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
