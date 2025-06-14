import { useApiData } from "./useApiData";
import { API_ENDPOINTS } from "@/lib/constants";
import { Item } from "@/app/types";

interface Favourite {
  id: number;
  itemId: number;
  item: Item;
}

function useGetFavourites() {
  const result = useApiData<Favourite[]>(API_ENDPOINTS.FAVOURITES, { initialData: [] });
  return { favourites: result.data, loading: result.loading, error: result.error };
}

export default useGetFavourites;
