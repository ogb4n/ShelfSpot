import { useState, useEffect } from "react";
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
        const res = await fetch("/api/favourites");
        if (!res.ok) throw new Error("Erreur lors du chargement des favoris");
        const data = await res.json();
        setFavourites(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchFavourites();
  }, []);

  return { favourites, loading, error };
}

export default useGetFavourites;
