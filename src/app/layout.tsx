import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { ReplitAuthProvider } from "@/contexts/replit-auth-context";
import Script from "next/script";
import { Inter, Press_Start_2P, Space_Grotesk } from 'next/font/google';

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

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
});

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
    <html lang="en" className={`${inter.variable} ${pressStart2P.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Script src="https://auth.util.repl.co/script.js" strategy="beforeInteractive" />
        <ReplitAuthProvider>
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </ReplitAuthProvider>
      </body>
    </html>
  );
}
