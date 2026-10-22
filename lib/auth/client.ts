export async function assertAdminSession() {
  const response = await fetch("/api/admin/session", { cache: "no-store" });
  if (!response.ok) throw new Error("관리자 로그인이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
}
