
"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
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
  
  // Handle circularity logic to ensure shortest distance
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;

  const absOffset = Math.abs(offset);
  
  // REVERSE PARABOLIC LOGIC:
  // Center (offset 0) is smallest. Ends are largest/longest.
  const scale = 1 + (absOffset * 0.15); 
  const horizontalSpacing = isMobile ? 180 : 340;
  const x = offset * horizontalSpacing;
  
  // Fading logic: Hide the jump by fading cards that are far from the center
  // If the absolute offset is close to half the total, it's about to wrap around.
  const fadeThreshold = (total / 2) - 0.5;
  const opacity = absOffset > fadeThreshold ? 0 : 1 - (absOffset * 0.15);

  return (
    <motion.div
      initial={false}
      animate={{
        x,
        scale,
        opacity: Math.max(opacity, 0),
        zIndex: Math.floor(10 - absOffset), // Higher z-index for outer cards to overlap center if needed
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 1,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[24px] overflow-hidden bg-white shadow-2xl border border-white/10 will-change-transform"
      style={{
        width: isMobile ? "160px" : "280px",
        height: isMobile ? "220px" : "420px",
      }}
    >
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        priority={absOffset < 2}
        className="object-cover"
        sizes="(max-width: 768px) 160px, 280px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
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
    <section className="relative py-48 bg-[#fdfdfd] overflow-hidden flex flex-col items-center">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(186,230,253,0.1)_0%,transparent_60%)]" />
      </div>

      {/* Header - Only Title */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-24 z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-[52px] font-extrabold text-black leading-tight tracking-tighter font-headline"
        >
          Curious What Else<br />I've Created?
        </motion.h2>
      </div>

      {/* Slideshow Container */}
      <div 
        className="relative h-[350px] md:h-[650px] w-full cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          className="relative w-full h-full flex items-center justify-center"
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
    </section>
  );
}
