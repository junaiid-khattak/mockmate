import Link from "next/link";

interface StatsRowProps {
  stats: {
    totalJobs: number;
    totalInterviews: number;
    uniqueCompanies: number;
    jobsWithInterviews: number;
    overallBestScore: number | null; // 0-100 scale
    bestScoreJobTitle: string | null;
  };
  creditCount: number;
}

export function StatsRow({ stats, creditCount }: StatsRowProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3.5 md:grid-cols-4">
      {/* Active Jobs */}
      <div className="rounded-xl border border-[#e8e8ef] bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-[#9d9db0]">
          <span>📋</span>
          <span>Active Jobs</span>
        </div>
        <div className="text-[32px] font-extrabold leading-none tracking-tight text-[#111118]">
          {stats.totalJobs}
        </div>
        <div className="mt-1 text-[11px] text-[#9d9db0]">
          {stats.uniqueCompanies > 0
            ? `Across ${stats.uniqueCompanies} ${stats.uniqueCompanies === 1 ? "company" : "companies"}`
            : "No companies yet"}
        </div>
      </div>

      {/* Interviews Done */}
      <div className="rounded-xl border border-[#e8e8ef] bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-[#9d9db0]">
          <span>🎙️</span>
          <span>Interviews Done</span>
        </div>
        <div className="text-[32px] font-extrabold leading-none tracking-tight text-[#7c5cfc]">
          {stats.totalInterviews}
        </div>
        <div className="mt-1 text-[11px] text-[#9d9db0]">
          {stats.jobsWithInterviews > 0
            ? `Across ${stats.jobsWithInterviews} ${stats.jobsWithInterviews === 1 ? "job" : "jobs"}`
            : "Get started"}
        </div>
      </div>

      {/* Best Score */}
      <div className="rounded-xl border border-[#e8e8ef] bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-[#9d9db0]">
          <span>🏆</span>
          <span>Best Score</span>
        </div>
        <div className="text-[32px] font-extrabold leading-none tracking-tight text-green-600">
          {stats.overallBestScore != null
            ? (stats.overallBestScore / 10).toFixed(1)
            : "—"}
        </div>
        <div className="mt-1 truncate text-[11px] text-[#9d9db0]">
          {stats.bestScoreJobTitle || "No interviews yet"}
        </div>
      </div>

      {/* Credits */}
      <div className="rounded-xl border border-[#e8e8ef] bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-[#9d9db0]">
          <span>⚡</span>
          <span>Credits</span>
        </div>
        <div className="text-[32px] font-extrabold leading-none tracking-tight text-[#111118]">
          {creditCount}
        </div>
        <Link
          href="/settings/billing"
          className="mt-1 inline-block text-[11px] font-semibold text-green-600 transition-colors hover:text-green-700"
        >
          Buy more →
        </Link>
      </div>
    </div>
  );
}
