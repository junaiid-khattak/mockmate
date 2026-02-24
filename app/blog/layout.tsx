import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Blog | nayld.ai",
    template: "%s | nayld.ai Blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
