import { useState, useEffect } from "react";
import { backendApi } from "@/lib/backend-api";

interface InventoryValue {
  totalValue: number;
  itemsWithValue: number;
  totalItems: number;
}

export function useInventoryValue() {
  const [data, setData] = useState<InventoryValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInventoryValue() {
      try {
        setLoading(true);
        setError(null);
        const response = await backendApi.getInventoryValue();
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch inventory value"
        );
        console.error("Error fetching inventory value:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInventoryValue();
  }, []);

  return { data, loading, error };
}
