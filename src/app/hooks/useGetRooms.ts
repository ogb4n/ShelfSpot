import { useState, useEffect } from "react";

/**
 * Custom hook to fetch all rooms from the API
 *
 * This hook manages the entire data fetching lifecycle including loading and error states.
 * It can be used in any component that needs access to the system's rooms.
 *
 * @returns {Object} Object containing rooms array, loading state, and any error
 */
function useGetRooms() {
  // State to store the fetched rooms
  const [rooms, setRooms] = useState([]);
  // Track loading state to show appropriate UI indicators
  const [loading, setLoading] = useState(true);
  // Track any errors that occur during data fetching
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Asynchronous function to fetch rooms from the API
     */
    async function fetchrooms() {
      try {
        // Make API request to get all rooms
        const response = await fetch("/api/room");
        const data = await response.json();
        // Update state with received rooms data
        setRooms(data);
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
    fetchrooms();
  }, []); // Empty dependency array ensures this runs once on component mount

  // Return all necessary states for the component to use
  return { rooms, loading, error };
}

export default useGetRooms;
