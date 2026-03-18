"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Html, Trail, Sparkles, useTexture, Environment } from "@react-three/drei";
import * as THREE from "three";

interface SkippyCharacterProps {
  isActive?: boolean;
  size?: "small" | "medium" | "large";
}

// Skippy - The Observant Owl-like AI
// Smart, watchful, with big eyes that observe everything
function SkippyBot({ isActive = false, size = "medium" }: { isActive: boolean; size: "small" | "medium" | "large" }) {
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  
  const sizes = { small: 0.7, medium: 1.0, large: 1.5 };
  const scale = sizes[size];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Eye tracking - look around curiously
    if (eyeLeftRef.current && eyeRightRef.current) {
      const lookX = Math.sin(t * 0.8) * 0.08;
      const lookY = Math.cos(t * 0.5) * 0.03;
      eyeLeftRef.current.position.x = -0.22 + lookX;
      eyeLeftRef.current.position.y = 0.15 + lookY;
      eyeRightRef.current.position.x = 0.22 + lookX;
      eyeRightRef.current.position.y = 0.15 + lookY;
    }
    
    // Subtle breathing animation
    if (groupRef.current) {
      groupRef.current.scale.y = 1 + Math.sin(t * 1.5) * 0.02;
    }
    
    // Wing flap when active
    if (leftWingRef.current && rightWingRef.current && isActive) {
      leftWingRef.current.rotation.z = Math.sin(t * 4) * 0.15;
      rightWingRef.current.rotation.z = -Math.sin(t * 4) * 0.15;
    }
  });

  const bodyColor = isActive ? "#7c5c3d" : "#c9b8a8";
  const accentColor = isActive ? "#fbbf24" : "#a8a29e";
  const eyeColor = isActive ? "#1e3a5f" : "#64748b";

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main body - owl-like sphere */}
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={bodyColor}
          attach="material"
          distort={isActive ? 0.2 : 0.05}
          speed={isActive ? 2 : 0.5}
          roughness={0.6}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Ear tufts */}
      <Sphere args={[0.2, 16, 16]} position={[-0.7, 0.9, 0]}>
        <meshStandardMaterial color={bodyColor} />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[0.7, 0.9, 0]}>
        <meshStandardMaterial color={bodyColor} />
      </Sphere>

      {/* Eye rings */}
      <Sphere args={[0.4, 32, 32]} position={[-0.22, 0.15, 0.75]}>
        <meshStandardMaterial color={isActive ? "#fef3c7" : "#f5f5f4"} />
      </Sphere>
      <Sphere args={[0.4, 32, 32]} position={[0.22, 0.15, 0.75]}>
        <meshStandardMaterial color={isActive ? "#fef3c7" : "#f5f5f4"} />
      </Sphere>

      {/* Eyes */}
      <Sphere ref={eyeLeftRef} args={[0.22, 24, 24]} position={[-0.22, 0.15, 0.85]}>
        <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.3} />
      </Sphere>
      <Sphere ref={eyeRightRef} args={[0.22, 24, 24]} position={[0.22, 0.15, 0.85]}>
        <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.3} />
      </Sphere>
      
      {/* Eye shine */}
      <Sphere args={[0.06, 8, 8]} position={[-0.15, 0.22, 1.02]}>
        <meshBasicMaterial color="white" />
      </Sphere>
      <Sphere args={[0.06, 8, 8]} position={[0.29, 0.22, 1.02]}>
        <meshBasicMaterial color="white" />
      </Sphere>
      
      {/* Beak */}
      <mesh position={[0, -0.1, 1.0]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.15, 0.25, 4]} />
        <meshStandardMaterial color={isActive ? "#f59e0b" : "#d4d4d4"} />
      </mesh>

      {/* Wings */}
      <group ref={leftWingRef} position={[-0.95, 0, 0]}>
        <Sphere args={[0.4, 16, 16]} scale={[0.3, 1, 0.5]}>
          <meshStandardMaterial color={bodyColor} />
        </Sphere>
      </group>
      <group ref={rightWingRef} position={[0.95, 0, 0]}>
        <Sphere args={[0.4, 16, 16]} scale={[0.3, 1, 0.5]}>
          <meshStandardMaterial color={bodyColor} />
        </Sphere>
      </group>

      {/* Antenna with observation bulb */}
      <group position={[0, 1.1, 0]}>
        <Sphere args={[0.12, 16, 16]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#d4d4d4" metalness={0.8} roughness={0.2} />
        </Sphere>
        <Sphere args={[0.08, 16, 16]} position={[0, 0.35, 0]}>
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={isActive ? 1 : 0.3}
          />
        </Sphere>
        {/* Observation sparkles when active */}
        {isActive && (
          <Sparkles count={15} scale={1.5} size={3} color="#fbbf24" speed={0.5} />
        )}
      </group>
    </group>
  );
}

function Lights({ isActive }: { isActive: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight position={[0, 10, 5]} intensity={0.8} angle={0.4} penumbra={1} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color={isActive ? "#fbbf24" : "#fef3c7"} />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#7c5c3d" />
      <Environment preset="city" />
    </>
  );
}

export function Skippy3DCharacter({ isActive = false, size = "medium" }: SkippyCharacterProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} style={{ background: "transparent" }}>
        <Lights isActive={isActive} />
        <Float speed={isActive ? 1.5 : 0.8} rotationIntensity={0.3} floatIntensity={0.5}>
          {isActive && <Sparkles count={20} scale={3} size={2} color="#fbbf24" speed={0.3} />}
          <SkippyBot isActive={isActive} size={size} />
        </Float>
      </Canvas>
    </div>
  );
}

export default Skippy3DCharacter;
