"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, Box, Cylinder, Torus, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const GooglyEyes = ({ hasSpecs = false, position = [0, 0, 0] as [number, number, number] }) => {
  const leftEyeRef = useRef<THREE.Group>(null!);
  const rightEyeRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (leftEyeRef.current) {
      leftEyeRef.current.rotation.z = Math.sin(t * 10) * 0.1;
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.rotation.z = Math.cos(t * 10) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Left Eye */}
      <group ref={leftEyeRef} position={[-0.25, 0, 0]}>
        <Sphere args={[0.15, 16, 16]}>
          <meshBasicMaterial color="white" />
        </Sphere>
        <Sphere args={[0.07, 16, 16]} position={[0, 0, 0.1]}>
          <meshBasicMaterial color="black" />
        </Sphere>
        {hasSpecs && (
          <Torus args={[0.18, 0.02, 16, 32]} position={[0, 0, 0.05]}>
            <meshBasicMaterial color="black" />
          </Torus>
        )}
      </group>

      {/* Right Eye */}
      <group ref={rightEyeRef} position={[0.25, 0, 0]}>
        <Sphere args={[0.15, 16, 16]}>
          <meshBasicMaterial color="white" />
        </Sphere>
        <Sphere args={[0.07, 16, 16]} position={[0, 0, 0.1]}>
          <meshBasicMaterial color="black" />
        </Sphere>
        {hasSpecs && (
          <Torus args={[0.18, 0.02, 16, 32]} position={[0, 0, 0.05]}>
            <meshBasicMaterial color="black" />
          </Torus>
        )}
      </group>

      {/* Spectacles Bridge */}
      {hasSpecs && (
        <Box args={[0.15, 0.02, 0.02]} position={[0, 0, 0.05]}>
          <meshBasicMaterial color="black" />
        </Box>
      )}
    </group>
  );
};

const SkippyModel = () => {
  return (
    <group>
      {/* Pink Cuboid Body */}
      <Box args={[1, 1.6, 0.8]}>
        <meshStandardMaterial 
          color="#FFB6C1" 
          emissive="#FF69B4" 
          emissiveIntensity={0.6} 
          roughness={0.1}
          metalness={0.2}
        />
      </Box>
      <GooglyEyes hasSpecs={true} position={[0, 0.3, 0.41]} />
    </group>
  );
};

const FlippoModel = () => {
  return (
    <group>
      {/* Blueish Cuboid Body */}
      <Box args={[1.2, 1.2, 0.8]}>
        <meshStandardMaterial 
          color="#ADD8E6" 
          emissive="#6297FF" 
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.2}
        />
      </Box>
      <GooglyEyes position={[0, 0.2, 0.41]} />
      
      {/* Stick Limbs */}
      <group>
        {/* Left Arm */}
        <Cylinder args={[0.02, 0.02, 0.8]} position={[-0.7, 0, 0]} rotation={[0, 0, Math.PI / 3]}>
          <meshBasicMaterial color="black" />
        </Cylinder>
        {/* Right Arm */}
        <Cylinder args={[0.02, 0.02, 0.8]} position={[0.7, 0, 0]} rotation={[0, 0, -Math.PI / 3]}>
          <meshBasicMaterial color="black" />
        </Cylinder>
        {/* Left Leg */}
        <Cylinder args={[0.02, 0.02, 0.6]} position={[-0.3, -0.9, 0]}>
          <meshBasicMaterial color="black" />
        </Cylinder>
        {/* Right Leg */}
        <Cylinder args={[0.02, 0.02, 0.6]} position={[0.3, -0.9, 0]}>
          <meshBasicMaterial color="black" />
        </Cylinder>
      </group>
    </group>
  );
};

