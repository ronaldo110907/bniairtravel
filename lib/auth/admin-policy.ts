import type { User } from "@supabase/supabase-js";

// Only server-controlled app_metadata and a server-configured allowlist grant access.
// user_metadata is editable by the user and must never authorize an administrator.
export function isAdminUser(user: User | null): boolean {
  if (!user || user.is_anonymous) return false;
  const emails = `cjjbni@cjjbni.com,ronaldo1109@naver.com,${process.env.ADMIN_EMAILS ?? ""}`
    .split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return user.app_metadata?.role === "admin" ||
    (!!user.email_confirmed_at && !!user.email && emails.includes(user.email.toLowerCase()));
}
