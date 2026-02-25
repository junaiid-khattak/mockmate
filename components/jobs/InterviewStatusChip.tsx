import { relativeTime } from "@/lib/utils";

type InterviewStatus = "none" | "practiced";

interface InterviewStatusChipProps {
  status: InterviewStatus;
  interviewCount: number;
  questionsReady?: number;
  lastInterviewAt?: string | null;
}

export function InterviewStatusChip({
  status,
  interviewCount,
  questionsReady = 10,
  lastInterviewAt,
}: InterviewStatusChipProps) {
  if (status === "none") {
    return (
      <div className="flex min-w-[100px] flex-col items-center gap-[3px]">
        <div className="inline-flex items-center gap-[5px] rounded-full border border-[rgba(124,92,252,0.18)] bg-[rgba(124,92,252,0.06)] px-3.5 py-1.5 text-xs font-semibold text-[#7c5cfc]">
          🎙️ Not practiced
        </div>
        <div className="text-[10px] text-[#9d9db0]">
          {questionsReady} questions ready
        </div>
      </div>
    );
  }

  // status === "practiced"
  return (
    <div className="flex min-w-[100px] flex-col items-center gap-[3px]">
      <div className="inline-flex items-center gap-[5px] rounded-full border border-[rgba(22,163,74,0.15)] bg-[rgba(22,163,74,0.08)] px-3.5 py-1.5 text-xs font-semibold text-green-600">
        ✓{" "}
        {interviewCount} {interviewCount === 1 ? "interview" : "interviews"}
      </div>
      {lastInterviewAt && (
        <div className="text-[10px] text-[#9d9db0]">
          Last: {relativeTime(lastInterviewAt)}
        </div>
      )}
    </div>
  );
}
