import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Interview preparation guides, AI mock interview tips, and career advice from nayld.ai. Learn how to ace your next interview.",
  keywords: [
    "AI interview prep blog",
    "interview preparation tips",
    "mock interview guide",
    "career advice",
    "interview tips",
  ],
  alternates: {
    canonical: "https://nayld.ai/blog",
  },
  openGraph: {
    title: "Blog | nayld.ai",
    description:
      "Interview preparation guides, AI mock interview tips, and career advice from nayld.ai.",
    url: "https://nayld.ai/blog",
    siteName: "nayld.ai",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold gradient-text">
            nayld.ai
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/signup" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign Up
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 text-xs">
            Resources
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">nayld.ai Blog</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Interview preparation guides, AI mock interview tips, and career advice to help you land your dream job.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        {posts.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-12 text-center">
              <p className="text-slate-600">No blog posts yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Card key={post.slug} className="border-slate-200 hover:border-mm-violet/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.date}>{post.formattedDate}</time>
                    {post.tags && post.tags.length > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <div className="flex gap-2">
                          {post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <CardTitle className="text-2xl">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-mm-violet transition-colors"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="ghost" className="gap-2 px-0">
                      Read more
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Link href="/" className="text-xl font-bold gradient-text">
            nayld.ai
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <Link href="/resume-fit-score" className="hover:text-slate-900">
              Resume Fit Score
            </Link>
            <Link href="/ai-mock-interviews" className="hover:text-slate-900">
              AI Mock Interviews
            </Link>
            <Link href="/pricing" className="hover:text-slate-900">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Terms
            </Link>
          </nav>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} nayld.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
