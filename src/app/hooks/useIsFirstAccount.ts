import { useState, useEffect } from "react";

function useIsFirstAccount() {
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        const response = await fetch("/api/place");
        const data = await response.json();
        return data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setError(error.message);
      }
    }
    fetchPlaces();
  }, []);

  return { error };
}

export default useIsFirstAccount;
