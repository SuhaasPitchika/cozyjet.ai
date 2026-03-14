
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function ThreeSlideshow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const images = PlaceHolderImages.filter(img => img.id.startsWith("workspace")).slice(0, 5);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, 600);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const group = new THREE.Group();
    scene.add(group);

    const items: THREE.Mesh[] = [];

    images.forEach((img, i) => {
      const texture = textureLoader.load(img.imageUrl);
      // Base plane geometry
      const geometry = new THREE.PlaneGeometry(3, 4);
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.DoubleSide,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
      items.push(mesh);
    });

    camera.position.z = 15;

    let targetIndex = 0;
    let currentIndex = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Smooth movement towards the target index
      currentIndex += (targetIndex - currentIndex) * 0.05;

      items.forEach((mesh, i) => {
        const offset = i - currentIndex;
        
        // Stable horizontal position based on relative offset
        mesh.position.x = offset * 4.5;
        
        // Depth curve: converge toward the center
        mesh.position.z = -Math.abs(offset) * 2;

        // "end pic being longer in height and decreasing till middle from both sides"
        // Scale increases as offset increases (further from middle)
        const heightScale = 1.0 + Math.abs(offset) * 0.4;
        const widthScale = 1.0; 
        
        mesh.scale.set(widthScale, heightScale, 1);
        
        // Vertical shift to keep them roughly aligned at the bottom or middle
        mesh.position.y = (heightScale - 1) * 0.5;

        // Subtle rotation inward
        mesh.rotation.y = -offset * 0.1;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Auto-step logic: stop on each carousel for 3 seconds
    const interval = setInterval(() => {
      targetIndex = (targetIndex + 1) % items.length;
    }, 3000);

    const handleResize = () => {
      camera.aspect = window.innerWidth / 600;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 600);
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
  }, [images.length]);

  return (
    <div className="relative w-full py-48 bg-white overflow-hidden border-y border-black/5">
      {/* Header Section */}
      <div className="text-center mb-12 px-6">
        <h2 className="font-pixel text-xl md:text-3xl font-bold text-black tracking-tighter uppercase">
          Curious What Else I've Created?
        </h2>
      </div>

      {/* 3D Container */}
      <div ref={containerRef} className="w-full h-[600px] flex items-center justify-center" />
    </div>
  );
}
