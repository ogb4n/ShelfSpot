"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return (
    <main className="flex min-h-screen items-center justify-center p -24">
      <div className="w-1/8 flex flex-col gap-2">

      </div>
      <div className="w-1/2 ml-12">

      </div>
    </main>
  );
};

export default Dashboard;
