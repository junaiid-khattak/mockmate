import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
      {/* Microphone icon — purple gradient rounded square */}
      <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-gradient-to-br from-[#7c5cfc] to-[#9b82fd] text-[32px] shadow-[0_4px_24px_rgba(124,92,252,0.18)]">
        🎙️
      </div>

      <h2 className="mb-2 text-[26px] font-extrabold tracking-[-0.8px] text-[#111118]">
        Would you pass your next interview?
      </h2>

      <p className="mb-7 max-w-[440px] text-[15px] leading-relaxed text-[#6b6b80]">
        Add the job you&apos;re targeting and upload your resume. In under 2 minutes,
        you&apos;ll know exactly where you stand — and where you&apos;d fail.
      </p>

      <Link
        href="/jobs/new"
        className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#6341e0] px-9 py-4 text-base font-bold text-white shadow-[0_4px_24px_rgba(124,92,252,0.18)] transition-all hover:shadow-[0_6px_32px_rgba(124,92,252,0.25)]"
      >
        Find Out Now →
      </Link>

      <p className="mt-[14px] text-xs text-[#9d9db0]">
        Takes under 2 minutes · No credit card required
      </p>

      <p className="mt-5 max-w-xs text-xs italic text-[#9d9db0]">
        ⭐ &ldquo;The mock interview caught gaps I didn&apos;t even know I had.&rdquo; — Rachel M., landed at Deloitte
      </p>
    </div>
  );
}
