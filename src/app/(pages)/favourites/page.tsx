"use server";
import { FavouritesList } from "@/app/components/FavouritesList";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const Favourites = async () => {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Favourites</h1>
        <FavouritesList />
      </div>
    </main>
  );
};

export default Favourites;
