import Link from "next/link";

type JobCardProps = {
  id: string;
  title: string | null;
  company: string | null;
  resumeId: string | null;
  updatedAt: string;
};

export function JobCard({ id, title, company, resumeId, updatedAt }: JobCardProps) {
  const displayTitle = title || "Untitled position";

  const formattedDate = new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/jobs/${id}`} className="block">
      <div className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-medium text-gray-900 transition-colors group-hover:text-mm-violet">
              {displayTitle}
            </h3>
            {company && (
              <p className="mt-0.5 truncate text-sm text-gray-500">{company}</p>
            )}
          </div>
          <span className="shrink-0 text-xs text-gray-400">{formattedDate}</span>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs">
          {resumeId ? (
            <span className="inline-flex items-center gap-1 text-gray-500">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Resume attached
            </span>
          ) : (
            <span className="text-gray-400">No resume</span>
          )}
          <span className="text-gray-300">·</span>
          <span className="text-gray-400">Brief not generated yet</span>
        </div>
      </div>
    </Link>
  );
}
