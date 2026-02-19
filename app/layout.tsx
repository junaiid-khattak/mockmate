import "./globals.css";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["700", "800"] });

export const metadata: Metadata = {
  title: "nayld.ai — Resume-based mock interviews",
  description: "Upload your resume. Get interviewed. Get a scorecard. Improve fast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable + " " + outfit.variable + " min-h-screen bg-white text-slate-900 antialiased"}>
        {children}
      </body>
    </html>
  );
}
