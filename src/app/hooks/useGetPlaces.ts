import { useApiData } from "./useApiData";
import { API_ENDPOINTS } from "@/lib/constants";
import { Place } from "@/app/types";

function useGetPlaces() {
  return useApiData<Place[]>(API_ENDPOINTS.PLACES, { initialData: [] });
}

export default useGetPlaces;
