import { ItemsCard } from "@/app/components/ItemsCard";
import { BasicList } from "@/app/components/shared/BasicList";
import { MostUsedPlacesCard } from "@/app/components/ManageCard";

const Dashboard = () => {
  return (
    <>
      <header></header>
      <main className="flex min-h-screen items-center justify-center p -24">
        <div className="w-1/8 flex flex-col gap-2">
          <ItemsCard />
          <MostUsedPlacesCard />
        </div>
        <div className="w-1/2 ml-12">
          <BasicList />
        </div>
      </main>
    </>
  );
};

export default Dashboard;
