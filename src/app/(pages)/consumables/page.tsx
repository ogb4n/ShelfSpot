import ItemsTable from "@/components/ItemsTable";

const Consumables = async () => {
  // Récupération des consommables côté serveur
  const res = await fetch("http://localhost:3000/api/items/consumables", {
    cache: "no-store"
  });
  const items = await res.json();

  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Consommables</h1>
        <ItemsTable items={items} />
      </div>
    </main>
  );
};

export default Consumables;
