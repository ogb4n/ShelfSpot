import { useApiData } from "./useApiData";
import { API_ENDPOINTS } from "@/lib/constants";
import { Item } from "@/app/types";

function useGetConsumables() {
  const result = useApiData<Item[]>(`${API_ENDPOINTS.ITEMS}/consumables`, { initialData: [] });
  return { items: result.data, loading: result.loading, error: result.error };
}

export default useGetConsumables;
