import AdminHomeButton from "@/app/admin/AdminHomeButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pb-28">{children}</div>

      <AdminHomeButton />
    </>
  );
}
