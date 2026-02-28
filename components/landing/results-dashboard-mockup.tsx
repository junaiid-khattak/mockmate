interface Props {
  className?: string;
  compact?: boolean;
}

// Scores are 0–100
const metrics = [
  { label: "Answer Correctness", score: 95 },
  { label: "Reasoning Quality", score: 85 },
  { label: "Communication Clarity", score: 75 },
  { label: "Behavioral Story Quality", score: 60 },
  { label: "Role Alignment Coverage", score: 50 },
];

function scoreColor(s: number) {
  if (s >= 80) return "#34d399";
  if (s >= 60) return "#fbbf24";
  return "#f87171";
}

export function ResultsDashboardMockup({ className = "", compact = false }: Props) {
  const overallScore = 8.2;
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
            Strong Performance
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
            Top 28% of candidates
          </div>
        </div>
      </div>

      {/* Metric bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: compact ? 0 : 16 }}>
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
                    width: `${score}%`,
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

      {/* Recommendation snippet */}
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
            marginBottom: 12,
          }}
        >
          <span style={{ color: "#fbbf24", fontSize: 12, flexShrink: 0 }}>⚡</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
            Use STAR method to structure behavioral stories with clear Situation, Task, Action, and Result.
          </span>
        </div>
      )}

      {/* Share row */}
      {!compact && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                marginBottom: 2,
              }}
            >
              Share Results
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)" }}>
              Send to mentors &amp; recruiters
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {/* LinkedIn */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "#0077b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            {/* X / Twitter */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "#000",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            {/* Copy link */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
