"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function SkippyDots() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const { left, top } = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const dots = [];
  const rows = 20;
  const cols = 20;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({ r, c });
    }
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none opacity-20"
    >
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] h-full w-full">
        {dots.map((dot, i) => (
          <Dot i={i} key={i} springX={springX} springY={springY} />
        ))}
      </div>
    </div>
  );
}

function Dot({ i, springX, springY }: { i: number; springX: any; springY: any }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    return springX.on("change", (latestX: number) => {
      if (dotRef.current) {
        const latestY = springY.get();
        const { left, top, width, height } = dotRef.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        // Calculate distance from physical mouse (using offset logic)
        // Note: simplified for performance
        const dx = Math.abs(latestX - (i % 20) * 40 ); // approximate
        const dy = Math.abs(latestY - Math.floor(i / 20) * 40 );
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const newOpacity = Math.max(0, 1 - dist / 100);
        setOpacity(newOpacity);
      }
    });
  }, [i, springX, springY]);

  return (
    <div 
      ref={dotRef}
      className="w-1 h-1 rounded-full bg-slate-400 m-auto transition-opacity duration-300"
      style={{ opacity }}
    />
  );
}
