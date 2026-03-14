
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CAPTIONS = [
  { id: "01", title: "Strategy & Planning" },
  { id: "02", title: "Design & Development" },
  { id: "03", title: "Launch & Growth" },
  { id: "04", title: "Ongoing Support" },
  { id: "05", title: "Viral Optimization" },
];

export function ThreeSlideshow() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / 500, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, 500);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const group = new THREE.Group();
    scene.add(group);

    const items: THREE.Mesh[] = [];
    const images = PlaceHolderImages.filter(img => img.id.startsWith("workspace")).slice(0, 5);

    images.forEach((img, i) => {
      const texture = textureLoader.load(img.imageUrl);
      // Card aspect ratio: 3:4 for vertical feel
      const geometry = new THREE.PlaneGeometry(2.5, 3.5);
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.DoubleSide,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Parabolic Placement like the reference image
      const count = images.length;
      const t = (i / (count - 1)) * 2 - 1; // -1 to 1
      
      mesh.position.x = t * 7.5;
      mesh.position.y = -Math.pow(t, 2) * 1.5;
      mesh.position.z = -Math.abs(t) * 4;
      mesh.rotation.y = -t * 0.6;
      
      group.add(mesh);
      items.push(mesh);
    });

    camera.position.z = 10;
    camera.position.y = 1;

    let time = 0;
    const animate = () => {
      time += 0.005;
      requestAnimationFrame(animate);
      
      // Subtle floating movement
      items.forEach((mesh, i) => {
        mesh.position.y += Math.sin(time + i) * 0.002;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / 500;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 500);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full py-24 bg-white overflow-hidden border-y border-black/5">
      {/* Header Section */}
      <div className="text-center mb-16 px-6">
        <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Behind the Designs</p>
        <h2 className="font-headline text-3xl md:text-5xl font-bold text-black mb-6 tracking-tight">
          Curious What Else I've <br /> Created?
        </h2>
        <p className="text-black/40 text-[10px] max-w-lg mx-auto uppercase leading-relaxed mb-8">
          Explore more brand identities, packaging, and digital design work <br className="hidden md:block" /> in my extended portfolio.
        </p>
        <Button variant="outline" className="rounded-full px-8 h-12 border-black/10 group">
          See more Projects
          <div className="ml-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
             <ArrowRight className="w-3 h-3 text-white" />
          </div>
        </Button>
      </div>

      {/* 3D Container */}
      <div ref={containerRef} className="w-full h-[500px] cursor-grab active:cursor-grabbing" />

      {/* Bottom Captions Section */}
      <div className="max-w-6xl mx-auto px-12 mt-8">
        <div className="flex justify-between items-start">
          {CAPTIONS.map((cap) => (
            <div key={cap.id} className="text-center space-y-1 group">
               <p className="text-primary text-[10px] font-bold">#{cap.id}</p>
               <p className="text-black/60 text-[8px] font-medium uppercase tracking-tighter group-hover:text-black transition-colors">
                 {cap.title}
               </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
