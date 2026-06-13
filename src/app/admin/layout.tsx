import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (
    !session?.user ||
    !["ADMIN", "RECEPTIONIST"].includes(session.user.role)
  ) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar role={session.user.role} userName={session.user.name ?? ""} />
      <main className="flex-1 overflow-x-hidden p-6 lg:p-10">{children}</main>
    </div>
  );
}
