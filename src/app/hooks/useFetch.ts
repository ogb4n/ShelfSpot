import { useState, useEffect } from "react";

/**
 * Hook générique pour faire des appels API
 * @param url - L'URL de l'API à appeler
 * @param dependencies - Dépendances pour re-déclencher le fetch (optionnel)
 */
function useFetch<T>(url: string, dependencies: unknown[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch data from ${url}`);
        }
        
        const result = await response.json();
        setData(Array.isArray(result) ? result : []);
      } catch (err: unknown) {
        setError((err as Error).message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url, ...dependencies]);

  return { data, loading, error };
}

export default useFetch;
