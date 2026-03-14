import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'CozyJet.AI | Autonomous Marketing & Productivity',
  description: 'The billionaire-vision AI agentic studio for solopreneurs and startups. Powered by Skippy, Flippo, and Snooks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@500;700&family=Caveat:wght@400;700&family=Indie+Flower&family=Gloria+Hallelujah&display=swap" rel="stylesheet" />
      </head>
      <body className="font-pixel antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
