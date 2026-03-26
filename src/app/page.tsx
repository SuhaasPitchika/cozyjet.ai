
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { ThreeSlideshow } from "@/components/sections/three-slideshow";
import { AgentsShowcase } from "@/components/sections/agents-showcase";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ThreeSlideshow />
      <AgentsShowcase />
      <Footer />
    </main>
  );
}
