import { createHash, randomBytes } from "crypto";

const LAUNCH_CODE_BYTES = 32;

function base64UrlEncode(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function hashInterviewLaunchCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function createInterviewLaunchCode(): { code: string; codeHash: string } {
  const code = base64UrlEncode(randomBytes(LAUNCH_CODE_BYTES));
  return {
    code,
    codeHash: hashInterviewLaunchCode(code),
  };
}
