"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Torus, Ring, MeshTransmissionMaterial, Sparkles, Trail, Text, Environment } from "@react-three/drei";
import * as THREE from "three";

interface FlippoCharacterProps {
  isActive?: boolean;
  size?: "small" | "medium" | "large";
}

// Flippo - The Productivity Timekeeper
// A clock-like character with rings representing time and productivity
function FlippoBot({ isActive = false, size = "medium" }: { isActive: boolean; size: "small" | "medium" | "large" }) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const middleRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const secondHandRef = useRef<THREE.Mesh>(null);
  const minuteHandRef = useRef<THREE.Mesh>(null);
  
  const sizes = { small: 0.6, medium: 0.9, large: 1.3 };
  const scale = sizes[size];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Rotate rings at different speeds
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 0.3;
    }
    if (middleRingRef.current) {
      middleRingRef.current.rotation.z = -t * 0.2;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.1;
    }
    
    // Clock hands move with time
    if (secondHandRef.current) {
      secondHandRef.current.rotation.z = -t * 0.5;
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = -t * 0.02;
    }
    
    // Gentle pulse when active
    if (groupRef.current && isActive) {
      groupRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.03);
    }
  });

  const bodyColor = isActive ? "#0ea5e9" : "#94a3b8";
  const accentColor = isActive ? "#22d3ee" : "#cbd5e1";
  const glowColor = isActive ? "#06b6d4" : "#64748b";

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main body - clock face */}
      <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={bodyColor}
          attach="material"
          distort={isActive ? 0.15 : 0.02}
          speed={isActive ? 1.5 : 0.3}
          roughness={0.4}
          metalness={0.3}
        />
      </Sphere>
      
      {/* Inner ring - productivity indicator */}
      <group ref={innerRingRef}>
        <Torus args={[0.95, 0.03, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial 
            color={isActive ? "#22d3ee" : "#94a3b8"} 
            emissive={isActive ? "#22d3ee" : "#64748b"}
            emissiveIntensity={isActive ? 0.8 : 0.2}
          />
        </Torus>
      </group>
      
      {/* Middle ring */}
      <group ref={middleRingRef}>
        <Torus args={[1.15, 0.02, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial 
            color={accentColor}
            emissive={glowColor}
            emissiveIntensity={isActive ? 0.5 : 0.1}
            transparent
            opacity={0.7}
          />
        </Torus>
      </group>
      
      {/* Outer ring - timeline representation */}
      <group ref={outerRingRef}>
        <Torus args={[1.4, 0.015, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial 
            color={isActive ? "#67e8f9" : "#e2e8f0"}
            transparent
            opacity={0.4}
          />
        </Torus>
      </group>

      {/* Clock face */}
      <Sphere args={[0.75, 32, 32]} position={[0, 0, 0.1]}>
        <meshStandardMaterial 
          color={isActive ? "#0c4a6e" : "#1e293b"} 
          metalness={0.5}
          roughness={0.3}
        />
      </Sphere>

      {/* Hour markers */}
      {[...Array(12)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin(i * Math.PI / 6) * 0.55,
            Math.cos(i * Math.PI / 6) * 0.55,
            0.2
          ]}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial 
            color={isActive ? "#67e8f9" : "#94a3b8"}
            emissive={isActive ? "#22d3ee" : "#64748b"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      {/* Center dot */}
      <Sphere args={[0.08, 16, 16]} position={[0, 0, 0.25]}>
        <meshStandardMaterial 
          color={accentColor}
          emissive={glowColor}
          emissiveIntensity={1}
        />
      </Sphere>

      {/* Hour hand */}
      <mesh ref={minuteHandRef} position={[0, 0.15, 0.22]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.02]} />
        <meshStandardMaterial color={isActive ? "#f0fdfa" : "#e2e8f0"} />
      </mesh>
      
      {/* Minute hand */}
      <mesh ref={secondHandRef} position={[0.03, 0, 0.23]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.02, 0.4, 0.01]} />
        <meshStandardMaterial 
          color="#f43f5e" 
          emissive="#f43f5e"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Crown/Top knob */}
      <group position={[0, 0.95, 0]}>
        <Sphere args={[0.12, 16, 16]}>
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </Sphere>
        {isActive && (
          <Sparkles count={12} scale={1.2} size={2} color="#22d3ee" speed={0.4} />
        )}
      </group>
      
      {/* Digital display glow when active */}
      {isActive && (
        <group position={[0, -0.3, 0.7]}>
          <mesh>
            <planeGeometry args={[0.5, 0.15]} />
            <meshBasicMaterial color="#0ea5e9" transparent opacity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Lights({ isActive }: { isActive: boolean }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight position={[0, 10, 8]} intensity={1} angle={0.5} penumbra={1} castShadow />
      <pointLight position={[-5, 3, 5]} intensity={0.6} color={isActive ? "#22d3ee" : "#94a3b8"} />
      <pointLight position={[5, -3, 5]} intensity={0.3} color={isActive ? "#06b6d4" : "#64748b"} />
      <Environment preset="city" />
    </>
  );
}

export function Flippo3DCharacter({ isActive = false, size = "medium" }: FlippoCharacterProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }} style={{ background: "transparent" }}>
        <Lights isActive={isActive} />
        <Float speed={isActive ? 1.2 : 0.6} rotationIntensity={0.2} floatIntensity={0.4}>
          {isActive && <Sparkles count={15} scale={2.5} size={2} color="#22d3ee" speed={0.3} />}
          <FlippoBot isActive={isActive} size={size} />
        </Float>
      </Canvas>
    </div>
  );
}

export default Flippo3DCharacter;
