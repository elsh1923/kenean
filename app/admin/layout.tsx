import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and admin role
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark/98 to-black">
      <AdminSidebar userName={session.user.name || session.user.email} />
      
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
