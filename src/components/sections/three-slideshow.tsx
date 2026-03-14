
"use client";

import React, { useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const IMAGES = PlaceHolderImages.filter((img) => img.id.startsWith("workspace")).slice(0, 12);

// Configuration for the 3D Parabola Perspective
const VISIBLE_COUNT = 9;
const CARD_WIDTH = 300; // Base width
const DEPTH_STRENGTH = 800; // How far back the center goes
const AUTO_ROTATION_SPEED = 0.002;
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
    const centerIndex = (VISIBLE_COUNT - 1) / 2; // 4 for VISIBLE_COUNT 9

    cards.forEach((card, i) => {
      if (!card) return;

      // Calculate the position relative to the continuous rotation
      // We map the array index to a 0-1 range around the loop
      const basePos = (i / total);
      const currentPos = (basePos + rotationRef.current) % 1;
      const wrappedPos = currentPos < 0 ? 1 + currentPos : currentPos;

      // Map wrappedPos to a "focus" range around the front-center
      // We want images to be visible primarily in the 9-slot view
      // Normalize focus: -0.5 to 0.5, where 0 is dead center
      let focus = wrappedPos - 0.5;
      if (focus > 0.5) focus -= 1;
      if (focus < -0.5) focus += 1;

      // We only show cards that are within the visible "U" span
      const visibleSpan = 0.45; // About 9 cards out of 12
      const isVisible = Math.abs(focus) < visibleSpan;

      if (!isVisible) {
        card.style.opacity = "0";
        card.style.pointerEvents = "none";
        return;
      }

      // Parabola Depth Calculation
      // focus: -0.45 to 0.45
      // x: horizontal position
      const x = focus * (window.innerWidth + 400); 
      
      // z: depth (parabola: z = x^2)
      // Center (focus=0) is farthest away (negative Z)
      // Edges (focus=±0.45) are closest to screen (0 Z)
      const normalizedFocus = focus / visibleSpan; // -1 to 1
      const zIndexBase = 1 - Math.abs(normalizedFocus); // 0 at edges, 1 at center
      const z = (1 - Math.abs(normalizedFocus)) * -DEPTH_STRENGTH;

      // Scale: Center is smallest, Edges are tallest (outwards)
      const scale = 0.5 + Math.abs(normalizedFocus) * 1.2;
      
      // Rotation: Face inward toward center
      const rotateY = normalizedFocus * -45;

      // Opacity: Fade out near the wrap-around point
      const opacity = Math.min(1, (visibleSpan - Math.abs(focus)) * 10);

      // Clip Path: Trapezoid logic
      // Center (normalizedFocus = 0): Rectangle
      // Edges: Outer side is taller than inner side
      let p1, p2, p3, p4, p5, p6, p7, p8;
      const trapAmount = Math.abs(normalizedFocus) * 20; // Max 20% vertical skew

      if (normalizedFocus < 0) {
        // Left side: Outer (left) is taller
        p1 = 0; p2 = 0;
        p3 = 100; p4 = trapAmount;
        p5 = 100; p6 = 100 - trapAmount;
        p7 = 0; p8 = 100;
      } else {
        // Right side: Outer (right) is taller
        p1 = 0; p2 = trapAmount;
        p3 = 100; p4 = 0;
        p5 = 100; p6 = 100;
        p7 = 0; p8 = 100 - trapAmount;
      }

      const clipPath = `polygon(${p1}% ${p2}%, ${p3}% ${p4}%, ${p5}% ${p6}%, ${p7}% ${p8}%)`;

      // Apply transformations
      card.style.opacity = opacity.toString();
      card.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
      card.style.zIndex = Math.round(Math.abs(normalizedFocus) * 100).toString();
      card.style.transform = `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`;
      card.style.clipPath = clipPath;
      card.style.margin = "0 1px"; // 2px total gap (1px on each side)
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
    const rotationOffset = deltaX / (window.innerWidth * 0.5);
    rotationRef.current -= rotationOffset; // Invert for natural drag
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
      {/* Perspective Guide Lines (Hidden Triangle Effect) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="500" y2="500" stroke="black" strokeWidth="1" />
          <line x1="1000" y1="0" x2="500" y2="500" stroke="black" strokeWidth="1" />
          <line x1="0" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="1" />
          <line x1="1000" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="1" />
          <rect x="450" y="450" width="100" height="100" fill="none" stroke="black" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Header Content */}
      <div className="relative z-20 text-center mb-4 max-w-2xl px-6">
        <p className="text-primary/40 font-bold text-[10px] uppercase tracking-[0.3em] mb-4">Behind the Designs</p>
        <h2 className="text-[42px] md:text-[64px] font-extrabold text-black leading-none tracking-tighter font-headline mb-6">
          Curious What Else<br />I&apos;ve Created?
        </h2>
        <button className="group flex items-center gap-4 bg-black text-white px-8 py-4 rounded-full font-bold text-xs hover:scale-105 transition-all mx-auto shadow-2xl">
          See more Projects
          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <span className="text-white text-[10px]">→</span>
          </div>
        </button>
      </div>

      {/* 3D Parabola Carousel Stage */}
      <div 
        className="relative w-full h-[70vh] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-[2000px]"
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
                sizes="400px"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Steps */}
      <div className="relative z-20 mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-24 max-w-6xl w-full px-12 border-t border-black/5 pt-12">
        {[
          { id: "#01", text: "Strategy & Planning" },
          { id: "#02", text: "Design & Development" },
          { id: "#03", text: "Launch & Growth" },
          { id: "#04", text: "Ongoing Support" },
        ].map((step) => (
          <div key={step.id} className="text-center group">
            <p className="text-primary/30 text-[10px] font-bold mb-2 tracking-widest group-hover:text-primary transition-colors">{step.id}</p>
            <p className="text-black/60 text-[11px] font-bold uppercase tracking-tighter">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export const ThreeSlideshow = memo(ThreeSlideshowComponent);
