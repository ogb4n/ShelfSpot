"use client";
import ItemsTable from "@/components/ItemsTable";
import useGetFavourites from "@/app/hooks/useGetFavourites";

export default function Favourites() {
  const { favourites, loading, error } = useGetFavourites();
  const items = Array.isArray(favourites) ? favourites.map((fav) => fav.item) : [];

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">Favourites</h1>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && <ItemsTable items={items} />}
    </div>
  );
}
