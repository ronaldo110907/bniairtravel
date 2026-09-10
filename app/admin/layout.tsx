import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <Link
        href="/admin"
        className="fixed bottom-6 right-6 z-[9999] rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-black"
      >
        🏠 관리자 메인
      </Link>
    </>
  );
}
