import { createHmac } from "crypto";

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export type InterviewSessionTokenClaims = {
  iss: string;
  aud: string;
  sub: string;
  iat: number;
  exp: number;
  nbf?: number;
  jti: string;
  user_id: string;
  job_id: string;
  interview_id: string;
  duration_seconds?: number;
  interview_types?: string[];
  language?: string;
  voice?: string;
  model?: string;
  dashboard_return_url?: string;
};

export function signInterviewSessionToken(
  claims: InterviewSessionTokenClaims,
  secret: string,
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac("sha256", secret).update(unsignedToken).digest();
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}
