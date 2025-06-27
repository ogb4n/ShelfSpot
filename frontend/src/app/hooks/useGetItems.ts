import { useState, useEffect } from "react";
import { Item } from "@/app/types";

/**
 * Hook pour récupérer tous les objets ou un objet spécifique de la maison
 */
function useGetItems(id?: string) {
  const [data, setData] = useState<Item[] | Item | null>(id ? null : []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const url = id ? `/api/items?id=${id}` : "/api/items";
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(id ? "Item not found" : "Error loading items");
        const result = await res.json();
        setData(result);
      } catch (err: unknown) {
        setData(id ? null : []);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    if (id === undefined || id) {
      fetchData();
    }
  }, [id]);

  return { data, loading, error };
}

export default useGetItems;
