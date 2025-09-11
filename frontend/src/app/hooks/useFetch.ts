import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic hook to make API calls
 * @param url - The API URL to call
 * @param options - Options for the fetch
 */
interface UseFetchOptions {
  dependencies?: unknown[];
  enabled?: boolean;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

function useFetch<T>(url: string | null, options: UseFetchOptions = {}) {
  const {
    dependencies = [],
    enabled = true,
    method = "GET",
    body,
    headers,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use useRef to avoid unnecessary re-creations
  const abortControllerRef = useRef<AbortController | null>(null);

  // Serialize complex dependencies to avoid re-renders
  const serializedDependencies = JSON.stringify(dependencies);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    // Cancel the previous request if it exists
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
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (body && method !== "GET") {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: Failed to fetch data from ${url}`
        );
      }

      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err: unknown) {
      // Ignorer les erreurs d'annulation
      if (err instanceof Error && err.name === "AbortError") {
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
