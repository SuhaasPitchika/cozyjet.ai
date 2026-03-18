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
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

// Skippy Character - A friendly, bouncy rabbit-like character
interface SkippyProps {
  position?: [number, number, number];
  scale?: number;
  animated?: boolean;
}

function SkippyBody({ color = "#FFB6C1" }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
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
          color={hovered ? "#FFCAD4" : color}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Left Ear */}
      <mesh position={[-0.25, 2.2, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.1, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>

      {/* Right Ear */}
      <mesh position={[0.25, 2.2, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.1, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>

      {/* Left Eye */}
      <mesh position={[-0.2, 1.4, 0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.2, 1.4, 0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 1.15, 0.55]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>

      {/* Smile */}
      <mesh position={[0, 1.0, 0.5]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

function Skippy({ position = [0, 0, 0], scale = 1, animated = true }: SkippyProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {animated ? (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <SkippyBody />
        </Float>
      ) : (
        <SkippyBody />
      )}
    </group>
  );
}

export default Skippy;
