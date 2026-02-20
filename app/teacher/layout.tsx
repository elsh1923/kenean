import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and staff role (admin or teacher)
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/teacher");
  }

  // Both admins and teachers can access the teacher panel
  if (session.user.role !== "admin" && session.user.role !== "teacher") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark/98 to-black">
      <TeacherSidebar userName={session.user.name || session.user.email} />
      
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
