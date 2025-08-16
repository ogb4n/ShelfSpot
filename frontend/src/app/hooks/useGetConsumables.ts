import { useState, useEffect } from "react";
import { backendApi } from "@/lib/backend-api";
import { Consumable } from "@/app/types";

function useGetConsumables() {
  const [items, setItems] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConsumables() {
      try {
        setLoading(true);
        setError(null);
        const result = await backendApi.getConsumables();
        setItems(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error fetching consumables"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchConsumables();
  }, []);

  return { items, loading, error };
}

export default useGetConsumables;
