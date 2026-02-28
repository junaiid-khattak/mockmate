interface Props {
  className?: string;
  compact?: boolean;
}

const metrics = [
  { label: "Question Understanding", score: 9.1 },
  { label: "Communication Clarity", score: 8.5 },
  { label: "Reasoning Quality", score: 8.7 },
  { label: "Follow-up Depth", score: 7.8 },
  { label: "Confidence Calibration", score: 8.4 },
];

function scoreColor(s: number) {
  if (s >= 8) return "#34d399";
  if (s >= 6) return "#22d3ee";
  if (s >= 4) return "#fbbf24";
  return "#f87171";
}

export function ResultsDashboardMockup({ className = "", compact = false }: Props) {
  const overallScore = 8.6;
  // circumference ≈ 2π×70 ≈ 440
  const circumference = 440;
  const offset = Math.round(circumference * (1 - overallScore / 10));
  const accentColor = "#34d399";

  const displayMetrics = compact ? metrics.slice(0, 3) : metrics;

  return (
    <div
      className={className}
      style={{
        background: "#0e1424",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: compact ? 20 : 28,
        fontFamily: "'Instrument Sans', -apple-system, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Header label */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: compact ? 14 : 20,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: accentColor,
            boxShadow: `0 0 6px ${accentColor}`,
          }}
        />
        Interview Complete
      </div>

      {/* Score ring */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 16 : 20,
          marginBottom: compact ? 16 : 22,
        }}
      >
        <div
          style={{
            position: "relative",
            width: compact ? 72 : 96,
            height: compact ? 72 : 96,
            flexShrink: 0,
          }}
        >
          <svg
            style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
            viewBox="0 0 160 160"
          >
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={accentColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: compact ? 18 : 22,
                fontWeight: 700,
                color: accentColor,
                lineHeight: 1,
                letterSpacing: "-1px",
              }}
            >
              {overallScore}
            </span>
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "monospace",
              }}
            >
              /10
            </span>
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: compact ? 14 : 16,
              fontWeight: 700,
              color: "#e8eaf0",
              letterSpacing: "-0.3px",
              marginBottom: 4,
            }}
          >
            Excellent Performance
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}33`,
              borderRadius: 100,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: accentColor,
            }}
          >
            Top 15% of candidates
          </div>
        </div>
      </div>

      {/* Metric bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {displayMetrics.map(({ label, score }) => {
          const c = scoreColor(score);
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  width: 80,
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.05)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(score / 10) * 100}%`,
                    borderRadius: 2,
                    background: c,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: c,
                  width: 28,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {score}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendation snippets */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            background: "rgba(52,211,153,0.06)",
            border: "1px solid rgba(52,211,153,0.15)",
            borderRadius: 8,
            padding: "8px 10px",
          }}
        >
          <span style={{ color: "#34d399", fontSize: 12, flexShrink: 0 }}>✦</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
            Strong use of specific metrics and quantified outcomes throughout
          </span>
        </div>
        {!compact && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: "rgba(251,191,36,0.06)",
              border: "1px solid rgba(251,191,36,0.15)",
              borderRadius: 8,
              padding: "8px 10px",
            }}
          >
            <span style={{ color: "#fbbf24", fontSize: 12, flexShrink: 0 }}>⏳</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
              Follow-up depth can be improved — try the STAR method more consistently
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
