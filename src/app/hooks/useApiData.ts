import { useState, useEffect, useCallback, useRef } from "react";
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
  
  // Utiliser useRef pour éviter les re-créations inutiles
  const urlRef = useRef(url);
  const enabledRef = useRef(enabled);
  const initialDataRef = useRef(initialData);
  
  // Mettre à jour les refs quand les valeurs changent
  urlRef.current = url;
  enabledRef.current = enabled;
  initialDataRef.current = initialData;
  
  // Sérialiser les dépendances complexes pour éviter les re-renders
  const serializedDependencies = JSON.stringify(dependencies);

  const fetchData = useCallback(async () => {
    if (!enabledRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest<T>(urlRef.current);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Unknown error";
      setError(errorMessage);
      if (initialDataRef.current !== undefined) {
        setData(initialDataRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, url, enabled, serializedDependencies]);

  return { data, loading, error, refetch: fetchData };
}
