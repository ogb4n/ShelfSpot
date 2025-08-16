import { useState, useEffect } from "react";
import { backendApi } from "@/lib/backend-api";
import { Container } from "@/app/types";

function useGetContainers() {
  const [data, setData] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContainers() {
      try {
        setLoading(true);
        setError(null);
        const result = await backendApi.getContainers();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error fetching containers"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchContainers();
  }, []);

  return { data, loading, error };
}

export default useGetContainers;
