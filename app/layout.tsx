import "./globals.css";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { HubSpotTracking } from "@/components/HubSpotTracking";
import { GoogleTracking } from "@/components/GoogleTracking";
import { UmamiTracking } from "@/components/UmamiTracking";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://nayld.ai"),
  title: {
    default: "nayld.ai — AI Mock Interviews & Resume Fit Score",
    template: "%s | nayld.ai",
  },
  description:
    "Upload your resume, get AI-powered mock interviews tailored to your background. Receive instant feedback, improve your interview skills, and land your dream job.",
  keywords: [
    "mock interview",
    "AI interview",
    "interview practice",
    "resume analysis",
    "job interview prep",
    "career coaching",
    "interview feedback",
    "AI career tools",
  ],
  authors: [{ name: "NayldAi" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nayld.ai",
    siteName: "nayld.ai",
    title: "nayld.ai — AI-Powered Mock Interviews",
    description:
      "Upload your resume, get AI-powered mock interviews tailored to your background. Receive instant feedback and improve fast.",
    images: [
      {
        url: "https://cdn.nayld.ai/logo/nayld-logo-light.png",
        width: 1200,
        height: 630,
        alt: "nayld.ai - AI-Powered Mock Interviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "nayld.ai — AI-Powered Mock Interviews",
    description:
      "Upload your resume, get AI-powered mock interviews tailored to your background.",
    images: ["https://cdn.nayld.ai/logo/nayld-logo-light.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "nayld.ai",
    url: "https://nayld.ai",
    description:
      "AI-powered interview preparation platform that scores resume-job fit, generates tailored questions, and conducts realistic mock interviews.",
    sameAs: [],
  };

  return (
    <html lang="en">
      <body className={inter.variable + " " + outfit.variable + " min-h-screen bg-white text-slate-900 antialiased"}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
        <GoogleTracking />
        <HubSpotTracking />
        <UmamiTracking />
      </body>
    </html>
  );
}
