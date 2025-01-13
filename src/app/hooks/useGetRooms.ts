import { useState, useEffect } from "react";

function useGetRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchrooms() {
      try {
        const response = await fetch("/api/room");
        const data = await response.json();
        setRooms(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchrooms();
  }, []);

  return { rooms, loading, error };
}

export default useGetRooms;
