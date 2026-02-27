import { ImageResponse } from "next/og";

export const alt = "nayld.ai AI Mock Interviews — Practice with a Realistic AI Interviewer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#ef4460",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "flex",
            }}
          >
            AI Mock Interviews
          </div>
          <div
            style={{
              fontSize: 58,
              fontWeight: "bold",
              color: "white",
              lineHeight: 1.15,
              maxWidth: "85%",
              display: "flex",
            }}
          >
            Practice with a Realistic AI Interviewer
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#94a3b8",
              display: "flex",
            }}
          >
            Adaptive follow-ups. Real pressure. Detailed feedback.
          </div>
        </div>

        <div
          style={{
            fontSize: 40,
            fontWeight: "bold",
            background: "linear-gradient(135deg, #ef4460 0%, #f97066 50%, #fb923c 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            display: "flex",
          }}
        >
          nayld.ai
        </div>
      </div>
    ),
    { ...size }
  );
}
