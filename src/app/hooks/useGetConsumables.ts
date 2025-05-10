import { useState, useEffect } from "react";
import { Item } from "@/app/types";

function useGetConsumables() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConsumables() {
      try {
        const res = await fetch("/api/items/consumables");
        if (!res.ok) throw new Error("Erreur lors du chargement des consommables");
        const data = await res.json();
        setItems(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchConsumables();
  }, []);

  return { items, loading, error };
}

export default useGetConsumables;
