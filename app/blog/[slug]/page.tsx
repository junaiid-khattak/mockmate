import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug, getPostSlugs } from "@/lib/blog";
import { Breadcrumbs } from "@/components/Breadcrumbs";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: {
      canonical: `https://nayld.ai/blog/${params.slug}`,
    },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      url: `https://nayld.ai/blog/${params.slug}`,
      siteName: "nayld.ai",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedDate || post.date,
      images: post.ogImage
        ? [
            {
              url: post.ogImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== params.slug).slice(0, 3);

  // Article structured data
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updatedDate || post.date,
    author: {
      "@type": "Organization",
      name: "nayld.ai",
      url: "https://nayld.ai",
    },
    publisher: {
      "@type": "Organization",
      name: "nayld.ai",
      url: "https://nayld.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://cdn.nayld.ai/logo/nayld-logo-light.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://nayld.ai/blog/${params.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        {/* Header */}
        <header className="border-b border-slate-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-2xl font-bold gradient-text">
              nayld.ai
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Blog
              </Link>
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

        {/* Article Header */}
        <article className="mx-auto max-w-3xl px-6 py-16">
          <div className="mb-8">
            <Breadcrumbs
              items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
              className="mb-6"
            />

            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>{post.formattedDate}</time>
              </div>
              {post.updatedDate && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated {new Date(post.updatedDate).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* MDX Content */}
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-4xl prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-mm-violet prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-code:text-mm-violet prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-ul:my-6 prose-ol:my-6 prose-li:text-slate-600 prose-li:my-2">
            <MDXRemote source={post.content} />
          </div>

          {/* CTA Section */}
          <div className="mt-16 rounded-2xl border-2 border-mm-violet/20 bg-gradient-to-br from-mm-violet/5 to-purple-50 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to Prepare Smarter?</h2>
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
              Get your free resume analysis and fit score. Start practicing with AI-powered mock interviews tailored to
              your resume and the jobs you're targeting.
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Posts</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group rounded-lg border border-slate-200 p-4 hover:border-mm-violet/20 transition-colors"
                  >
                    <h3 className="font-semibold text-slate-900 group-hover:text-mm-violet transition-colors mb-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{relatedPost.excerpt}</p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={relatedPost.date}>{relatedPost.formattedDate}</time>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white py-8 mt-16">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <Link href="/" className="text-xl font-bold gradient-text">
              nayld.ai
            </Link>

            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <Link href="/" className="hover:text-slate-900">
                Home
              </Link>
              <Link href="/blog" className="hover:text-slate-900">
                Blog
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
            </nav>

            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} nayld.ai. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
