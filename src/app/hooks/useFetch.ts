import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook générique pour faire des appels API
 * @param url - L'URL de l'API à appeler
 * @param options - Options pour le fetch
 */
interface UseFetchOptions {
  dependencies?: unknown[];
  enabled?: boolean;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

function useFetch<T>(url: string | null, options: UseFetchOptions = {}) {
  const { 
    dependencies = [], 
    enabled = true, 
    method = 'GET',
    body,
    headers 
  } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Utiliser useRef pour éviter les re-créations inutiles
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Sérialiser les dépendances complexes pour éviter les re-renders
  const serializedDependencies = JSON.stringify(dependencies);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;
    
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const fetchOptions: RequestInit = {
        method,
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };
      
      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch data from ${url}`);
      }
      
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err: unknown) {
      // Ignorer les erreurs d'annulation
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError((err as Error).message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url, enabled, method, body, headers]);

  useEffect(() => {
    fetchData();
    
    // Cleanup: annuler la requête si le composant est démonté
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, serializedDependencies]);

  // Cleanup lors du démontage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export default useFetch;
