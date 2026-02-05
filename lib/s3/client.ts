import { S3Client } from "@aws-sdk/client-s3";

let cachedClient: S3Client | null = null;

function getS3Env() {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET_RESUMES;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Missing AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, or S3_BUCKET_RESUMES");
  }

  return { region, accessKeyId, secretAccessKey, bucket };
}

export function getS3Client() {
  if (cachedClient) return cachedClient;
  const { region, accessKeyId, secretAccessKey } = getS3Env();

  cachedClient = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedClient;
}

export function getResumeBucket() {
  return getS3Env().bucket;
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
