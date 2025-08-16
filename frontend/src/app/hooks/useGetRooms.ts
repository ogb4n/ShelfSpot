import { useState, useEffect } from "react";
import { backendApi } from "@/lib/backend-api";

// Type pour Room avec _count
type RoomWithCount = {
  id: number;
  name: string;
  icon?: string;
  _count?: {
    items?: number;
  };
};

function useGetRooms() {
  const [data, setData] = useState<RoomWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        setError(null);
        const result = await backendApi.getRooms();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching rooms");
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  return { data, loading, error };
}

export default useGetRooms;
