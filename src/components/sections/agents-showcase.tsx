
"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Box, TorusKnot, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const SkippyModel = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
  });

  return (
    <group ref={group}>
      {/* Robot Head */}
      <Box args={[1.2, 1, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#C9B8FF" roughness={0.2} metalness={0.8} />
      </Box>
      {/* Eyes */}
      <Sphere args={[0.15, 16, 16]} position={[-0.3, 0.1, 0.5]}>
        <meshBasicMaterial color="white" />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.3, 0.1, 0.5]}>
        <meshBasicMaterial color="white" />
      </Sphere>
      {/* Antenna */}
      <Box args={[0.05, 0.5, 0.05]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#A36BEE" />
      </Box>
      <Sphere args={[0.08, 16, 16]} position={[0, 0.85, 0]}>
        <meshBasicMaterial color="white" />
      </Sphere>
    </group>
  );
};

const FlippoModel = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    mesh.current.rotation.x = state.clock.elapsedTime * 0.5;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <Box ref={mesh} args={[1, 1, 1]}>
      <MeshWobbleMaterial factor={0.4} speed={2} color="#6297FF" metalness={0.5} roughness={0.2} />
    </Box>
  );
};

const SnooksModel = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    mesh.current.rotation.z = state.clock.elapsedTime * 0.5;
  });

  return (
    <TorusKnot ref={mesh} args={[0.6, 0.2, 128, 32]}>
      <MeshDistortMaterial distort={0.3} speed={3} color="#A36BEE" metalness={1} roughness={0.1} />
    </TorusKnot>
  );
};

const AGENTS = [
  {
    name: "Skippy",
    role: "Screen Intelligence",
    color: "#C9B8FF",
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
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl h-full flex flex-col overflow-hidden"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div 
        className="w-full aspect-square rounded-2xl mb-6 relative overflow-hidden bg-black/40"
      >
        <Canvas shadow={false} dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 4]} />
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
            <agent.Model />
          </Float>
          <Environment preset="city" />
        </Canvas>
      </div>

      <h3 className="font-headline text-3xl font-bold mb-1">{agent.name}</h3>
      <p className="text-primary font-medium mb-4">{agent.role}</p>
      <p className="text-foreground/60 text-sm mb-6 flex-grow">{agent.desc}</p>
      
      <div className="flex flex-wrap gap-2">
        {agent.powers.map(p => (
          <Badge key={p} variant="secondary" className="bg-white/10 text-xs py-0.5">
            {p}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

export function AgentsShowcase() {
  return (
    <section id="agents" className="py-48 px-6 bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <h2 className="font-headline text-5xl md:text-7xl font-bold mb-6">Meet Your New <br /><span className="text-primary">Autonomous Team</span></h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">Three specialized AI entities working in perfect harmony to handle everything from your focus sessions to your viral marketing.</p>
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
