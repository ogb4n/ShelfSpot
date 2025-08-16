"use client";
import { useState, useEffect } from "react";
import { backendApi } from "@/lib/backend-api";

/**
 * Custom hook to fetch user account information from the API
 *
 * This hook is client-side only ("use client" directive) and manages the complete
 * data fetching lifecycle for user account data, including loading and error states.
 *
 * @returns {Object} Object containing account data, loading state, and any error
 */
function useGetAccount() {
  // State to store the fetched account data
  const [account, setAccount] = useState([]);
  // Track loading state to show appropriate UI indicators
  const [loading, setLoading] = useState(true);
  // Track any errors that occur during data fetching
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Asynchronous function to fetch account information from the API
     */
    async function fetchAccount() {
      try {
        // Make API request to get account information using backend API service
        const data = await backendApi.getProfile();
        // Update state with received account data
        setAccount(data);
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
    fetchAccount();
  }, []); // Empty dependency array ensures this runs once on component mount

  // Return all necessary states for the component to use
  return { account, loading, error };
}

export default useGetAccount;
