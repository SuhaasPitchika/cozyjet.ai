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

// Snooks Character - A playful, curious fox-like character
interface SnooksProps {
  position?: [number, number, number];
  scale?: number;
  animated?: boolean;
}

function SnooksBody({ color = "#FF8C42" }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.3;
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
          color={hovered ? "#FFA566" : color}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Head - slightly elongated */}
      <mesh position={[0, 1.0, 0.3]} scale={[1.1, 1, 1.1]}>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.85, 0.8]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color="#FFD166" roughness={0.6} />
      </mesh>

      {/* Left Eye */}
      <mesh position={[-0.25, 1.2, 0.6]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.25, 1.2, 0.6]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Eye shine left */}
      <mesh position={[-0.22, 1.23, 0.7]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Eye shine right */}
      <mesh position={[0.28, 1.23, 0.7]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.9, 1.0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>

      {/* Left Ear */}
      <mesh position={[-0.4, 1.9, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.2, 0.6, 4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Right Ear */}
      <mesh position={[0.4, 1.9, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.2, 0.6, 4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Inner ears */}
      <mesh position={[-0.4, 1.85, 0.05]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.12, 0.4, 4]} />
        <meshStandardMaterial color="#FFD166" roughness={0.6} />
      </mesh>

      <mesh position={[0.4, 1.85, 0.05]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.12, 0.4, 4]} />
        <meshStandardMaterial color="#FFD166" roughness={0.6} />
      </mesh>

      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.2, -1.2]} rotation={[-0.5, 0, 0]}>
        <coneGeometry args={[0.3, 1.2, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Tail tip */}
      <mesh position={[0, 0.5, -1.7]} rotation={[-0.5, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFD166" roughness={0.5} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.5, -0.9, 0.3]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      <mesh position={[0.5, -0.9, 0.3]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      <mesh position={[-0.4, -0.9, -0.4]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      <mesh position={[0.4, -0.9, -0.4]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Snooks({ position = [0, 0, 0], scale = 1, animated = true }: SnooksProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {animated ? (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
          <SnooksBody />
        </Float>
      ) : (
        <SnooksBody />
      )}
    </group>
  );
}

export default Snooks;
