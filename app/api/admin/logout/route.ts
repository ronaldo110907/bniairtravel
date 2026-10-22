import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/auth/server";

export async function POST() {
  const client = await createServerSupabase();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) return NextResponse.json({ success: false }, { status: 500 });
  const store = await cookies();
  for (const name of ["admin_user", "admin_email"]) store.set(name, "", { path: "/", maxAge: 0 });
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
}
