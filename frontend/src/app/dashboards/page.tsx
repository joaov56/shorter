import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg border p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-4">Em progresso</p>
      </div>
    </div>
  );
} 