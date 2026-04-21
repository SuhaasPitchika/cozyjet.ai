import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ReplitAuthProvider } from "@/contexts/replit-auth-context";
import Script from "next/script";
import { Inter, Press_Start_2P, Space_Grotesk, VT323 } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pixel',
});

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-vt323',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
});

export const metadata: Metadata = {
  title: {
    default: 'CozyJet.AI — AI Content Marketing for Solopreneurs & Founders',
    template: '%s | CozyJet.AI',
  },
  description: 'CozyJet AI gives solopreneurs, developers, and startup founders three autonomous AI agents — Skippy (workspace observer), Meta (AI copywriter), and Snooks (content strategist) — to automate content creation and grow social media presence without manual effort.',
  keywords: [
    'AI content marketing',
    'AI copywriter for founders',
    'solopreneur marketing tool',
    'autonomous AI agents',
    'content automation SaaS',
    'LinkedIn content AI',
    'Twitter content generator',
    'AI for developers',
    'startup marketing automation',
    'content calendar AI',
    'CozyJet AI',
    'Skippy AI agent',
    'Meta AI copywriter',
    'Snooks content strategist',
  ],
  authors: [{ name: 'CozyJet.AI' }],
  creator: 'CozyJet.AI',
  metadataBase: new URL('https://cozyjet.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cozyjet.ai',
    siteName: 'CozyJet.AI',
    title: 'CozyJet.AI — AI Content Marketing for Solopreneurs & Founders',
    description: 'Three autonomous AI agents that watch your work, write your content, and plan your strategy — so you can build in public without the manual effort.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CozyJet AI — Autonomous Marketing Agents for Builders',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CozyJet.AI — AI Content Marketing for Solopreneurs',
    description: 'Skippy watches your work. Meta writes your content. Snooks plans your strategy. Automated content marketing for founders and developers.',
    images: ['/og-image.jpg'],
    creator: '@cozyjetai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${pressStart2P.variable} ${vt323.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="canonical" href="https://cozyjet.ai" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <Script src="https://auth.util.repl.co/script.js" strategy="beforeInteractive" />
        <ReplitAuthProvider>
          {children}
          <Toaster />
        </ReplitAuthProvider>
      </body>
    </html>
  );
}
