import Link from "next/link";

type JobCardProps = {
  id: string;
  title: string | null;
  company: string | null;
  resumeId: string | null;
  updatedAt: string;
  fitScore?: number | null;
  fitScoreStatus?: "pending" | "ready" | "failed" | null;
};

export function JobCard({ id, title, company, resumeId, updatedAt, fitScore, fitScoreStatus }: JobCardProps) {
  const displayTitle = title || "Untitled position";

  const formattedDate = new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/jobs/${id}`} className="block">
      <div className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-medium text-slate-900 transition-colors group-hover:text-mm-violet">
              {displayTitle}
            </h3>
            {company && (
              <p className="mt-0.5 truncate text-sm text-slate-500">{company}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {fitScoreStatus === "ready" && fitScore != null && (
              <span className="inline-flex items-center rounded-full bg-mm-violet/[0.06] px-2.5 py-0.5 text-xs font-semibold text-mm-violet">
                {fitScore}/10
              </span>
            )}
            {fitScoreStatus === "pending" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-3 w-3 animate-spin rounded-full border border-slate-200 border-t-mm-violet" />
                Analyzing
              </span>
            )}
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs">
          {resumeId ? (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Resume attached
            </span>
          ) : (
            <span className="text-slate-400">No resume</span>
          )}
        </div>
      </div>
    </Link>
  );
}
