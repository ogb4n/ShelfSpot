import { useState, useEffect } from "react";
import { backendApi } from "@/lib/backend-api";
import { Item } from "@/app/types";

interface Favourite {
  id: number;
  itemId: number;
  item: Item;
}

function useGetFavourites() {
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavourites() {
      try {
        setLoading(true);
        setError(null);
        const result = await backendApi.getFavourites();
        setFavourites(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error fetching favourites"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchFavourites();
  }, []);

  return { favourites, loading, error };
}

export default useGetFavourites;
