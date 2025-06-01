import { useState, useEffect } from "react";


function useGetPlaces() {
  // State to store the fetched places
  const [places, setPlaces] = useState([]);
  // Track loading state to show appropriate UI indicators
  const [loading, setLoading] = useState(true);
  // Track any errors that occur during data fetching
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        // Make API request to get all places
        const response = await fetch("/api/place");
        const data = await response.json();
        setPlaces(data);
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
