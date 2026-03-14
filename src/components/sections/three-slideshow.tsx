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
  
  // HIGH-FIDELITY 3D PERSPECTIVE LOGIC:
  // Vanishing point in the middle (offset 0) - small focused rectangle.
  // Edges (absOffset > 0) - large trapezoids zooming in towards the user.
  
  // Scale increases as we move away from the center (reverse parabolic)
  // Center is smallest (~0.4), Edges grow significantly (~1.8)
  const baseScale = isMobile ? 0.4 : 0.45;
  const scale = baseScale + (Math.pow(absOffset, 1.5) * (isMobile ? 0.08 : 0.15)); 
  
  // Horizontal spacing
  const horizontalSpacing = isMobile ? 45 : 120;
  const x = offset * horizontalSpacing;
  
  // Perspective Shading & Opacity
  // Fade out cards approaching the wrap-around point to hide the jump
  const fadeThreshold = (total / 2) - 0.5;
  const opacity = absOffset > fadeThreshold ? 0 : 1;

  // Trapezoid effect using rotateY
  // Cards tilt inward toward the vanishing point (center)
  const rotateY = offset * (isMobile ? -18 : -35);
  
  // Depth effect: move edge cards forward closer to the screen (zoom in)
  // Center card (absOffset 0) has translateZ 0 (vanishing point)
  // Edge cards move forward aggressively (translateZ up to 800)
  const translateZ = Math.pow(absOffset, 2) * (isMobile ? 50 : 60);

  return (
    <motion.div
      initial={false}
      animate={{
        x,
        scale,
        opacity,
        rotateY,
        translateZ,
        zIndex: Math.floor(10 + absOffset), // Edge cards have higher z-index as they zoom closer
      }}
      transition={{
        type: "spring",
        stiffness: 140,
        damping: 30,
        mass: 1,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl md:rounded-[32px] overflow-hidden bg-white shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-white/40 will-change-transform"
      style={{
        width: isMobile ? "70px" : "160px",
        height: isMobile ? "100px" : "220px",
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
        sizes="(max-width: 768px) 70px, 160px"
      />
      {/* Perspective Shading Overlay: darker towards the edges to emphasize depth */}
      <motion.div 
        animate={{ opacity: (absOffset / total) * 0.4 }}
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

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 40;
    if (info.offset.x < -threshold) nextSlide();
    else if (info.offset.x > threshold) prevSlide();
  };

  return (
    <section className="relative pt-0 pb-0 bg-background flex flex-col items-center overflow-visible">
      {/* Section Header - Tighter spacing */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-[-40px] md:mb-[-100px] z-20 relative pointer-events-none">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-[54px] font-extrabold text-black leading-tight tracking-tighter font-headline uppercase"
        >
          Curious What Else<br />I've Created?
        </motion.h2>
      </div>

      {/* 3D Perspective Gallery Container - Reduced height */}
      <div 
        className="relative h-[400px] md:h-[650px] w-full cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ perspective: "3000px" }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Render exactly 9 images for the 3D grid as requested */}
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
