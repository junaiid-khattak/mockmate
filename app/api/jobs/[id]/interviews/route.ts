import { type NextRequest, NextResponse } from "next/server";
import { getInterviewsForJob } from "@/lib/queries/interviews";
import { apiError } from "@/lib/posthog/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const jobId = params.id;

  if (!jobId) {
    return apiError({ error: "Job ID is required", status: 400, route: "/api/jobs/[id]/interviews" });
  }

  try {
    const { interviews, error } = await getInterviewsForJob(request, jobId);

    if (error) {
      return apiError({ error: error.message, status: 500, route: "/api/jobs/[id]/interviews", cause: error });
    }

    return NextResponse.json({ ok: true, interviews });
  } catch (err) {
    console.error("[api/jobs/[id]/interviews] Error:", err);
    return apiError({ error: "Failed to fetch interviews", status: 500, route: "/api/jobs/[id]/interviews", cause: err });
  }
}
