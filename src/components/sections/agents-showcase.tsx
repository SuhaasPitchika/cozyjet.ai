
"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, Box, Cylinder, Torus, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const GooglyEyes = ({ hasSpecs = false, position = [0, 0, 0] as [number, number, number] }) => {
  const leftEyeRef = useRef<THREE.Group>(null!);
  const rightEyeRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = Math.floor(state.clock.elapsedTime * 8) / 8;
    if (leftEyeRef.current) {
      leftEyeRef.current.rotation.z = Math.sin(t * 10) * 0.1;
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.rotation.z = Math.cos(t * 10) * 0.1;
    }
  });

  return (
    <group position={position}>
      <group ref={leftEyeRef} position={[-0.25, 0, 0]}>
        <Sphere args={[0.15, 8, 8]}>
          <meshBasicMaterial color="white" />
        </Sphere>
        <Sphere args={[0.07, 8, 8]} position={[0, 0, 0.1]}>
          <meshBasicMaterial color="black" />
        </Sphere>
        {hasSpecs && (
          <Torus args={[0.18, 0.02, 8, 16]} position={[0, 0, 0.05]}>
            <meshBasicMaterial color="black" />
          </Torus>
        )}
      </group>

      <group ref={rightEyeRef} position={[0.25, 0, 0]}>
        <Sphere args={[0.15, 8, 8]}>
          <meshBasicMaterial color="white" />
        </Sphere>
        <Sphere args={[0.07, 8, 8]} position={[0, 0, 0.1]}>
          <meshBasicMaterial color="black" />
        </Sphere>
        {hasSpecs && (
          <Torus args={[0.18, 0.02, 8, 16]} position={[0, 0, 0.05]}>
            <meshBasicMaterial color="black" />
          </Torus>
        )}
      </group>

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
      <Box args={[1, 1.6, 0.8]}>
        <meshStandardMaterial 
          color="#FFB6C1" 
          emissive="#FF69B4" 
          emissiveIntensity={0.6} 
          roughness={1}
          metalness={0}
        />
      </Box>
      <GooglyEyes hasSpecs={true} position={[0, 0.3, 0.41]} />
    </group>
  );
};

const FlippoModel = () => {
  return (
    <group>
      <Box args={[1.2, 1.2, 0.8]}>
        <meshStandardMaterial 
          color="#ADD8E6" 
          emissive="#6297FF" 
          emissiveIntensity={0.5}
          roughness={1}
          metalness={0}
        />
      </Box>
      <GooglyEyes position={[0, 0.2, 0.41]} />
      <group>
        <Cylinder args={[0.02, 0.02, 0.8]} position={[-0.7, 0, 0]} rotation={[0, 0, Math.PI / 3]}>
          <meshBasicMaterial color="black" />
        </Cylinder>
        <Cylinder args={[0.02, 0.02, 0.8]} position={[0.7, 0, 0]} rotation={[0, 0, -Math.PI / 3]}>
          <meshBasicMaterial color="black" />
        </Cylinder>
        <Cylinder args={[0.02, 0.02, 0.6]} position={[-0.3, -0.9, 0]}>
          <meshBasicMaterial color="black" />
        </Cylinder>
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
      <Box args={[1, 1.2, 1]}>
        <meshStandardMaterial 
          color="#9370DB" 
          emissive="#A36BEE" 
          emissiveIntensity={0.7}
          roughness={1}
          metalness={0}
        />
      </Box>
      <GooglyEyes position={[0, 0.2, 0.51]} />
      <group position={[0, -0.2, 0.52]}>
        <Box args={[0.2, 0.1, 0.05]} position={[-0.1, 0, 0]} rotation={[0, 0, 0.5]}>
          <meshBasicMaterial color="black" />
        </Box>
        <Box args={[0.2, 0.1, 0.05]} position={[0.1, 0, 0]} rotation={[0, 0, -0.5]}>
          <meshBasicMaterial color="black" />
        </Box>
        <Sphere args={[0.04, 4, 4]}>
          <meshBasicMaterial color="black" />
        </Sphere>
      </group>
      <group>
        <Cylinder args={[0.02, 0.02, 0.6]} position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshBasicMaterial color="black" />
        </Cylinder>
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
    desc: "Autonomous screen analysis and contextual assistance.",
    powers: ["OCR extraction", "Activity tracking", "Anti-stuck logic"],
    Model: SkippyModel
  },
  {
    name: "Flippo",
    role: "Productivity Brain",
    color: "#6297FF",
    desc: "Data-driven insights and deep work scoring.",
    powers: ["Timeline generation", "Flow state analysis", "Focus matrix"],
    Model: FlippoModel
  },
  {
    name: "Snooks",
    role: "Marketing Head",
    color: "#A36BEE",
    desc: "Expert content strategy and viral generation.",
    powers: ["Viral hook drafting", "Multi-platform sync", "SEO optimization"],
    Model: SnooksModel
  }
];

