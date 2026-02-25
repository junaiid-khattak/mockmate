import { type NextRequest, NextResponse } from "next/server";
import { getInterviewsForJob } from "@/lib/queries/interviews";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const jobId = params.id;

  if (!jobId) {
    return NextResponse.json(
      { ok: false, error: "Job ID is required" },
      { status: 400 },
    );
  }

  try {
    const { interviews, error } = await getInterviewsForJob(request, jobId);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, interviews });
  } catch (err) {
    console.error("[api/jobs/[id]/interviews] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch interviews" },
      { status: 500 },
    );
  }
}
