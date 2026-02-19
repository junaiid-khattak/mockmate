import type { Metadata } from "next";
import { NayldLogo } from "@/components/NayldLogo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — nayld.ai",
  description: "How nayld.ai collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: February 18, 2026</p>

        <div className="prose prose-slate mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-p:leading-relaxed prose-li:leading-relaxed">
          <p>
            nayld.ai (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the nayld.ai website and AI interview
            preparation service. This Privacy Policy explains how we collect, use, and protect your
            information.
          </p>

          <h2>1. Information We Collect</h2>

          <h3>Account Information</h3>
          <p>
            First name, last name, email address, and password when you create an account.
          </p>

          <h3>User-Uploaded Content</h3>
          <ul>
            <li>Resume files (PDF or DOCX format) that you upload to the platform.</li>
            <li>Job descriptions, job titles, company names, and source URLs that you provide.</li>
          </ul>

          <h3>Interview &amp; Analysis Data</h3>
          <ul>
            <li>AI-generated fit scores, interview questions, strengths, and growth area assessments.</li>
            <li>
              Interview session recordings, performance scores, and feedback generated during mock
              interviews.
            </li>
          </ul>

          <h3>Usage Data</h3>
          <p>Pages visited, features used, and general interaction patterns with the service.</p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide and operate the interview preparation service.</li>
            <li>To analyse your resume against job descriptions and generate fit scores.</li>
            <li>To conduct AI-powered mock interviews and produce performance assessments.</li>
            <li>To manage your account, billing, and interview credits.</li>
            <li>To communicate with you about your account or service updates.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell, rent, or share your personal data with third parties for
            marketing purposes.
          </p>

          <h2>3. Data Storage &amp; Security</h2>
          <p>Your data is stored using the following infrastructure:</p>
          <ul>
            <li>
              <strong>Supabase</strong> (PostgreSQL) for account data, job descriptions, interview
              records, and billing.
            </li>
            <li>
              <strong>AWS S3</strong> for resume file storage, encrypted at rest.
            </li>
            <li>
              <strong>AWS SQS</strong> for asynchronous job analysis processing.
            </li>
          </ul>
          <p>
            All data is transmitted over HTTPS. We use industry-standard encryption and access
            controls to protect your information.
          </p>

          <h2>4. Data Retention &amp; Deletion</h2>
          <p>
            You may request deletion of your account and all associated data at any time by
            contacting us at{" "}
            <a href="mailto:hello@nayld.ai" className="text-mm-violet hover:underline">
              hello@nayld.ai
            </a>
            . Upon receiving a deletion request, we will remove your personal data, uploaded resumes,
            job descriptions, and interview records within 30 days.
          </p>

          <h2>5. Third-Party Services</h2>
          <p>We use the following third-party services to operate nayld.ai:</p>
          <ul>
            <li>
              <strong>Supabase</strong> &mdash; authentication and database hosting.
            </li>
            <li>
              <strong>Amazon Web Services (AWS)</strong> &mdash; file storage and background
              processing.
            </li>
          </ul>
          <p>
            These providers process data on our behalf and are subject to their own privacy policies.
          </p>

          <h2>6. Cookies</h2>
          <p>
            nayld.ai uses essential cookies required for authentication and session management. We do
            not use advertising or third-party tracking cookies.
          </p>

          <h2>7. Children&apos;s Privacy</h2>
          <p>
            nayld.ai is not intended for use by individuals under 16 years of age. We do not
            knowingly collect personal data from children.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify registered users of
            material changes via email. Continued use of the service after changes constitutes
            acceptance of the updated policy.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
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
            <Link href="/refund" className="hover:text-slate-900">Refund Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
