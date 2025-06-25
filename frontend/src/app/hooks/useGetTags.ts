import { useApiData } from "./useApiData";
import { API_ENDPOINTS } from "@/lib/constants";
import { Tag } from "@/app/types";

function useGetTags() {
  return useApiData<Tag[]>(API_ENDPOINTS.TAGS, { initialData: [] });
}

export default useGetTags;
