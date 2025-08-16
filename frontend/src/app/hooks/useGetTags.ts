import { useState, useEffect } from "react";
import { backendApi } from "@/lib/backend-api";
import { Tag } from "@/app/types";

function useGetTags() {
  const [data, setData] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        setLoading(true);
        setError(null);
        const result = await backendApi.getTags();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching tags");
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);

  return { data, loading, error };
}

export default useGetTags;
