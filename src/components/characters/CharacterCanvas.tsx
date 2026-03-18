"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import Skippy from "./Skippy";
import Snooks from "./Snooks";
import Flippo from "./Flippo";

interface CharacterCanvasProps {
  character: "skippy" | "snooks" | "flippo";
  position?: [number, number, number];
  scale?: number;
  animated?: boolean;
}

export type { CharacterCanvasProps };

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#cccccc" wireframe />
    </mesh>
  );
}

export function CharacterCanvas({
  character,
  position = [0, 0, 0],
  scale = 1,
  animated = true,
}: CharacterCanvasProps) {
  const renderCharacter = () => {
    switch (character) {
      case "skippy":
        return <Skippy position={position} scale={scale} animated={animated} />;
      case "snooks":
        return <Snooks position={position} scale={scale} animated={animated} />;
      case "flippo":
        return <Flippo position={position} scale={scale} animated={animated} />;
      default:
        return null;
    }
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      className="w-full h-full"
      shadows
    >
      <Suspense fallback={<LoadingFallback />}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Environment */}
        <Environment preset="city" />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />

        {/* Character */}
        {renderCharacter()}

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Suspense>
    </Canvas>
  );
}

// Standalone character components for direct use
export { Skippy, Snooks, Flippo };

export default CharacterCanvas;
