import { NextResponse } from "next/server";
import { getAdminUser, unauthorized } from "@/lib/auth/server";

export async function GET(request: Request) {
  if (!await getAdminUser(request)) return unauthorized();
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
}
