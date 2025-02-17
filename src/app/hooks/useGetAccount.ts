"use client";
import { useState, useEffect } from "react";

function useGetAccount() {
  const [account, setAccount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const response = await fetch("/api/account");
        const data = await response.json();
        setAccount(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAccount();
  }, []);

  return { account, loading, error };
}

export default useGetAccount;
