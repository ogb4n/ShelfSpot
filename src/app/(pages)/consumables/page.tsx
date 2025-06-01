"use client";
import ItemsTable from "@/components/ItemsTable";
import useGetConsumables from "@/app/hooks/useGetConsumables";

export default function Consumables() {
  const { items, loading, error } = useGetConsumables();

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">Consumables</h1>
      {loading && <div>Chargement…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && <ItemsTable items={items} />}
    </div>
  );
}