function StickyPower({ text, index }: { text: string; index: number }) {
  const rotations = ["-1deg", "1deg", "-0.5deg"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="sticky-note w-full py-2 px-3 mb-2 flex items-center justify-center rounded-sm border-black/5"
      style={{ rotate: rotations[index % rotations.length] }}
    >
      <div className="sticky-note-hole !top-0.5 !w-1 !h-1" />
      <span className="text-[7px] font-pixel text-black/60 uppercase text-center leading-tight">
        {text}
      </span>
    </motion.div>
  );
}

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
          <Canvas 
            shadow={false} 
            dpr={[0.4, 0.4]} 
            gl={{ antialias: false, pixelRatio: 0.5 }}
          >
            <PerspectiveCamera makeDefault position={[0, 0, 4]} />
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <Float 
              speed={1.5} 
              rotationIntensity={0.2} 
              floatIntensity={1}
            >
              <agent.Model />
            </Float>
            <Environment preset="city" />
          </Canvas>
        ) : (
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        )}
      </div>

      <div className="flex-grow">
        <h3 className="font-pixel text-lg font-bold mb-1 text-white">{agent.name}</h3>
        <p className="font-bold text-[10px] uppercase tracking-widest mb-4" style={{ color: agent.color }}>{agent.role}</p>
        <p className="text-[#f2e8d5]/40 text-[9px] leading-relaxed mb-8 font-pixel uppercase">{agent.desc}</p>
        
        <div className="flex flex-col gap-1">
          {agent.powers.map((p, i) => (
            <StickyPower key={p} text={p} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function AgentsShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { damping: 40, stiffness: 150 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unsubscribeX = glowX.on("change", (v) => setMousePos(prev => ({ ...prev, x: v })));
    const unsubscribeY = glowY.on("change", (v) => setMousePos(prev => ({ ...prev, y: v })));
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [glowX, glowY]);

  return (
    <section 
      id="agents" 
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      className="py-48 px-6 bg-black relative overflow-hidden group"
    >
      {/* Interactive Fading Dot Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage: `radial-gradient(circle 500px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.5) 40%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 500px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.5) 40%, transparent 100%)`,
        }}
      />

      {/* Intense Localized Glow */}
      <motion.div
        style={{
          left: glowX,
          top: glowY,
          background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 75%)",
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none blur-[100px] z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative inline-block py-10"
          >
            <motion.h2 
              animate={{ 
                scaleY: [1, 1, 0.05, 1, 1, 0.05, 1],
                opacity: [1, 1, 0.4, 1, 1, 0.2, 1]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                times: [0, 0.7, 0.72, 0.74, 0.9, 0.92, 1],
                ease: "easeInOut"
              }}
              className="font-pixel text-4xl md:text-5xl lg:text-6xl font-bold mb-8 relative z-10 leading-tight tracking-tight text-white uppercase origin-center"
            >
              The Agent <br />
              <span className="text-primary drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]">Core Matrix</span>
            </motion.h2>
          </motion.div>
          
          <p className="text-[#f2e8d5]/40 max-w-2xl mx-auto font-pixel text-[10px] leading-loose uppercase tracking-[0.2em]">
            Autonomous entities engineered for pixel-perfect execution.
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
