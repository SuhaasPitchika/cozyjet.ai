"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Box, TorusKnot, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const SkippyModel = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={group}>
      <Box args={[1.2, 1, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#C9B8FF" roughness={0.2} metalness={0.8} />
      </Box>
      <Sphere args={[0.15, 16, 16]} position={[-0.3, 0.1, 0.5]}>
        <meshBasicMaterial color="white" />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.3, 0.1, 0.5]}>
        <meshBasicMaterial color="white" />
      </Sphere>
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
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.5;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
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
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
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
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
              <agent.Model />
            </Float>
            <Environment preset="city" />
          </Canvas>
        ) : (
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        )}
      </div>

      <h3 className="font-pixel text-lg font-bold mb-1">{agent.name}</h3>
      <p className="text-primary font-bold text-[10px] uppercase tracking-widest mb-4">{agent.role}</p>
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
