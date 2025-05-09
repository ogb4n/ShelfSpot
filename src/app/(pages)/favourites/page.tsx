"use server";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ItemsTable from "@/components/ItemsTable";

const Favourites = async () => {
  const session = await getServerSession();
  if (!session) redirect("/login");

  // Récupération des favoris côté serveur
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/favourites`, {
    cache: "no-store"
  });
  const favourites = await res.json();
  // Extraction des objets favoris
  const items = Array.isArray(favourites) ? favourites.map((fav) => fav.item) : [];

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Favourites</h1>
        <ItemsTable items={items} />
      </div>
    </main>
  );
};

export default Favourites;
