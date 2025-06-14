import { useState, useEffect } from "react";
import { apiRequest, ApiError } from "@/lib/api";

interface UseApiDataOptions<T> {
  initialData?: T;
  dependencies?: unknown[];
  enabled?: boolean;
}

interface UseApiDataReturn<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApiData<T>(
  url: string,
  options: UseApiDataOptions<T> = {}
): UseApiDataReturn<T> {
  const { initialData, dependencies = [], enabled = true } = options;
  
  const [data, setData] = useState<T>(initialData as T);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest<T>(url);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Unknown error";
      setError(errorMessage);
      if (initialData !== undefined) {
        setData(initialData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, enabled, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}
