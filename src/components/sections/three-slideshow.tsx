
"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function ThreeSlideshow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const images = PlaceHolderImages.filter(img => img.id.startsWith("workspace")).slice(0, 5);
  
  // State for interaction
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!containerRef.current || images.length === 0) return;

    const scene = new THREE.Scene();
    // Soft white background with a hint of blue glow handled by CSS
    scene.background = null; 

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / 800, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, 800);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const group = new THREE.Group();
    scene.add(group);

    const planeWidth = 7;
    const planeHeight = 9;
    const radius = 12; // Radius of the circular loop
    const items: THREE.Mesh[] = [];

    images.forEach((img, i) => {
      const texture = textureLoader.load(img.imageUrl);
      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.DoubleSide,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
      items.push(mesh);
    });

    camera.position.z = 20;

    let rotationAngle = 0;
    let targetRotationAngle = 0;
    let isUserInteracting = false;
    let startX = 0;
    let startRotation = 0;

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Smooth interpolation
      rotationAngle += (targetRotationAngle - rotationAngle) * 0.05;

      items.forEach((mesh, i) => {
        // Calculate position on a circle
        const angle = (i / items.length) * Math.PI * 2 + rotationAngle;
        
        mesh.position.x = Math.sin(angle) * radius;
        mesh.position.z = Math.cos(angle) * radius - radius; // Pull back so it's in front of camera

        // Face the center/camera
        mesh.lookAt(new THREE.Vector3(0, 0, -radius));

        // Height scaling: taller at the ends (sides), shorter in the middle (center)
        // Center is when Math.sin(angle) is near 0. 
        // Sides are when Math.abs(Math.sin(angle)) is high.
        const lateralOffset = Math.abs(Math.sin(angle));
        const heightScale = 0.7 + lateralOffset * 0.6; 
        mesh.scale.set(1, heightScale, 1);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Interaction Handlers
    const onStart = (x: number) => {
      isUserInteracting = true;
      setIsDragging(true);
      startX = x;
      startRotation = targetRotationAngle;
    };

    const onMove = (x: number) => {
      if (!isUserInteracting) return;
      const dx = x - startX;
      targetRotationAngle = startRotation + (dx * 0.005);
    };

    const onEnd = () => {
      isUserInteracting = false;
      setIsDragging(false);
    };

    const handleMouseDown = (e: MouseEvent) => onStart(e.clientX);
    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const handleMouseUp = () => onEnd();

    const handleTouchStart = (e: TouchEvent) => onStart(e.touches[0].clientX);
    const handleTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX);
    const handleTouchEnd = () => onEnd();

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // Auto-step logic
    const interval = setInterval(() => {
      if (!isUserInteracting) {
        targetRotationAngle -= (Math.PI * 2) / items.length;
      }
    }, 4000);

    const handleResize = () => {
      camera.aspect = window.innerWidth / 800;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 800);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      clearInterval(interval);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [images]);

  return (
    <div className="relative w-full py-48 bg-white overflow-hidden border-y border-black/5">
      {/* Background Blue Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-sky-100 rounded-full blur-[160px]" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-center mb-16 px-6">
        <h2 className="font-pixel text-2xl md:text-4xl font-bold text-black tracking-tighter uppercase">
          Curious What Else I've Created?
        </h2>
      </div>

      {/* 3D Container */}
      <div 
        ref={containerRef} 
        className={`relative z-20 w-full h-[800px] flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} 
      />
    </div>
  );
}
