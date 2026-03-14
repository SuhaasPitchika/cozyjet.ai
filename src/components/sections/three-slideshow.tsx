
"use client";

import React, { useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const IMAGES = PlaceHolderImages.filter((img) => img.id.startsWith("workspace")).slice(0, 12);

// Configuration for the 3D Parabola Perspective
const VISIBLE_COUNT = 9;
const CARD_WIDTH = 300; // Base width
const DEPTH_STRENGTH = 800; // How far back the center goes
const AUTO_ROTATION_SPEED = 0.0008; // Slower speed as requested
const MOMENTUM_DAMPING = 0.96;
const DRAG_SENSITIVITY = 150;

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

      // Calculate position in the circular loop
      const basePos = (i / total);
      let currentPos = (basePos + rotationRef.current) % 1;
      if (currentPos < 0) currentPos += 1;

      // Normalize focus: -0.5 to 0.5, where 0 is dead center
      let focus = currentPos - 0.5;
      if (focus > 0.5) focus -= 1;
      if (focus < -0.5) focus += 1;

      // Visible range: we want 9 cards to fill the screen
      const visibleSpan = 0.45; 
      const isVisible = Math.abs(focus) < visibleSpan;

      if (!isVisible) {
        card.style.opacity = "0";
        card.style.pointerEvents = "none";
        return;
      }

      // Parabolic calculation for the "Inward Semicircle"
      // normalizedFocus: -1 (left edge) to 0 (center) to 1 (right edge)
      const normalizedFocus = focus / visibleSpan; 
      
      // Horizontal spread
      const x = focus * (window.innerWidth + CARD_WIDTH);
      
      // Depth: Center (0) is deep in the screen (-DEPTH), Edges (1) are at the front (0)
      const z = (1 - Math.abs(normalizedFocus)) * -DEPTH_STRENGTH;

      // Scale: Middle is shortest/smallest, Ends are tallest/largest (zoomed out)
      // Center scale is small, Edge scale is large
      const scaleBase = 0.55;
      const scaleGrowth = 1.35;
      const scale = scaleBase + Math.abs(normalizedFocus) * scaleGrowth;
      
      // Rotation: Face inward toward the vanishing point
      const rotateY = normalizedFocus * -45;

      // Opacity: Fade out images as they exit the visible span
      const opacityThreshold = 0.35;
      const fadeDist = visibleSpan - Math.abs(focus);
      const opacity = Math.min(1, fadeDist * 12);

      // Trapezoid Clip Path: Inner side (closer to center) is shorter, Outer side is taller
      // This creates the "disturbed" joining effect requested
      let p1, p2, p3, p4, p5, p6, p7, p8;
      const trapAmount = Math.abs(normalizedFocus) * 25; // How aggressive the trapezoid is

      if (normalizedFocus < 0) {
        // Left side: Outer (left) is taller than inner (right)
        p1 = 0; p2 = 0; // Top-left
        p3 = 100; p4 = trapAmount; // Top-right (shorter)
        p5 = 100; p6 = 100 - trapAmount; // Bottom-right (shorter)
        p7 = 0; p8 = 100; // Bottom-left
      } else {
        // Right side: Outer (right) is taller than inner (left)
        p1 = 0; p2 = trapAmount; // Top-left (shorter)
        p3 = 100; p4 = 0; // Top-right
        p5 = 100; p6 = 100; // Bottom-right
        p7 = 0; p8 = 100 - trapAmount; // Bottom-left (shorter)
      }

      const clipPath = `polygon(${p1}% ${p2}%, ${p3}% ${p4}%, ${p5}% ${p6}%, ${p7}% ${p8}%)`;

      // Apply transformations directly to DOM for performance
      card.style.opacity = opacity.toString();
      card.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
      card.style.zIndex = Math.round((1 - Math.abs(normalizedFocus)) * 100).toString();
      card.style.transform = `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`;
      card.style.clipPath = clipPath;
      card.style.margin = "0 1px"; // Joins images with a tight 2px total gap
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
    const rotationOffset = deltaX / (window.innerWidth * 0.6);
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
    <section className="relative w-full min-h-screen bg-[#fdfaf5] overflow-hidden flex flex-col items-center justify-center py-20">
      {/* Cinematic Header */}
      <div className="relative z-20 text-center mb-2 px-6">
        <p className="text-primary/40 font-bold text-[10px] uppercase tracking-[0.3em] mb-4">Behind the Designs</p>
        <h2 className="text-[42px] md:text-[64px] font-extrabold text-black leading-none tracking-tighter font-headline mb-4">
          Curious What Else<br />I&apos;ve Created?
        </h2>
      </div>

      {/* Full Screen 3D Perspective Stage */}
      <div 
        ref={containerRef}
        className="relative w-full h-[75vh] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-[2500px]"
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
              className="absolute bg-black will-change-transform overflow-hidden shadow-2xl"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `500px`,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                transition: "none",
              }}
            >
              <Image
                src={img.imageUrl}
                alt={img.description}
                fill
                className="object-cover"
                sizes="600px"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Perspective Guide Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
          <line x1="1000" y1="0" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
          <line x1="0" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
          <line x1="1000" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Static CTA Button */}
      <div className="relative z-20 mt-8">
        <button className="group flex items-center gap-4 bg-black text-white px-8 py-4 rounded-full font-bold text-xs hover:scale-105 transition-all shadow-2xl">
          See more Projects
          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <span className="text-white text-[10px]">→</span>
          </div>
        </button>
      </div>
    </section>
  );
};

export const ThreeSlideshow = memo(ThreeSlideshowComponent);
