interface MiniProgressBarProps {
  firstScore: number; // 0-100 scale (database)
  bestScore: number; // 0-100 scale (database)
  improvement: number; // Difference (0-100 scale)
  interviewCount: number;
}

export function MiniProgressBar({
  firstScore,
  bestScore,
  improvement,
  interviewCount,
}: MiniProgressBarProps) {
  // Display on 0-10 scale
  const firstDisplay = (firstScore / 10).toFixed(1);
  const bestDisplay = (bestScore / 10).toFixed(1);
  const improvementDisplay = (improvement / 10).toFixed(1);
  const improved = improvement > 0;

  return (
    <div className="mt-2 flex items-center gap-[6px]">
      <span className="w-[60px] text-[10px] text-[#9d9db0]">
        {interviewCount} {interviewCount === 1 ? "interview" : "interviews"}
      </span>
      <span className="text-[10px] text-[#9d9db0]">{firstDisplay}</span>
      <div className="h-1 w-20 overflow-hidden rounded-[2px] bg-[#f2f2f7]">
        <div
          className={`h-full rounded-[2px] ${improved ? "bg-green-600" : "bg-amber-500"}`}
          style={{ width: "100%" }}
        />
      </div>
      <span className="text-[10px] font-bold text-green-600">{bestDisplay}</span>
      <span
        className={`text-[10px] font-semibold ${improved ? "text-green-600" : "text-[#6b6b80]"}`}
      >
        {improved ? `↑ +${improvementDisplay}` : improvementDisplay}
      </span>
    </div>
  );
}
