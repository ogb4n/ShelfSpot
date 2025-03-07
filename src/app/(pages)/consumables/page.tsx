"use server";
import { ConsumablesList } from "@/app/components/ConsumablesList";

const Consumables = () => {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <ConsumablesList />
    </main>
  );
};

export default Consumables;
