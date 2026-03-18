"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Html } from "@react-three/drei";
import * as THREE from "three";

interface SkippyCharacterProps {
  isActive?: boolean;
  size?: "small" | "medium" | "large";
}

function SkippyBot({ isActive = false, size = "medium" }: { isActive: boolean; size: "small" | "medium" | "large" }) {
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  
  const sizes = {
    small: 0.8,
    medium: 1.2,
    large: 1.8,
  };
  
  const scale = sizes[size];

  useFrame((state) => {
    if (eyeLeftRef.current && eyeRightRef.current) {
      // Make eyes look around
      const t = state.clock.getElapsedTime();
      eyeLeftRef.current.position.x = Math.sin(t * 0.5) * 0.05;
      eyeRightRef.current.position.x = Math.sin(t * 0.5 + 0.5) * 0.05;
    }
  });

  const bodyColor = isActive ? "#8c6b4f" : "#d9d6d1";
  const accentColor = isActive ? "#f59e0b" : "#9ca3af";

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main body - sphere with distortion */}
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={bodyColor}
          attach="material"
          distort={isActive ? 0.3 : 0.1}
          speed={isActive ? 2 : 0.5}
          roughness={0.3}
          metalness={0.1}
        />
      </Sphere>

      {/* Eyes container */}
      <group position={[0, 0.2, 0.85]}>
        {/* Left eye white */}
        <Sphere args={[0.25, 32, 32]} position={[-0.25, 0, 0]}>
          <meshStandardMaterial color="white" />
        </Sphere>
        
        {/* Right eye white */}
        <Sphere args={[0.25, 32, 32]} position={[0.25, 0, 0]}>
          <meshStandardMaterial color="white" />
        </Sphere>
        
        {/* Left pupil */}
        <Sphere ref={eyeLeftRef} args={[0.12, 16, 16]} position={[-0.25, 0, 0.18]}>
          <meshStandardMaterial color={isActive ? "#1e293b" : "#64748b"} />
        </Sphere>
        
        {/* Right pupil */}
        <Sphere ref={eyeRightRef} args={[0.12, 16, 16]} position={[0.25, 0, 0.18]}>
          <meshStandardMaterial color={isActive ? "#1e293b" : "#64748b"} />
        </Sphere>
        
        {/* Eye shine */}
        <Sphere args={[0.05, 8, 8]} position={[-0.2, 0.08, 0.28]}>
          <meshBasicMaterial color="white" />
        </Sphere>
        <Sphere args={[0.05, 8, 8]} position={[0.3, 0.08, 0.28]}>
          <meshBasicMaterial color="white" />
        </Sphere>
      </group>

      {/* Antenna */}
      <group position={[0, 1.1, 0]}>
        <Sphere args={[0.08, 16, 16]} position={[0, 0.15, 0]}>
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} />
        </Sphere>
        <Sphere args={[0.15, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color={bodyColor} />
        </Sphere>
      </group>

      {/* Mouth - subtle smile when active */}
      {isActive && (
        <group position={[0, -0.3, 0.8]}>
          <Sphere args={[0.15, 16, 16, 0, Math.PI]} rotation={[0, Math.PI, 0]}>
            <meshStandardMaterial color="#1e293b" side={THREE.DoubleSide} />
          </Sphere>
        </group>
      )}

      {/* Floating particles when active */}
      {isActive && (
        <group>
          {[...Array(6)].map((_, i) => (
            <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <Sphere args={[0.05, 8, 8]} position={[
                Math.cos((i / 6) * Math.PI * 2) * 1.5,
                Math.sin(i * 1.5) * 0.5,
                Math.sin((i / 6) * Math.PI * 2) * 1.5
              ]}>
                <meshStandardMaterial 
                  color="#f59e0b" 
                  emissive="#f59e0b" 
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.8}
                />
              </Sphere>
            </Float>
          ))}
        </group>
      )}
    </group>
  );
}

function Lights({ isActive }: { isActive: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color={isActive ? "#f59e0b" : "#ffffff"} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8c6b4f" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
      />
    </>
  );
}

export function Skippy3DCharacter({ isActive = false, size = "medium" }: SkippyCharacterProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Lights isActive={isActive} />
        <Float
          speed={isActive ? 2 : 1}
          rotationIntensity={isActive ? 0.5 : 0.2}
          floatIntensity={isActive ? 0.8 : 0.3}
        >
          <SkippyBot isActive={isActive} size={size} />
        </Float>
      </Canvas>
    </div>
  );
}

// Export a simple SVG fallback for when R3F fails to load
export function SkippyCharacterFallback({ isActive = false, size = "medium" }: SkippyCharacterProps) {
  const sizes = {
    small: 48,
    medium: 80,
    large: 120,
  };
  
  const dimension = sizes[size];
  
  return (
    <div 
      style={{ 
        width: dimension, 
        height: dimension,
        borderRadius: "50%",
        background: isActive ? "linear-gradient(135deg, #8c6b4f 0%, #6b523c 100%)" : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isActive ? "0 0 20px rgba(245, 158, 11, 0.5)" : "none",
      }}
    >
      <svg 
        width={dimension * 0.5} 
        height={dimension * 0.5} 
        viewBox="0 0 24 24" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill={isActive ? "#f59e0b" : "#9ca3af"} />
        <circle cx="8.5" cy="10" r="2" fill="white" />
        <circle cx="15.5" cy="10" r="2" fill="white" />
        <circle cx="8.5" cy="10" r="1" fill={isActive ? "#1e293b" : "#64748b"} />
        <circle cx="15.5" cy="10" r="1" fill={isActive ? "#1e293b" : "#64748b"} />
      </svg>
    </div>
  );
}

export default Skippy3DCharacter;
