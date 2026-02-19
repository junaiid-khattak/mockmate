import type { Metadata } from "next";
import { NayldLogo } from "@/components/NayldLogo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy — nayld.ai",
  description: "Refund and cancellation policy for nayld.ai subscriptions and credits.",
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
          <h2>Subscriptions</h2>
          <ul>
            <li>
              You may cancel your Standard or Pro subscription at any time. Cancellation takes effect
              at the end of the current billing cycle &mdash; you will retain access to your remaining
              credits until then.
            </li>
            <li>We do not provide prorated refunds for partial billing cycles.</li>
            <li>
              If you experience a billing error (duplicate charge, incorrect amount), contact us at{" "}
              <a href="mailto:hello@nayld.ai" className="text-mm-violet hover:underline">
                hello@nayld.ai
              </a>{" "}
              within 14 days and we will issue a full correction.
            </li>
          </ul>

          <h2>One-Off Credit Purchases</h2>
          <ul>
            <li>
              Unused one-off credits are eligible for a refund within 14 days of purchase, provided
              none of the credits from that purchase have been consumed.
            </li>
            <li>
              Once any credit from a purchase has been used (i.e., a mock interview has been started),
              that purchase is no longer eligible for a refund.
            </li>
          </ul>

          <h2>Technical Issues</h2>
          <ul>
            <li>
              If a mock interview session fails due to a technical issue on our end (service outage,
              error preventing completion), the consumed credit will be restored to your account
              automatically or upon request.
            </li>
            <li>
              Contact{" "}
              <a href="mailto:hello@nayld.ai" className="text-mm-violet hover:underline">
                hello@nayld.ai
              </a>{" "}
              with your interview ID and a brief description of the issue.
            </li>
          </ul>

          <h2>How to Request a Refund</h2>
          <p>
            Email{" "}
            <a href="mailto:hello@nayld.ai" className="text-mm-violet hover:underline">
              hello@nayld.ai
            </a>{" "}
            with:
          </p>
          <ul>
            <li>Your account email address.</li>
            <li>The transaction or purchase in question.</li>
            <li>The reason for the refund request.</li>
          </ul>
          <p>We aim to respond to all refund requests within 5 business days.</p>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} nayld.ai. All rights reserved.
          </p>
          <nav className="flex gap-6 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
