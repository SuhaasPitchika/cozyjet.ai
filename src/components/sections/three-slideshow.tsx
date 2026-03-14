
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
  
  // PERSPECTIVE LOGIC:
  // Center (offset 0) is smallest and furthest (receded).
  // Sides grow larger and rotate towards the viewer in trapezoid form.
  const baseScale = isMobile ? 0.8 : 1.0;
  const scale = baseScale + (absOffset * (isMobile ? 0.15 : 0.22)); 
  const horizontalSpacing = isMobile ? 90 : 220;
  const x = offset * horizontalSpacing;
  
  // Hide the wrap-around "jump" by fading cards that are at the edge
  const fadeThreshold = (total / 2) - 0.5;
  const opacity = absOffset > fadeThreshold ? 0 : 1;

  // Trapezoid effect using rotateY
  // Left cards rotate positive Y, Right cards rotate negative Y
  const rotateY = offset * (isMobile ? -8 : -15);
  
  // Depth effect: move larger edge cards forward
  const translateZ = absOffset * (isMobile ? 50 : 150);

  return (
    <motion.div
      initial={false}
      animate={{
        x,
        scale,
        opacity,
        rotateY,
        translateZ,
        zIndex: Math.floor(10 + absOffset), 
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 25,
        mass: 1,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[24px] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 will-change-transform"
      style={{
        width: isMobile ? "120px" : "240px",
        height: isMobile ? "180px" : "360px",
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        priority={absOffset < 2}
        className="object-cover"
        sizes="(max-width: 768px) 120px, 240px"
      />
      {/* Subtle vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10 pointer-events-none" />
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
    <section className="relative pt-0 pb-20 bg-background overflow-visible flex flex-col items-center">
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

      {/* Slideshow Container */}
      <div 
        className="relative h-[450px] md:h-[650px] w-full cursor-grab active:cursor-grabbing -mt-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ perspective: "1200px" }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
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
