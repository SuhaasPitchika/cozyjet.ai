import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snooks — The Content Strategist | CozyJet AI Studio",
  description:
    "Snooks plans your entire content week — what to post, when to post it, which trending topics to jump on, and where your calendar has gaps. Your AI content strategist.",
  keywords: [
    "content strategy AI",
    "social media planner",
    "content calendar",
    "posting schedule",
    "trending topics",
    "solopreneur marketing",
    "CozyJet",
    "Snooks agent",
  ],
  openGraph: {
    title: "Snooks — The Content Strategist | CozyJet AI Studio",
    description:
      "Your personal AI content strategist. Snooks plans your week, spots trending topics, and keeps your content calendar full — automatically.",
    type: "website",
  },
};

export default function SnooksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
