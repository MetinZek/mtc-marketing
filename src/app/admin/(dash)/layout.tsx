import { Sidebar } from "@/components/admin/Sidebar";
import { requireSession } from "@/lib/admin/auth";

export default async function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return (
    <div className="md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
