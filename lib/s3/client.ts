import { S3Client } from "@aws-sdk/client-s3";
import { getSecrets } from "@/lib/secrets";

let cachedClient: S3Client | null = null;

export async function getS3Client(): Promise<S3Client> {
  if (cachedClient) return cachedClient;
  const secrets = await getSecrets();

  cachedClient = new S3Client({
    region: secrets.AWS_REGION,
  });

  return cachedClient;
}

export async function getResumeBucket(): Promise<string> {
  const secrets = await getSecrets();
  return secrets.S3_BUCKET_RESUMES;
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
