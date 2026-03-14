
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function ThreeSlideshow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const images = PlaceHolderImages.filter(img => img.id.startsWith("workspace")).slice(0, 5);

  useEffect(() => {
    if (!containerRef.current || images.length === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / 800, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, 800);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const group = new THREE.Group();
    scene.add(group);

    const planeWidth = 6;
    const planeHeight = 8;
    const items: THREE.Mesh[] = [];

    // Create more items for seamless looping if needed, 
    // but for 5 images with 3s steps, we can just manage indices.
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

    camera.position.z = 18;

    let targetIndex = 0;
    let currentIndex = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Smooth movement towards the target index
      currentIndex += (targetIndex - currentIndex) * 0.04;

      items.forEach((mesh, i) => {
        // Handle looping logic for offset
        let offset = i - currentIndex;
        
        // Wrapped offset to ensure seamless looping visuals
        const halfLength = items.length / 2;
        if (offset > halfLength) offset -= items.length;
        if (offset < -halfLength) offset += items.length;
        
        // No gap: step matches width
        mesh.position.x = offset * planeWidth;
        
        // Depth curve: converge toward the center
        mesh.position.z = -Math.abs(offset) * 3;

        // Height scaling: "end pic being longer in height and decreasing till middle"
        // Middle (offset near 0) should be smaller, Ends (offset large) should be taller
        const heightScale = 0.8 + Math.abs(offset) * 0.5;
        mesh.scale.set(1, heightScale, 1);
        
        // Subtle rotation inward for perspective
        mesh.rotation.y = -offset * 0.15;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Auto-step logic: move to next image every 3 seconds
    const interval = setInterval(() => {
      targetIndex = (targetIndex + 1) % items.length;
    }, 3000);

    const handleResize = () => {
      camera.aspect = window.innerWidth / 800;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 800);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [images]);

  return (
    <div className="relative w-full py-32 bg-white overflow-hidden border-y border-black/5">
      {/* Header Section */}
      <div className="text-center mb-8 px-6">
        <h2 className="font-pixel text-2xl md:text-4xl font-bold text-black tracking-tighter uppercase">
          Curious What Else I've Created?
        </h2>
      </div>

      {/* 3D Container - Increased height */}
      <div ref={containerRef} className="w-full h-[800px] flex items-center justify-center cursor-grab active:cursor-grabbing" />
    </div>
  );
}
