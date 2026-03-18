"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Torus, Cone, Sparkles, Trail, Text, useFont, RoundedBox, Environment } from "@react-three/drei";
import * as THREE from "three";

interface SnooksCharacterProps {
  isActive?: boolean;
  size?: "small" | "medium" | "large";
}

// Snooks - The Viral Content Fox
// Clever, dynamic, with a flashy personality for marketing
function SnooksBot({ isActive = false, size = "medium" }: { isActive: boolean; size: "small" | "medium" | "large" }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);
  const sparkleRef = useRef<THREE.Group>(null);
  
  const sizes = { small: 0.65, medium: 0.95, large: 1.4 };
  const scale = sizes[size];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Eyes sparkle and move
    if (leftEyeRef.current && rightEyeRef.current) {
      const sparkle = Math.sin(t * 3) * 0.02;
      leftEyeRef.current.scale.setScalar(1 + sparkle);
      rightEyeRef.current.scale.setScalar(1 - sparkle);
    }
    
    // Tail wagging animation
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 4) * 0.3;
      tailRef.current.rotation.x = Math.sin(t * 2) * 0.1;
    }
    
    // Ear twitch
    if (earLeftRef.current && earRightRef.current) {
      earLeftRef.current.rotation.z = Math.sin(t * 2 + 1) * 0.1;
      earRightRef.current.rotation.z = -Math.sin(t * 2) * 0.1;
    }
    
    // Overall bounce when active
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 2) * 0.05;
    }
  });

  const bodyColor = isActive ? "#ea580c" : "#fb923c";
  const accentColor = isActive ? "#facc15" : "#fdba74";
  const darkColor = isActive ? "#7c2d12" : "#9a3412";

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main body - fox head */}
      <Sphere args={[0.9, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={bodyColor}
          attach="material"
          distort={isActive ? 0.15 : 0.03}
          speed={isActive ? 2 : 0.4}
          roughness={0.5}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Snout */}
      <Cone args={[0.25, 0.5, 16]} position={[0, -0.35, 0.65]} rotation={[Math.PI, 0, 0]}>
        <meshStandardMaterial color={isActive ? "#fed7aa" : "#ffedd5"} />
      </Cone>
      
      {/* Nose */}
      <Sphere args={[0.08, 16, 16]} position={[0, -0.5, 0.85]}>
        <meshStandardMaterial color="#1e293b" roughness={0.3} />
      </Sphere>
      
      {/* Left eye */}
      <group ref={leftEyeRef} position={[-0.3, 0.15, 0.7]}>
        <Sphere args={[0.18, 24, 24]}>
          <meshStandardMaterial color="white" />
        </Sphere>
        <Sphere args={[0.1, 16, 16]} position={[0, 0, 0.12]}>
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </Sphere>
        <Sphere args={[0.03, 8, 8]} position={[0.03, 0.03, 0.2]}>
          <meshBasicMaterial color="white" />
        </Sphere>
      </group>
      
      {/* Right eye */}
      <group ref={rightEyeRef} position={[0.3, 0.15, 0.7]}>
        <Sphere args={[0.18, 24, 24]}>
          <meshStandardMaterial color="white" />
        </Sphere>
        <Sphere args={[0.1, 16, 16]} position={[0, 0, 0.12]}>
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </Sphere>
        <Sphere args={[0.03, 8, 8]} position={[0.03, 0.03, 0.2]}>
          <meshBasicMaterial color="white" />
        </Sphere>
      </group>
      
      {/* Eyebrows - gives expression */}
      <Sphere args={[0.08, 8, 8]} position={[-0.3, 0.38, 0.72]} scale={[2, 0.5, 1]}>
        <meshStandardMaterial color={darkColor} />
      </Sphere>
      <Sphere args={[0.08, 8, 8]} position={[0.3, 0.38, 0.72]} scale={[2, 0.5, 1]}>
        <meshStandardMaterial color={darkColor} />
      </Sphere>
      
      {/* Left ear */}
      <group ref={earLeftRef} position={[-0.55, 0.7, 0]}>
        <Cone args={[0.25, 0.5, 4]} rotation={[0, 0, 0.3]}>
          <meshStandardMaterial color={bodyColor} />
        </Cone>
        <Cone args={[0.15, 0.3, 4]} position={[0.05, 0.1, 0.05]} rotation={[0, 0, 0.3]}>
          <meshStandardMaterial color={isActive ? "#fecaca" : "#ffe4e6"} />
        </Cone>
      </group>
      
      {/* Right ear */}
      <group ref={earRightRef} position={[0.55, 0.7, 0]}>
        <Cone args={[0.25, 0.5, 4]} rotation={[0, 0, -0.3]}>
          <meshStandardMaterial color={bodyColor} />
        </Cone>
        <Cone args={[0.15, 0.3, 4]} position={[-0.05, 0.1, 0.05]} rotation={[0, 0, -0.3]}>
          <meshStandardMaterial color={isActive ? "#fecaca" : "#ffe4e6"} />
        </Cone>
      </group>
      
      {/* Tail - fluffy and dynamic */}
      <group ref={tailRef} position={[0, -0.3, -0.7]} rotation={[0.5, 0, 0]}>
        <Sphere args={[0.4, 16, 16]} scale={[0.6, 0.8, 1]}>
          <meshStandardMaterial color={bodyColor} />
        </Sphere>
        <Sphere args={[0.25, 16, 16]} position={[0, 0, -0.25]} scale={[0.7, 0.8, 0.8]}>
          <meshStandardMaterial color={accentColor} />
        </Sphere>
      </group>
      
      {/* Marketing sparkles when active */}
      {isActive && (
        <group ref={sparkleRef}>
          <Sparkles count={20} scale={2.5} size={2.5} color="#facc15" speed={0.4} />
          {/* Dollar/money sparkles */}
          {[...Array(5)].map((_, i) => (
            <Float key={i} speed={2} floatIntensity={1}>
              <mesh position={[
                Math.cos(i * 1.5) * 1.2,
                Math.sin(i * 2) * 0.8 + 0.5,
                Math.sin(i * 2) * 0.5
              ]}>
                <planeGeometry args={[0.15, 0.15]} />
                <meshBasicMaterial color="#facc15" transparent opacity={0.8} side={THREE.DoubleSide} />
              </mesh>
            </Float>
          ))}
        </group>
      )}
      
      {/* Collar - stylish accessory */}
      <Torus args={[0.65, 0.06, 16, 32]} position={[0, -0.55, 0.3]} rotation={[0.3, 0, 0]}>
        <meshStandardMaterial 
          color={isActive ? "#facc15" : "#fbbf24"} 
          emissive={isActive ? "#facc15" : "#fb923c"}
          emissiveIntensity={isActive ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Torus>
    </group>
  );
}

function Lights({ isActive }: { isActive: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight position={[0, 10, 8]} intensity={1} angle={0.5} penumbra={1} castShadow />
      <pointLight position={[-5, 3, 5]} intensity={0.6} color={isActive ? "#facc15" : "#fb923c"} />
      <pointLight position={[5, -3, 5]} intensity={0.4} color={isActive ? "#fb923c" : "#fdba74"} />
      <Environment preset="sunset" />
    </>
  );
}

export function Snooks3DCharacter({ isActive = false, size = "medium" }: SnooksCharacterProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} style={{ background: "transparent" }}>
        <Lights isActive={isActive} />
        <Float speed={isActive ? 1.8 : 0.8} rotationIntensity={0.3} floatIntensity={0.5}>
          {isActive && <Sparkles count={25} scale={2.5} size={2} color="#facc15" speed={0.3} />}
          <SnooksBot isActive={isActive} size={size} />
        </Float>
      </Canvas>
    </div>
  );
}

export default Snooks3DCharacter;
