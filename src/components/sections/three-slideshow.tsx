
"use client";

import React, { useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const IMAGES = PlaceHolderImages.filter((img) => img.id.startsWith("workspace")).slice(0, 12);

// Configuration Constants
const MAJOR_AXIS = 700; // Half-width of the ellipse
const MINOR_AXIS = 200; // Half-depth of the ellipse
const CARD_WIDTH = 220;
const CARD_HEIGHT = 300;
const AUTO_ROTATION_SPEED = 0.003;
const DRAG_SENSITIVITY = 200;
const MOMENTUM_DAMPING = 0.95;

const ThreeSlideshowComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const rafIdRef = useRef<number>(0);

  // Helper: Linear Interpolation for polygons
  const interpolatePolygon = (t: number) => {
    // t ranges from -1 (back) to 1 (front)
    // We want to interpolate based on side-ness too
    const side = Math.sin(t * Math.PI); // Not quite right, let's use the actual theta
    return ""; // Will be handled inside the update loop for precision
  };

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

      const baseAngle = (i / total) * Math.PI * 2;
      const theta = baseAngle + rotationRef.current;

      // parametric coordinates
      const x = Math.sin(theta) * MAJOR_AXIS;
      const z = Math.cos(theta) * MINOR_AXIS;

      // Normalized Z position (-1 at back, 1 at front)
      const normZ = z / MINOR_AXIS; 
      const proximity = (normZ + 1) / 2; // 0 (back) to 1 (front)

      // Scale: 0.15 (back) to 1.0 (front)
      const scale = 0.15 + 0.85 * proximity;
      
      // Opacity: 0.2 to 1.0
      const opacity = 0.2 + 0.8 * proximity;

      // RotateY: Interpolate based on X position
      // At extremes (left/right), rotate significantly
      const normX = x / MAJOR_AXIS;
      const rotateY = normX * -50; // -50deg left, +50deg right

      // Z-Index
      const zIndex = Math.round(proximity * 100);

      // Trapezoid Clip-Path Interpolation
      // Front (proximity=1): rect (0 0, 100 0, 100 100, 0 100)
      // Edges (abs(normX) approx 1): trapezoid (0 0, 100 0, 82 100, 18 100)
      // Back (proximity=0): narrow (40 0, 60 0, 55 100, 45 100)
      
      let p1, p2, p3, p4, p5, p6, p7, p8;
      
      if (proximity > 0.5) {
        // Interp between Edge Trapezoid and Front Rectangle
        const t = (proximity - 0.5) * 2; // 0 at edge-ish, 1 at front
        const inset = 18 * (1 - t);
        p1 = 0; p2 = 0;
        p3 = 100; p4 = 0;
        p5 = 100 - inset; p6 = 100;
        p7 = inset; p8 = 100;
      } else {
        // Interp between Back Point and Edge Trapezoid
        const t = proximity * 2; // 0 at back, 1 at edge-ish
        const topInset = 50 * (1 - t) + 0 * t;
        const bottomInset = 50 * (1 - t) + 18 * t;
        p1 = topInset; p2 = 0;
        p3 = 100 - topInset; p4 = 0;
        p5 = 100 - bottomInset; p6 = 100;
        p7 = bottomInset; p8 = 100;
      }

      const clipPath = `polygon(${p1}% ${p2}%, ${p3}% ${p4}%, ${p5}% ${p6}%, ${p7}% ${p8}%)`;
      const borderRadius = 8 + 10 * proximity;
      const shadowBlur = 12 + 68 * proximity;
      const shadowOpacity = 0.08 + 0.17 * proximity;

      card.style.transform = `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`;
      card.style.zIndex = zIndex.toString();
      card.style.opacity = opacity.toString();
      card.style.clipPath = clipPath;
      card.style.borderRadius = `${borderRadius}px`;
      card.style.boxShadow = `0 ${shadowBlur/2}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity})`;
      
      // Update specular shine based on rotateY
      const shine = card.querySelector('.specular-shine') as HTMLElement;
      if (shine) {
        shine.style.transform = `translateX(${rotateY * 2}px)`;
      }
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
    const rotationOffset = deltaX / DRAG_SENSITIVITY;
    rotationRef.current += rotationOffset;
    velocityRef.current = rotationOffset;
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
    <section className="relative py-32 bg-white overflow-hidden flex flex-col items-center">
      {/* Perspective Guide Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center z-0">
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none">
              <line x1="0" y1="0" x2="500" y2="500" stroke="black" strokeWidth="2" />
              <line x1="1000" y1="0" x2="500" y2="500" stroke="black" strokeWidth="2" />
              <line x1="0" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="2" />
              <line x1="1000" y1="1000" x2="500" y2="500" stroke="black" strokeWidth="2" />
          </svg>
      </div>

      {/* Header Section */}
      <div className="relative text-center mb-16 z-20 max-w-2xl px-6">
        <p className="text-[#FF6B00] font-bold text-[13px] uppercase tracking-widest mb-4">Behind the Designs</p>
        <h2 className="text-[52px] font-extrabold text-black leading-[1.1] tracking-tighter font-headline mb-6">
          Curious What Else I've Created?
        </h2>
        <p className="text-muted-foreground text-[14px] max-w-[460px] mx-auto mb-10 leading-relaxed">
          A collection of digital products, brand identities, and autonomous systems built to push the boundaries of what's possible with AI.
        </p>
        <button className="group flex items-center gap-4 bg-black text-white px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-all mx-auto shadow-xl">
          See more Projects
          <div className="w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <span className="text-white text-xs">→</span>
          </div>
        </button>
      </div>

      {/* 3D Carousel Stage */}
      <div 
        className="relative w-full h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
      >
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transform: "rotateX(10deg)", transformStyle: "preserve-3d" }}
        >
          {IMAGES.map((img, i) => (
            <div
              key={img.id}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="absolute bg-white will-change-transform overflow-hidden"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <Image
                src={img.imageUrl}
                alt={img.description}
                fill
                className="object-cover"
                sizes="220px"
                loading="lazy"
              />
              {/* Specular Shine Overlay */}
              <div 
                className="specular-shine absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_70%)]" 
                style={{ willChange: 'transform' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Process Steps */}
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 max-w-5xl w-full px-6 z-20">
        {[
          { id: "#01", text: "Strategy & Planning" },
          { id: "#02", text: "Design & Development" },
          { id: "#03", text: "Launch & Growth" },
          { id: "#04", text: "Ongoing Support" },
        ].map((step) => (
          <div key={step.id} className="text-center">
            <p className="text-[#FF6B00] text-[12px] font-bold mb-1">{step.id}</p>
            <p className="text-muted-foreground text-[13px] font-medium">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export const ThreeSlideshow = memo(ThreeSlideshowComponent);
