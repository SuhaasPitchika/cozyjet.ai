import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meta — The AI Copywriter | CozyJet AI Studio",
  description:
    "Meta turns your content seeds and ideas into ready-to-post content for every social platform simultaneously — LinkedIn, Twitter, Instagram. 3 strategic variations, in your voice.",
  keywords: [
    "AI copywriter",
    "LinkedIn post generator",
    "Twitter thread AI",
    "content generator",
    "marketing AI",
    "voice-matched content",
    "CozyJet",
    "Meta agent",
  ],
  openGraph: {
    title: "Meta — The AI Copywriter | CozyJet AI Studio",
    description:
      "Generate platform-perfect social content in 3 strategic variations. Meta learns your voice and gets better every time you use it.",
    type: "website",
  },
};

export default function MetaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
