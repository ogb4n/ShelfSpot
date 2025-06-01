import { useState, useEffect } from "react";


function useGetTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch("/api/tags");
        const data = await response.json();
        setTags(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []); // Empty dependency array ensures this effect runs once on mount

  return { tags, loading, error };
}

export default useGetTags;
