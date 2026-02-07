import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs — nayld.ai",
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
