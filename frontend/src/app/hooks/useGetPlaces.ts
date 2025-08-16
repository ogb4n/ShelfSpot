import { useState, useEffect } from "react";
import { backendApi } from "@/lib/backend-api";
import { Place } from "@/app/types";

function useGetPlaces() {
  const [data, setData] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        setLoading(true);
        setError(null);
        const result = await backendApi.getPlaces();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching places");
      } finally {
        setLoading(false);
      }
    }
    fetchPlaces();
  }, []);

  return { data, loading, error };
}

export default useGetPlaces;
