import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const alt = "nayld.ai Blog Post";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: "bold",
              color: "#555AFF",
            }}
          >
            Post Not Found
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

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
        {/* Title */}
        <div
          style={{
            fontSize: 60,
            fontWeight: "bold",
            color: "white",
            lineHeight: 1.2,
            maxWidth: "90%",
            display: "flex",
          }}
        >
          {post.title}
        </div>

        {/* Bottom bar with branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: "bold",
              background: "linear-gradient(135deg, #007BDD 0%, #555AFF 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            nayld.ai
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#94a3b8",
              display: "flex",
            }}
          >
            {post.formattedDate}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
