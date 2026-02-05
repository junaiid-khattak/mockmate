import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MockMate — Resume-based mock interviews",
  description: "Upload your resume. Get interviewed. Get a scorecard. Improve fast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable + " min-h-screen bg-slate-50 text-slate-900 antialiased"}>
        {children}
      </body>
    </html>
  );
}
