import { useState, useEffect } from "react";

function useGetPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        const response = await fetch("/api/place");
        const data = await response.json();
        setPlaces(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaces();
  }, []);

  return { places, loading, error };
}

export default useGetPlaces;
