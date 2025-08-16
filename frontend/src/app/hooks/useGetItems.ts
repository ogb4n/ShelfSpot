import { useState, useEffect } from "react";
import { Item } from "@/app/types";
import { backendApi, BackendApiError } from "@/lib/backend-api";

/**
 * Hook to fetch all items or a specific item from the house
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
        if (id) {
          const result = await backendApi.getItem(parseInt(id));
          setData(result);
        } else {
          const result = await backendApi.getItems();
          setData(result);
        }
      } catch (err: unknown) {
        setData(id ? null : []);
        if (err instanceof BackendApiError) {
          setError(err.message);
        } else {
          setError(id ? "Item not found" : "Error loading items");
        }
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
