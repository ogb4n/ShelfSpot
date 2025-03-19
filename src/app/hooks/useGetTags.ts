import { useState, useEffect } from "react";

/**
 * Custom hook to fetch all tags from the API
 *
 * This hook handles the complete data fetching lifecycle including loading and error states.
 * It can be used in any component that needs access to the system's tags.
 *
 * @returns {Object} Object containing tags array, loading state, and any error
 */
function useGetTags() {
  // State to store fetched tags
  const [tags, setTags] = useState([]);
  // Track loading state to show loading indicators in UI
  const [loading, setLoading] = useState(true);
  // Track any errors that occur during data fetching
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Asynchronous function to fetch tags from the API
     */
    async function fetchTags() {
      try {
        // Request all tags from the API
        const response = await fetch("/api/tags");
        const data = await response.json();
        // Update state with received tags data
        setTags(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // Store any error that occurs during the API call
        setError(error.message);
      } finally {
        // Set loading to false regardless of success or failure
        setLoading(false);
      }
    }
    // Execute the fetch function when component mounts
    fetchTags();
  }, []); // Empty dependency array ensures this effect runs once on mount

  // Return all necessary states for the component to use
  return { tags, loading, error };
}

export default useGetTags;
