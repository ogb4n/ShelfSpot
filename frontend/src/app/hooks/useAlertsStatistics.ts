import { useState, useEffect } from "react";
import { backendApi } from "@/lib/backend-api";

interface AlertsStatisticsData {
  data: Array<{
    month: string;
    year: number;
    count: number;
  }>;
  total: number;
}

export function useAlertsStatistics() {
  const [data, setData] = useState<AlertsStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlertsStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const statisticsData = await backendApi.getAlertsStatistics();
        setData(statisticsData);
      } catch (err) {
        console.error("Error fetching alerts statistics:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAlertsStatistics();
  }, []);

  return { data, loading, error };
}
