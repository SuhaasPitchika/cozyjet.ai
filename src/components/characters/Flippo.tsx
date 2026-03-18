"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  MeshTransmissionMaterial,
  Text3D,
  Center,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";

// Flippo Character - A playful penguin-like character with flippers
interface FlippoProps {
  position?: [number, number, number];
  scale?: number;
  animated?: boolean;
}

function FlippoBody({ color = "#2C3E50" }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const leftFlipperRef = useRef<THREE.Mesh>(null);
  const rightFlipperRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.8) * 0.2;
    }
    // Animate flippers
    if (leftFlipperRef.current && rightFlipperRef.current) {
      const flipperAngle = Math.sin(state.clock.elapsedTime * 4) * 0.4;
      leftFlipperRef.current.rotation.z = flipperAngle - 0.3;
      rightFlipperRef.current.rotation.z = -flipperAngle + 0.3;
    }
  });

  return (
    <group>
      {/* Body */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? "#3D566E" : color}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Belly */}
      <mesh position={[0, 0, 0.6]} scale={[0.8, 0.9, 0.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ECF0F1" roughness={0.5} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.1, 0.2]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Face */}
      <mesh position={[0, 1.1, 0.65]} scale={[0.7, 0.6, 0.3]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ECF0F1" roughness={0.5} />
      </mesh>

      {/* Left Eye - Large and expressive */}
      <mesh position={[-0.2, 1.25, 0.65]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.2, 1.25, 0.65]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Eye shine left */}
      <mesh position={[-0.17, 1.28, 0.78]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>

      {/* Eye shine right */}
      <mesh position={[0.23, 1.28, 0.78]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>

      {/* Beak */}
      <mesh position={[0, 1.0, 0.85]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 3]} />
        <meshStandardMaterial color="#F39C12" roughness={0.4} />
      </mesh>

      {/* Left Flipper */}
      <mesh ref={leftFlipperRef} position={[-1.1, 0.2, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
        <meshStandardMaterial color="#34495E" roughness={0.5} />
      </mesh>

      {/* Right Flipper */}
      <mesh ref={rightFlipperRef} position={[1.1, 0.2, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
        <meshStandardMaterial color="#34495E" roughness={0.5} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.4, -1.0, 0.2]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.5]} />
        <meshStandardMaterial color="#F39C12" roughness={0.5} />
      </mesh>

      <mesh position={[0.4, -1.0, 0.2]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.5]} />
        <meshStandardMaterial color="#F39C12" roughness={0.5} />
      </mesh>

      {/* Tail feathers */}
      <mesh position={[0, -0.3, -1.0]} rotation={[-0.5, 0, 0]}>
        <coneGeometry args={[0.25, 0.5, 4]} />
        <meshStandardMaterial color="#34495E" roughness={0.5} />
      </mesh>

      {/* Blush cheeks */}
      <mesh position={[-0.4, 1.0, 0.55]} scale={[0.15, 0.1, 0.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
      </mesh>

      <mesh position={[0.4, 1.0, 0.55]} scale={[0.15, 0.1, 0.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Flippo({ position = [0, 0, 0], scale = 1, animated = true }: FlippoProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {animated ? (
        <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.4}>
          <FlippoBody />
        </Float>
      ) : (
        <FlippoBody />
      )}
    </group>
  );
}

export default Flippo;
