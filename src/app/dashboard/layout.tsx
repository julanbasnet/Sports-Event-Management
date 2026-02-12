import { redirect } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";

import { getUser } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar userEmail={user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
