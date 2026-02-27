import type { Metadata } from "next";
import { NayldLogo } from "@/components/NayldLogo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy — nayld.ai",
  description: "Refund and cancellation policy for nayld.ai subscriptions and credits.",
  alternates: {
    canonical: "https://nayld.ai/refund",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/">
            <NayldLogo className="h-8 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-slate-500 transition-colors hover:text-slate-900">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Refund Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: February 18, 2026</p>

        <div className="prose prose-slate mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-li:leading-relaxed">
          <h2>14-Day Money-Back Guarantee</h2>
          <p>
            We offer a full refund within 14 days of purchase for all credit purchases. To request a
            refund, contact us at{" "}
            <a href="mailto:hello@nayld.ai" className="text-mm-violet hover:underline">
              hello@nayld.ai
            </a>{" "}
            with your account email and transaction details.
          </p>

          <h2>Cancellation</h2>
          <p>
            You may cancel your subscription at any time. Cancellation takes effect at the end of the
            current billing cycle.
          </p>

          <h2>Processing Time</h2>
          <p>
            Refunds are processed within 5-7 business days. The funds will be returned to your
            original payment method.
          </p>

          <h2>Contact</h2>
          <p>
            For refund requests or billing questions, email{" "}
            <a href="mailto:hello@nayld.ai" className="text-mm-violet hover:underline">
              hello@nayld.ai
            </a>
            .
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} nayld.ai. All rights reserved.
          </p>
          <nav className="flex gap-6 text-xs text-slate-500">
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/refund" className="hover:text-slate-900">Refund</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
