
"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, Box, Cylinder, Torus, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    desc: "Autonomous screen analysis and contextual assistance for designers & devs.",
    prompt: "A 32-bit pixel art character of a pink rectangular robot with large googly eyes and thick black spectacles, floating in a digital void, retro game aesthetic, vibrant pink and magenta highlights.",
    powers: ["OCR extraction", "Activity tracking", "Anti-stuck logic"],
    Model: SkippyModel
  },
  {
    name: "Flippo",
    role: "Productivity Brain",
    color: "#6297FF",
    desc: "Data-driven insights and deep work scoring based on real behavior.",
    prompt: "A 32-bit pixel art character of a blue square robot with thin black stick limbs and curious googly eyes, standing on a minimalist grid, tech-blue palette, clean retro aesthetic.",
    powers: ["Timeline generation", "Flow state analysis", "Focus matrix"],
    Model: FlippoModel
  },
  {
    name: "Snooks",
    role: "Marketing Head",
    color: "#A36BEE",
    desc: "Expert content strategy and platform-native marketing generation.",
    prompt: "A 32-bit pixel art character of a purple rectangular agent wearing a black bowtie, large expressive eyes, elegant and professional retro game style, deep purple and violet tones.",
    powers: ["Viral hook drafting", "Multi-platform sync", "SEO optimization"],
    Model: SnooksModel
  }
];

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(agent.prompt);
    setCopied(true);
    toast({
      title: "Prompt Copied!",
      description: `Pixel animation prompt for ${agent.name} is ready for AI generation.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

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
            dpr={[0.2, 0.4]} 
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
        <h3 className="font-pixel text-lg font-bold mb-1">{agent.name}</h3>
        <p className="text-primary font-bold text-[10px] uppercase tracking-widest mb-4" style={{ color: agent.color }}>{agent.role}</p>
        <p className="text-[#f2e8d5]/60 text-[10px] leading-relaxed mb-6 font-pixel uppercase">{agent.desc}</p>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {agent.powers.map(p => (
            <Badge key={p} variant="secondary" className="bg-white/10 text-[7px] py-0.5 font-pixel uppercase border-none">
              {p}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">AI Character Prompt</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 hover:bg-white/10"
            onClick={handleCopyPrompt}
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/40" />}
          </Button>
        </div>
        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
          <p className="text-[7px] font-pixel text-[#f2e8d5]/40 leading-normal line-clamp-3 uppercase">
            {agent.prompt}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function AgentsShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { damping: 40, stiffness: 120 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section 
      id="agents" 
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      className="py-48 px-6 bg-black relative overflow-hidden group"
    >
      {/* Denser Interactive Dot Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 0)',
          backgroundSize: '24px 24px',
          maskImage: `radial-gradient(circle 350px at var(--mouse-x, 0px) var(--mouse-y, 0px), black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 350px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)`,
        } as any}
        ref={(el) => {
          if (el) {
            el.style.setProperty('--mouse-x', `${glowX.get()}px`);
            el.style.setProperty('--mouse-y', `${glowY.get()}px`);
          }
        }}
      />

      {/* Smaller, Denser Interactive Studio Glow */}
      <motion.div
        style={{
          left: glowX,
          top: glowY,
          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
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
            <h2 className="font-pixel text-4xl md:text-5xl lg:text-6xl font-bold mb-8 relative z-10 leading-tight tracking-tight text-white uppercase">
              The Agent <br />
              <span className="text-primary drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">Core Matrix</span>
            </h2>
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
