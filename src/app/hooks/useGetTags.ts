import { useState, useEffect } from "react";
import { Tag } from "@/app/types";

function useGetTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch("/api/tag");
        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }
        const data = await response.json();
        setTags(Array.isArray(data) ? data : []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setError(error.message);
        setTags([]); // Ensure tags is always an array
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []); // Empty dependency array ensures this effect runs once on mount

  return { tags, loading, error };
}

export default useGetTags;
