import { useState, useEffect } from "react";
import { Item } from "@/app/types";

/**
 * Hook pour récupérer tous les objets de la maison
 */
function useGetItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/items");
        if (!res.ok) throw new Error("Erreur lors du chargement des objets");
        const data = await res.json();
        setItems(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  return { items, loading, error };
}

export default useGetItems;
