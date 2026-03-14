
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function ThreeSlideshow() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, 600);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const group = new THREE.Group();
    scene.add(group);

    const items: THREE.Mesh[] = [];
    const images = PlaceHolderImages.filter(img => img.id.startsWith("workspace"));

    images.forEach((img, i) => {
      const texture = textureLoader.load(img.imageUrl);
      const geometry = new THREE.PlaneGeometry(3, 2);
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Parabolic Placement
      const t = (i / (images.length - 1)) * 2 - 1; // -1 to 1
      mesh.position.x = t * 10;
      mesh.position.y = -Math.pow(t, 2) * 2;
      mesh.position.z = -Math.abs(t) * 5;
      mesh.rotation.y = -t * 0.5;
      
      group.add(mesh);
      items.push(mesh);
    });

    // Particle field
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 40;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0xA36BEE });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 12;

    let time = 0;
    const animate = () => {
      time += 0.01;
      requestAnimationFrame(animate);
      
      group.position.x = Math.sin(time * 0.5) * 0.5;
      particlesMesh.rotation.y += 0.001;
      particlesMesh.position.y += 0.005;
      if (particlesMesh.position.y > 10) particlesMesh.position.y = -10;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / 600;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 600);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] bg-[#231F2A] overflow-hidden border-y border-white/5">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#231F2A] via-transparent to-[#231F2A] z-10" />
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-12 left-0 right-0 text-center z-20">
        <h2 className="font-headline text-2xl font-bold text-white/40">Our Agency Environments</h2>
      </div>
    </div>
  );
}
