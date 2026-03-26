"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "VFX Supervisor @ Frameshift",
    image: "https://picsum.photos/seed/alex/100/100",
    comment: "I went from spending 6 hours a week writing content to literally zero. Snooks handles everything — LinkedIn posts, email sequences, the lot. My pipeline grew 40% in 3 months and I barely touched it.",
    rotation: "-1.5deg"
  },
  {
    name: "Sarah Chen",
    role: "Fullstack Developer & Founder",
    image: "https://picsum.photos/seed/sarah/100/100",
    comment: "Flippo's deep work tracking exposed that I was 'busy' for 8 hours but only focused for 2. After two weeks of using it I restructured my day completely. I ship twice as fast now. No exaggeration.",
    rotation: "1deg"
  },
  {
    name: "Marcus Thorne",
    role: "Head of Growth @ TechFlow",
    image: "https://picsum.photos/seed/marcus/100/100",
    comment: "Snooks generated a Twitter thread that hit 2.1M impressions in 48 hours. We cancelled our $8k/month agency contract the same week. This tool paid for itself in the first afternoon.",
    rotation: "-0.5deg"
  },
  {
    name: "Elena Rossi",
    role: "Creative Director & Solopreneur",
    image: "https://picsum.photos/seed/elena/100/100",
    comment: "Skippy noticed I was stuck on the same Figma screen for 45 minutes and automatically surfaced my research notes from two weeks ago. It literally unstuck me. I don't know how I shipped anything before this.",
    rotation: "1.5deg"
  },
  {
    name: "Julian K.",
    role: "Bootstrapped Founder",
    image: "https://picsum.photos/seed/julian/100/100",
    comment: "I run a 1-person SaaS and was drowning in content creation. CozyJet Studio handles my entire social presence across 5 platforms. I get 10x the engagement with 5% of the effort. It's not even close.",
    rotation: "-1deg"
  },
  {
    name: "Priyah Sharma",
    role: "Product Designer @ Arclight",
    image: "https://picsum.photos/seed/priyah/100/100",
    comment: "My cold email reply rate went from 3% to 19% after Snooks rewrote my sequences. I sent the same leads the new copy and they started responding. It's wild how much of a difference the writing makes.",
    rotation: "0.5deg"
  },
  {
    name: "Tom Watkins",
    role: "Indie Maker",
    image: "https://picsum.photos/seed/tomw/100/100",
    comment: "The AI context system is what sells me. I described my product once and every piece of content Snooks creates sounds like me — not a generic AI. My audience literally can't tell the difference.",
    rotation: "-1.2deg"
  },
  {
    name: "Celine Dumont",
    role: "B2B Marketer",
    image: "https://picsum.photos/seed/celine/100/100",
    comment: "We used to spend three days producing a content calendar. Now it takes 20 minutes. The team was skeptical at first but after the first month of results nobody questions it anymore.",
    rotation: "0.8deg"
  },
  {
    name: "Raj Nair",
    role: "Tech Lead & Content Creator",
    image: "https://picsum.photos/seed/raj/100/100",
    comment: "Flippo caught that I do my best coding between 9am and noon and my worst after 3pm. I restructured my calendar around that and my bug count dropped. Actual data-driven improvement, not just vibes.",
    rotation: "-0.7deg"
  },
  {
    name: "Mei Lin",
    role: "Startup CEO",
    image: "https://picsum.photos/seed/meilin/100/100",
    comment: "We were spending $15k a month on content agencies. Switched to CozyJet Studio, cut that to $0, and our content quality actually went up. Our LinkedIn page grew from 800 to 12k followers in 4 months.",
    rotation: "1.3deg"
  },
];

function MarqueeRow({ items, direction = 1, speed = 40 }: { items: typeof TESTIMONIALS, direction?: 1 | -1, speed?: number }) {
  return (
    <div className="flex overflow-hidden group select-none py-12">
      <motion.div
        animate={{ x: direction === 1 ? [0, -2500] : [-2500, 0] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex gap-10 pr-10 whitespace-nowrap min-w-full"
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            style={{ transform: `rotate(${item.rotation})` }}
            className="w-[370px] bg-white p-8 border border-black/5 shadow-[4px_4px_15px_rgba(0,0,0,0.04)] rounded-2xl flex flex-col justify-between shrink-0 relative transition-transform hover:scale-105 hover:z-50"
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black/8" />

            <div className="flex gap-1 mb-4">
              {[0,1,2,3,4].map(s => (
                <svg key={s} className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>

            <p className="text-[13px] text-zinc-700 leading-relaxed whitespace-normal mb-6 font-sans italic">
              "{item.comment}"
            </p>

            <div className="flex items-center gap-4 mt-auto border-t border-black/5 pt-4">
              <Avatar className="w-9 h-9 border border-black/5">
                <AvatarImage src={item.image} />
                <AvatarFallback className="text-[10px]">{item.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-[10px] font-bold text-black tracking-tight uppercase">{item.name}</h4>
                <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-widest">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative min-h-[80vh] py-32 overflow-hidden flex flex-col items-center justify-center bg-[#fdfaf5]">
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] animate-move-dots"
        style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10 w-full">
        <div className="text-center mb-24">
          <h2 className="font-pixel text-xl md:text-2xl font-bold uppercase tracking-tight text-black">
            Studio <span className="text-[#8c6b4f]">Dispatches</span>
          </h2>
          <p className="font-sans text-[10px] text-zinc-400 mt-4 uppercase font-bold tracking-[0.3em]">
            Real results from real builders.
          </p>
        </div>

        <div className="space-y-4 max-w-[2400px] mx-auto">
          <MarqueeRow items={TESTIMONIALS} direction={1} speed={70} />
          <MarqueeRow items={[...TESTIMONIALS].reverse()} direction={-1} speed={85} />
        </div>
      </div>
    </section>
  );
}
