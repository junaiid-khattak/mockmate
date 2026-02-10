import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export interface ServerSecrets {
  SUPABASE_SERVICE_ROLE_KEY: string;
  S3_BUCKET_RESUMES: string;
  SQS_QUEUE_URL: string;
  AWS_REGION: string;
  INTERVIEW_EXCHANGE_SECRET?: string;
  INTERVIEW_APP_URL?: string;
}

const REQUIRED_SECRET_KEYS: readonly (keyof ServerSecrets)[] = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "S3_BUCKET_RESUMES",
  "SQS_QUEUE_URL",
  "AWS_REGION",
];

const OPTIONAL_SECRET_KEYS: readonly (keyof ServerSecrets)[] = [
  "INTERVIEW_EXCHANGE_SECRET",
  "INTERVIEW_APP_URL",
];

let cached: ServerSecrets | null = null;
let pending: Promise<ServerSecrets> | null = null;
let rawCached: Record<string, string> | null = null;
let rawPending: Promise<Record<string, string>> | null = null;

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
  const parsed = await getRawSecrets();
  const secrets: Partial<ServerSecrets> = {};
  for (const key of REQUIRED_SECRET_KEYS) {
    const value = parsed[key];
    if (!value) {
      const secretName = process.env.AWS_SECRET_NAME;
      if (secretName) {
        throw new Error(`AWS secret "${secretName}" is missing required key "${key}"`);
      }
      throw new Error(
        `Missing env var "${key}" (set AWS_SECRET_NAME to use Secrets Manager instead)`,
      );
    }
    secrets[key] = value;
  }

  for (const key of OPTIONAL_SECRET_KEYS) {
    const value = parsed[key];
    if (typeof value === "string" && value.trim()) {
      secrets[key] = value;
    }
  }

  return secrets as ServerSecrets;
}

function readFromEnv(): ServerSecrets {
  const secrets: Partial<ServerSecrets> = {};
  for (const key of REQUIRED_SECRET_KEYS) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing env var "${key}" (set AWS_SECRET_NAME to use Secrets Manager instead)`);
    }
    secrets[key] = value;
  }

  for (const key of OPTIONAL_SECRET_KEYS) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      secrets[key] = value;
    }
  }

  return secrets as ServerSecrets;
}

export async function getRawSecrets(): Promise<Record<string, string>> {
  if (rawCached) return rawCached;
  if (rawPending) return rawPending;

  rawPending = loadRawSecrets();
  rawCached = await rawPending;
  rawPending = null;
  return rawCached;
}

export async function getInterviewAppUrlFromSecrets(): Promise<string | null> {
  const secrets = await getRawSecrets();
  const value = secrets.INTERVIEW_APP_URL;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function getInterviewExchangeSecretFromSecrets(): Promise<string | null> {
  const secrets = await getRawSecrets();
  const value = secrets.INTERVIEW_EXCHANGE_SECRET;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function loadRawSecrets(): Promise<Record<string, string>> {
  const secretName = process.env.AWS_SECRET_NAME;
  if (!secretName) {
    return readRawFromEnv();
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
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "string" && value) {
      secrets[key] = value;
    }
  }

  return secrets;
}

function readRawFromEnv(): Record<string, string> {
  const secrets: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string" && value) {
      secrets[key] = value;
    }
  }
  return secrets;
}
