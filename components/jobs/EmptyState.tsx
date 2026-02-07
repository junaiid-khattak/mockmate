import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-mm-violet">
          <path
            d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
        Your interview prep starts here
      </h2>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-gray-500">
        Add a job you&apos;re targeting and we&apos;ll build a tailored preparation brief
        grounded in your resume.
      </p>

      <Link
        href="/jobs/new"
        className="mt-8 inline-flex items-center rounded-lg bg-mm-violet px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-600"
      >
        Prepare for a job
      </Link>

      <p className="mt-16 max-w-xs text-xs leading-relaxed text-gray-400">
        You&apos;re in the right hands. Everything here is built to help you
        walk into your next interview with clarity and confidence.
      </p>
    </div>
  );
}
