import { useApiData } from "./useApiData";
import { API_ENDPOINTS } from "@/lib/constants";
import { Container } from "@/app/types";

function useGetContainers() {
  return useApiData<Container[]>(API_ENDPOINTS.CONTAINERS, { initialData: [] });
}

export default useGetContainers;
