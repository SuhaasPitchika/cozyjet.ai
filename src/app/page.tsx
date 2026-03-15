import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { ThreeSlideshow } from "@/components/sections/three-slideshow";
import { RocketInfo } from "@/components/sections/rocket-info";
import { AgentsShowcase } from "@/components/sections/agents-showcase";
import { Testimonials } from "@/components/sections/testimonials";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ThreeSlideshow />
      <RocketInfo />
      <AgentsShowcase />
      <Testimonials />
      <Footer />
    </main>
  );
}
