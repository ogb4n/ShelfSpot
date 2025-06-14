import { useApiData } from "./useApiData";
import { API_ENDPOINTS } from "@/lib/constants";

// Type pour Room avec _count
type RoomWithCount = {
  id: number;
  name: string;
  icon?: string;
  _count?: {
    items?: number;
  };
};

function useGetRooms() {
  return useApiData<RoomWithCount[]>(API_ENDPOINTS.ROOMS, { initialData: [] });
}

export default useGetRooms;
