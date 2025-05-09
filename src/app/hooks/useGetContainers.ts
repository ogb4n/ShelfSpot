import { useState, useEffect } from "react";
import { Container } from "@/app/types";

/**
 * Custom hook to fetch all containers from the API
 *
 * This hook handles the complete data fetching lifecycle including loading and error states.
 * Containers represent storage units inside places where items can be stored.
 *
 * @returns {Object} Object containing containers array, loading state, and any error
 */
function useGetContainers() {
  // State to store the fetched containers
  const [containers, setContainers] = useState<Container[]>([]);
  // Track loading state to show loading indicators in UI
  const [loading, setLoading] = useState(true);
  // Track any errors that occur during data fetching
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Asynchronous function to fetch containers from the API
     */
    async function fetchContainers() {
      try {
        // Request all containers from the API
        const response = await fetch("/api/containers");
        if (!response.ok) {
          throw new Error(
            `Error ${response.status}: Failed to fetch containers`
          );
        }
        const data = await response.json();
        // Update state with received containers data
        setContainers(data);
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
    fetchContainers();
  }, []); // Empty dependency array ensures this effect runs once on mount

  // Return all necessary states for the component to use
  return { containers, loading, error };
}

export default useGetContainers;
