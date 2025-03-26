"use server";
import { ItemsCard } from "@/app/components/ItemsCard";
import { BasicList } from "@/app/components/BasicList";
import { MostUsedPlacesCard } from "@/app/components/ManageCard";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return (
    <main className="flex min-h-screen items-center justify-center p -24">
      <div className="w-1/8 flex flex-col gap-2">
        <ItemsCard />
        <MostUsedPlacesCard />
      </div>
      <div className="w-1/2 ml-12">
        <BasicList session={session} />
      </div>
    </main>
  );
};

export default Dashboard;
