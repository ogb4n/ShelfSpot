import { useState, useEffect } from "react";

/**
 * Custom hook to fetch all places from the API
 *
 * This hook handles the complete data fetching lifecycle including loading and error states.
 * Places represent physical locations where items can be stored.
 *
 * @returns {Object} Object containing places array, loading state, and any error
 */
function useGetPlaces() {
  // State to store the fetched places
  const [places, setPlaces] = useState([]);
  // Track loading state to show appropriate UI indicators
  const [loading, setLoading] = useState(true);
  // Track any errors that occur during data fetching
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Asynchronous function to fetch places from the API
     */
    async function fetchPlaces() {
      try {
        // Make API request to get all places
        const response = await fetch("/api/place");
        const data = await response.json();
        // Update state with received places data
        setPlaces(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // Store any error that occurs during API call
        setError(error.message);
      } finally {
        // Set loading to false whether the request succeeded or failed
        setLoading(false);
      }
    }
    // Execute the fetch function when component mounts
    fetchPlaces();
  }, []); // Empty dependency array ensures this runs once on component mount

  // Return all necessary states for the component to use
  return { places, loading, error };
}

export default useGetPlaces;
