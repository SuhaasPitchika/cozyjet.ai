import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skippy — The Silent Observer | CozyJet AI Studio",
  description:
    "Skippy watches your workspace silently — GitHub, Notion, Figma, VSCode — and turns your daily work into ready-to-share content seeds. No manual logging required.",
  keywords: [
    "workspace AI",
    "content automation",
    "developer content",
    "GitHub to LinkedIn",
    "solopreneur tools",
    "AI content seeds",
    "CozyJet",
    "Skippy agent",
  ],
  openGraph: {
    title: "Skippy — The Silent Observer | CozyJet AI Studio",
    description:
      "Your work, automatically turned into social media content seeds. Skippy watches GitHub, Notion, Figma and extracts what's worth sharing.",
    type: "website",
  },
};

export default function SkippyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
