import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-headline" });

export const metadata: Metadata = {
  title: "CozyJet AI | Your Solo Marketing Employee",
  description: "The intelligent marketing studio for developers and creators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={cn(
        "min-h-screen font-sans antialiased",
        inter.variable,
        outfit.variable
      )}>
        <div className="flex h-screen overflow-hidden bg-[#fdfbf7]">
          <Sidebar />
          <main className="flex-1 overflow-y-auto relative z-0">
             {children}
          </main>
        </div>
      </body>
    </html>
  );
}
