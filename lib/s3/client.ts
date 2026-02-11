import { S3Client } from "@aws-sdk/client-s3";

let cachedClient: S3Client | null = null;

export function getS3Client(): S3Client {
  if (cachedClient) return cachedClient;

  cachedClient = new S3Client({
    region: process.env.AWS_REGION!,
  });

  return cachedClient;
}

export function getResumeBucket(): string {
  return process.env.S3_BUCKET_RESUMES!;
}

function sanitizeFilename(filename: string) {
  const base = filename.split("/").pop()?.split("\\").pop() ?? "resume";
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, "-");
  const trimmed = sanitized.replace(/-+/g, "-").replace(/^[-_]+|[-_]+$/g, "");
  return trimmed || "resume";
}

export function buildResumeKey(userId: string, filename: string) {
  const safeFilename = sanitizeFilename(filename);
  const uuid = crypto.randomUUID();
  return `resumes/${userId}/${uuid}-${safeFilename}`;
}
