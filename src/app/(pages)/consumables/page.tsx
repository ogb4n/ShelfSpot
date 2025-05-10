"use client";
import ItemsTable from "@/components/ItemsTable";
import useGetConsumables from "@/app/hooks/useGetConsumables";

export default function Consumables() {
  const { items, loading, error } = useGetConsumables();

  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Consommables</h1>
        {loading && <div>Chargement…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && <ItemsTable items={items} />}
      </div>
    </main>
  );
}
