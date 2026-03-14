
"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Calculate offset relative to active index
  let offset = index - activeIndex;
  
  // Handle circular wrapping for offset calculation
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;

  const isCenter = offset === 0;
  
  // Responsive values
  const cardWidth = isMobile ? 140 : 200;
  const cardHeight = isMobile ? 200 : 280;
  const horizontalSpacing = isMobile ? 120 : 220;
  const zStep = isMobile ? -60 : -100;
  const rotationStep = isMobile ? 25 : 18;

  // Parabolic positioning logic
  const x = offset * horizontalSpacing;
  const z = Math.abs(offset) * zStep;
  const rotateY = offset * -rotationStep;
  const scale = 1 - Math.abs(offset) * 0.12;
  const opacity = 1 - Math.abs(offset) * 0.25;

  // Parallax handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isCenter) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const moveX = (e.clientX - centerX) / (rect.width / 2);
    const moveY = (e.clientY - centerY) / (rect.height / 2);
    
    cardRef.current.style.transform = `
      translateX(${x}px) 
      translateZ(${z}px) 
      rotateY(${rotateY + moveX * 8}deg) 
      rotateX(${-moveY * 8}deg) 
      scale(${scale})
    `;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = "transform 0.4s ease-out";
    cardRef.current.style.transform = `
      translateX(${x}px) 
      translateZ(${z}px) 
      rotateY(${rotateY}deg) 
      scale(${scale})
    `;
    setTimeout(() => {
      if (cardRef.current) cardRef.current.style.transition = "";
    }, 400);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={false}
      animate={{
        x,
        z,
        rotateY,
        scale,
        opacity: Math.max(opacity, 0.1),
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 30,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px] overflow-hidden bg-white cursor-pointer will-change-transform"
      style={{
        width: cardWidth,
        height: cardHeight,
        boxShadow: isCenter 
          ? "0 32px 80px rgba(0,0,0,0.28)" 
          : "0 20px 60px rgba(0,0,0,0.18)",
        zIndex: 10 - Math.abs(offset),
      }}
    >
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        loading="lazy"
        className="object-cover"
      />
      {/* Bottom Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/18 to-transparent pointer-events-none" />
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
    const threshold = 60;
    if (info.offset.x < -threshold) nextSlide();
    else if (info.offset.x > threshold) prevSlide();
  };

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-20">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block text-[#FF6B00] text-xs font-bold uppercase tracking-[0.2em] mb-6 font-headline"
        >
          Behind the Designs
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-[52px] font-extrabold text-black leading-[1.1] tracking-tight mb-8 font-headline max-w-3xl mx-auto"
        >
          Curious What Else<br />I've Created?
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm text-[#888] max-w-[480px] mx-auto mb-10 leading-relaxed font-headline"
        >
          Explore a curated selection of autonomous workspace prototypes, 
          VFX workflows, and generative design experiments.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-4 bg-white border border-[#EEE] rounded-full pl-6 pr-2 py-2 text-[13px] font-bold text-black transition-all shadow-sm font-headline"
        >
          See more Projects
          <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </motion.button>
      </div>

      {/* 3D Carousel Container */}
      <div 
        className="relative h-[400px] md:h-[600px] w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ perspective: isMobile ? "800px" : "1200px" }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="relative w-full h-full flex items-center justify-center transform-gpu"
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

      {/* Process Steps */}
      <div className="max-w-4xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {[
            { id: "01", label: "Concept Design" },
            { id: "02", label: "Agent Logic" },
            { id: "03", label: "Vector Growth" },
            { id: "04", label: "Final Studio" }
          ].map((step) => (
            <div key={step.id} className="text-center md:text-left">
              <span className="block text-[12px] font-bold text-[#FF6B00] mb-2 font-headline">#{step.id}</span>
              <p className="text-[13px] text-[#888] font-medium font-headline">{step.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
