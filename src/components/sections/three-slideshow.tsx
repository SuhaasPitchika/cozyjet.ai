"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  
  // REVERSE PARABOLIC LOGIC:
  // Center (offset 0) is recessed and small. 
  // Ends (offset ±4) are largest and come forward.
  const scale = 1 + (absOffset * 0.18); 
  const horizontalSpacing = isMobile ? 120 : 260;
  const x = offset * horizontalSpacing;
  
  // Fading logic: Hide the wrap-around "jump" by fading cards that are at the edge of the screen
  const fadeThreshold = (total / 2) - 0.5;
  const opacity = absOffset > fadeThreshold ? 0 : 1;

  // Depth effect using translateZ and z-index
  const translateZ = absOffset * 120;

  return (
    <motion.div
      initial={false}
      animate={{
        x,
        scale,
        opacity,
        zIndex: Math.floor(10 + absOffset), 
        translateZ,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 25,
        mass: 1,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[32px] overflow-hidden bg-white shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-white/20 will-change-transform"
      style={{
        width: isMobile ? "140px" : "260px",
        height: isMobile ? "200px" : "400px",
        perspective: "1200px",
      }}
    >
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        priority={absOffset < 2}
        className="object-cover"
        sizes="(max-width: 768px) 140px, 260px"
      />
      {/* Subtle depth overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/15 pointer-events-none" />
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

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) nextSlide();
    else if (info.offset.x > threshold) prevSlide();
  };

  return (
    <section className="relative pt-0 pb-32 bg-background overflow-visible flex flex-col items-center">
      {/* Background Bluish Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(186,230,253,0.15)_0%,transparent_70%)] opacity-50" />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-0 z-10 relative">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-[52px] font-extrabold text-black leading-tight tracking-tighter font-headline"
        >
          Curious What Else<br />I've Created?
        </motion.h2>
      </div>

      {/* Slideshow Container - Reduced height and negative margin to tighten space */}
      <div 
        className="relative h-[400px] md:h-[650px] w-full cursor-grab active:cursor-grabbing md:-mt-12 -mt-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {CAROUSEL_IMAGES.slice(0, 9).map((img, i) => (
            <Card 
              key={img.id} 
              image={img} 
              index={i} 
              activeIndex={activeIndex} 
              total={Math.min(CAROUSEL_IMAGES.length, 9)} 
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
