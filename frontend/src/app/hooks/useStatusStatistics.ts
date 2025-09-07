import { useState, useEffect } from "react";
import { backendApi } from "@/lib/backend-api";

interface StatusStatisticsData {
  data: Array<{
    status: string;
    count: number;
  }>;
  total: number;
}

export function useStatusStatistics() {
  const [data, setData] = useState<StatusStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatusStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const statisticsData = await backendApi.getStatusStatistics();
        setData(statisticsData);
      } catch (err) {
        console.error("Error fetching status statistics:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStatusStatistics();
  }, []);

  return { data, loading, error };
}
