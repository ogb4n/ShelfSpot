import { useApiData } from "./useApiData";
import { API_ENDPOINTS } from "@/lib/constants";
import { Consumable } from "@/app/types";

function useGetConsumables() {
  const result = useApiData<Consumable[]>(API_ENDPOINTS.CONSUMABLES, { initialData: [] });
  return { items: result.data, loading: result.loading, error: result.error };
}

export default useGetConsumables;
