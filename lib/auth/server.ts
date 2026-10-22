import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminUser } from "./admin-policy";

export async function createServerSupabase() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* Server Components cannot write cookies; middleware refreshes them. */ }
      },
    },
  });
}

export async function getAdminUser(request?: Request) {
  try {
    const authorization = request?.headers.get("authorization");
    if (authorization !== null && authorization !== undefined) {
      if (!/^Bearer \S+$/i.test(authorization)) return null;
      const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.auth.getUser(authorization.slice(7));
      return !error && isAdminUser(data.user) ? data.user : null;
    }
    const client = await createServerSupabase();
    const { data, error } = await client.auth.getUser();
    return !error && isAdminUser(data.user) ? data.user : null;
  } catch { return null; }
}

export function unauthorized() {
  return NextResponse.json({ error: "관리자 로그인이 필요합니다.", message: "관리자 로그인이 필요합니다.", success: false }, {
    status: 401, headers: { "Cache-Control": "private, no-store" },
  });
}
