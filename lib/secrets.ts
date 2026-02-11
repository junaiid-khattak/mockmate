const REQUIRED_ENV_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "S3_BUCKET_RESUMES",
  "SQS_QUEUE_URL",
  "AWS_REGION",
] as const;

/**
 * Validates that all required environment variables are set.
 * Called once at server startup from instrumentation.ts.
 * Throws if any are missing so the app fails fast.
 */
export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key]?.trim(),
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
