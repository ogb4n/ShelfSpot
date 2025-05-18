import { useEffect, useState } from "react";
import { Item } from "@/app/types";

export function useGetItem(id: string | undefined) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setLoading(false);
      setError("Aucun identifiant fourni.");
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/items?id=${id}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Objet introuvable");
        const data = await res.json();
        setItem(data);
      })
      .catch((err) => {
        setItem(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { item, loading, error };
}
