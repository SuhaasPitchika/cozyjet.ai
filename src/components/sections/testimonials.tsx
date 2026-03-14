"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "VFX Supervisor",
    image: "https://picsum.photos/seed/alex/100/100",
    comment: "CozyJet has completely changed how our studio handles asset management. Skippy's screen intelligence is a literal life-saver.",
    platform: "twitter"
  },
  {
    name: "Sarah Chen",
    role: "Fullstack Developer",
    image: "https://picsum.photos/seed/sarah/100/100",
    comment: "The deep work scoring from Flippo keeps me honest. I've never been more productive in my entire career.",
    platform: "linkedin"
  },
  {
    name: "Marcus Thorne",
    role: "Growth Head @ TechFlow",
    image: "https://picsum.photos/seed/marcus/100/100",
    comment: "Snooks generates better hooks than most of our junior copywriters. The multi-platform sync is just seamless.",
    platform: "discord"
  },
  {
    name: "Elena Rossi",
    role: "Creative Director",
    image: "https://picsum.photos/seed/elena/100/100",
    comment: "Finally, an AI that doesn't just feel like a wrapper. The agentic behavior is uncanny and genuinely helpful.",
    platform: "x"
  },
  {
    name: "Julian K.",
    role: "Solopreneur",
    image: "https://picsum.photos/seed/julian/100/100",
    comment: "I used to spend 5 hours a week on social media. Now it takes 15 minutes with Snooks. Absolute game changer.",
    platform: "youtube"
  },
  {
    name: "Priyah S.",
    role: "Product Designer",
    image: "https://picsum.photos/seed/priyah/100/100",
    comment: "Skippy detected when I was stuck on a Figma component and suggested a reference I'd completely forgotten about. Magic.",
    platform: "discord"
  }
];

function MarqueeRow({ items, direction = 1, speed = 40 }: { items: typeof TESTIMONIALS, direction?: 1 | -1, speed?: number }) {
  return (
    <div className="flex overflow-hidden group select-none">
      <motion.div
        animate={{
          x: direction === 1 ? [0, -1920] : [-1920, 0]
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear"
        }}
        className="flex gap-6 pr-6 whitespace-nowrap min-w-full"
      >
        {[...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            className="w-[380px] h-[220px] bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex flex-col justify-between shrink-0 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-white/20">
                  <AvatarImage src={item.image} />
                  <AvatarFallback className="text-[10px]">{item.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{item.name}</h4>
                  <p className="text-[10px] text-white/50 uppercase font-medium">{item.role}</p>
                </div>
              </div>
              <div className="opacity-40 grayscale group-hover:grayscale-0 transition-all">
                {/* Platform Indicator (Simplified) */}
                <div className="w-4 h-4 bg-white/20 rounded-full" />
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed whitespace-normal line-clamp-4 italic">
              "{item.comment}"
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  const bgImage = PlaceHolderImages.find(img => img.id === "testimonial-bg");

  return (
    <section className="relative min-h-[100vh] py-32 overflow-hidden flex flex-col items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage?.imageUrl || "https://picsum.photos/seed/sky-zenith/1920/1080"}
          alt="Testimonial Background"
          fill
          className="object-cover"
          priority
          data-ai-hint="starry sky"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="text-center mb-20 px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-headline text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter"
          >
            Happiness speaks
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
          >
            What some of our 400K+ creators and developers in 180+ countries building everything from side projects to enterprise apps have to say.
          </motion.p>
        </div>

        <div className="space-y-8 max-w-[2000px] mx-auto">
          <MarqueeRow items={TESTIMONIALS} direction={1} speed={50} />
          <MarqueeRow items={[...TESTIMONIALS].reverse()} direction={-1} speed={60} />
        </div>
      </div>
    </section>
  );
}