const SnooksModel = () => {
  return (
    <group>
      {/* Deep Purple Cuboid Body */}
      <Box args={[1, 1.2, 1]}>
        <meshStandardMaterial 
          color="#9370DB" 
          emissive="#A36BEE" 
          emissiveIntensity={0.7}
          roughness={0.1}
          metalness={0.2}
        />
      </Box>
      <GooglyEyes position={[0, 0.2, 0.51]} />
      
      {/* Bowtie */}
      <group position={[0, -0.2, 0.52]}>
        <Box args={[0.2, 0.1, 0.05]} position={[-0.1, 0, 0]} rotation={[0, 0, 0.5]}>
          <meshBasicMaterial color="black" />
        </Box>
        <Box args={[0.2, 0.1, 0.05]} position={[0.1, 0, 0]} rotation={[0, 0, -0.5]}>
          <meshBasicMaterial color="black" />
        </Box>
        <Sphere args={[0.04, 8, 8]}>
          <meshBasicMaterial color="black" />
        </Sphere>
      </group>

      {/* Stick Limbs */}
      <group>
        {/* Left Arm */}
        <Cylinder args={[0.02, 0.02, 0.6]} position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshBasicMaterial color="black" />
        </Cylinder>
        {/* Right Arm */}
        <Cylinder args={[0.02, 0.02, 0.6]} position={[0.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <meshBasicMaterial color="black" />
        </Cylinder>
      </group>
    </group>
  );
};

const AGENTS = [
  {
    name: "Skippy",
    role: "Screen Intelligence",
    color: "#FFB6C1",
    desc: "Autonomous screen analysis and contextual assistance for designers & devs.",
    powers: ["OCR extraction", "Activity tracking", "Anti-stuck logic"],
    Model: SkippyModel
  },
  {
    name: "Flippo",
    role: "Productivity Brain",
    color: "#6297FF",
    desc: "Data-driven insights and deep work scoring based on real behavior.",
    powers: ["Timeline generation", "Flow state analysis", "Focus matrix"],
    Model: FlippoModel
  },
  {
    name: "Snooks",
    role: "Marketing Head",
    color: "#A36BEE",
    desc: "Expert content strategy and platform-native marketing generation.",
    powers: ["Viral hook drafting", "Multi-platform sync", "SEO optimization"],
    Model: SnooksModel
  }
];

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl h-full flex flex-col overflow-hidden"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div 
        className="w-full aspect-square rounded-2xl mb-6 relative overflow-hidden bg-black/40 flex items-center justify-center"
      >
        {mounted ? (
          <Canvas shadow={false} dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 4]} />
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <agent.Model />
            </Float>
            <Environment preset="city" />
          </Canvas>
        ) : (
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        )}
      </div>

      <h3 className="font-pixel text-lg font-bold mb-1">{agent.name}</h3>
      <p className="text-primary font-bold text-[10px] uppercase tracking-widest mb-4" style={{ color: agent.color }}>{agent.role}</p>
      <p className="text-foreground/60 text-sm mb-6 flex-grow">{agent.desc}</p>
      
      <div className="flex flex-wrap gap-2">
        {agent.powers.map(p => (
          <Badge key={p} variant="secondary" className="bg-white/10 text-[8px] py-0.5 font-pixel uppercase">
            {p}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

export function AgentsShowcase() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section id="agents" className="py-48 px-6 bg-black relative overflow-hidden">
      {/* Whiteish background ambient lighting */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 flex flex-col items-center">
          <motion.div 
            onMouseMove={handleContainerMouseMove}
            className="relative group inline-block p-10 cursor-default"
          >
            {/* Wegic-style dynamic light glow (Whiteish) */}
            <motion.div
              style={{
                left: glowX,
                top: glowY,
                background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
            />
            
            <h2 className="font-pixel text-4xl md:text-6xl lg:text-7xl font-bold mb-8 relative z-10 leading-[1.15] tracking-tight text-white">
              Meet Your New <br />
              <span className="text-[#f2e8d5] drop-shadow-[0_0_20px_rgba(242,232,213,0.3)]">Autonomous Team</span>
            </h2>
          </motion.div>
          
          <p className="text-[#f2e8d5]/80 max-w-3xl mx-auto font-pixel text-[11px] md:text-xs leading-loose uppercase tracking-[0.2em] transition-colors duration-500 hover:text-[#f2e8d5]">
            Three specialized AI entities working in perfect harmony to handle everything from your focus sessions to your viral marketing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AGENTS.map(agent => (
            <AgentCard key={agent.name} agent={agent} />
          ))}
        </div>
      </div>
    </section>
  );
}
