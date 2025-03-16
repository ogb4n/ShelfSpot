import { useState, useEffect } from "react";

/**
 * Custom hook to check if this is the first account in the system
 *
 * This hook makes an API call to fetch all places and can be used to determine
 * if this is a first-time setup (no places exist yet).
 *
 * @returns {Object} Object containing error state if the API call fails
 */
function useIsFirstAccount() {
  // Track any errors that occur during the API call
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Fetches all places from the API
     * This determines if any places exist in the system
     */
    async function fetchPlaces() {
      try {
        // Make API request to get all places
        const response = await fetch("/api/place");
        const data = await response.json();
        return data; // Return the places data for potential use by the parent component
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // Store any error that occurs during the API call
        setError(error.message);
      }
    }
    fetchPlaces();
  }, []); // Empty dependency array ensures this runs once on component mount

  return { error };
}

export default useIsFirstAccount;
