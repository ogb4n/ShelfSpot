"use client";
import ItemsTable from "@/components/ItemsTable";
import useGetFavourites from "@/app/hooks/useGetFavourites";

export default function Favourites() {
  const { favourites, loading, error } = useGetFavourites();
  const items = Array.isArray(favourites) ? favourites.map((fav) => fav.item) : [];

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Favourites</h1>
        {loading && <div>Chargement…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && <ItemsTable items={items} />}
      </div>
    </main>
  );
}
