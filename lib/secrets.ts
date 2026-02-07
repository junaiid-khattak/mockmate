import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export interface ServerSecrets {
  SUPABASE_SERVICE_ROLE_KEY: string;
  S3_BUCKET_RESUMES: string;
  SQS_QUEUE_URL: string;
  AWS_REGION: string;
}

const SECRET_KEYS: readonly (keyof ServerSecrets)[] = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "S3_BUCKET_RESUMES",
  "SQS_QUEUE_URL",
  "AWS_REGION",
];

let cached: ServerSecrets | null = null;
let pending: Promise<ServerSecrets> | null = null;

/**
 * Returns server-side secrets, fetched once and cached in memory.
 *
 * - If AWS_SECRET_NAME is set, fetches from AWS Secrets Manager (IAM role auth).
 * - Otherwise falls back to process.env (local development).
 */
export async function getSecrets(): Promise<ServerSecrets> {
  if (cached) return cached;
  if (pending) return pending;

  pending = loadSecrets();
  cached = await pending;
  pending = null;
  return cached;
}

async function loadSecrets(): Promise<ServerSecrets> {
  const secretName = process.env.AWS_SECRET_NAME;

  if (!secretName) {
    return readFromEnv();
  }

  const client = new SecretsManagerClient({});
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName }),
  );

  if (!response.SecretString) {
    throw new Error(`AWS secret "${secretName}" has no SecretString`);
  }

  const parsed = JSON.parse(response.SecretString) as Record<string, unknown>;

  const secrets: Record<string, string> = {};
  for (const key of SECRET_KEYS) {
    const value = parsed[key];
    if (typeof value !== "string" || !value) {
      throw new Error(`AWS secret "${secretName}" is missing required key "${key}"`);
    }
    secrets[key] = value;
  }

  return secrets as ServerSecrets;
}

function readFromEnv(): ServerSecrets {
  const secrets: Record<string, string> = {};
  for (const key of SECRET_KEYS) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing env var "${key}" (set AWS_SECRET_NAME to use Secrets Manager instead)`);
    }
    secrets[key] = value;
  }
  return secrets as ServerSecrets;
}
