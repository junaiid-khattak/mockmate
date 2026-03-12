import type { User } from "@supabase/supabase-js";

type UserLike = Pick<User, "email" | "user_metadata"> | null | undefined;

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function splitFullName(fullName: string | null): { firstName: string; lastName: string } {
  if (!fullName) {
    return { firstName: "", lastName: "" };
  }

  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function getUserNameParts(user: UserLike): { firstName: string; lastName: string } {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = readString(meta.full_name) ?? readString(meta.name);
  const splitName = splitFullName(fullName);

  return {
    firstName:
      readString(meta.first_name) ??
      readString(meta.given_name) ??
      splitName.firstName,
    lastName:
      readString(meta.last_name) ??
      readString(meta.family_name) ??
      splitName.lastName,
  };
}

export function getUserDisplayFirstName(user: UserLike): string {
  const { firstName } = getUserNameParts(user);
  if (firstName) return firstName;
  return user?.email?.split("@")[0] ?? "";
}

export function getUserAvatarUrl(user: UserLike): string | null {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  return readString(meta.avatar_url) ?? readString(meta.picture);
}
