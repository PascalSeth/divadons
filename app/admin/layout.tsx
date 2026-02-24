import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { getServerSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const role = session?.user?.role;

  console.log('Admin Layout - Session:', {
    hasSession: !!session,
    userId: session?.user?.id,
    userRole: role
  })

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  // Redirect to home if not admin (better UX - go back to previous page concept)
  if (role !== "admin") {
    console.log('Access denied - User role is:', role, '- Redirecting to home')
    redirect("/");
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#f5f1e8", fontFamily: "'DM Mono', monospace" }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

