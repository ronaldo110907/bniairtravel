import AdminHomeButton from "@/app/admin/AdminHomeButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <AdminHomeButton />
    </>
  );
}
