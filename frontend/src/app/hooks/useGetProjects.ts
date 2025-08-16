import { useState, useEffect, useCallback } from "react";
import { backendApi } from "@/lib/backend-api";

// Types pour les projets
export interface Project {
  id: number;
  name: string;
  description?: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  projectItems?: ProjectItem[];
}

export interface ProjectItem {
  id: number;
  projectId: number;
  itemId: number;
  quantity: number;
  isActive: boolean;
  addedAt: string;
  item?: {
    id: number;
    name: string;
    quantity: number;
    status: string;
    room?: { name: string };
    place?: { name: string };
    container?: { name: string };
  };
}

export interface ScoringStatistics {
  totalItems: number;
  itemsWithScore: number;
  averageScore: number;
  maxScore: number;
  distribution: {
    critical: number; // > 10
    high: number; // 5-10
    medium: number; // 1-5
    low: number; // 0.1-1
    zero: number; // 0
  };
}

export interface TopItem {
  id: number;
  name: string;
  quantity: number;
  importanceScore: number;
  status: string;
  room?: { name: string };
  place?: { name: string };
  container?: { name: string };
}

export interface CriticalItem extends TopItem {
  criticalityRatio: number;
}

export interface ProjectStatistics {
  project: {
    id: number;
    name: string;
    status: string;
    priority: string;
  };
  statistics: {
    totalItems: number;
    totalQuantityUsed: number;
    averageQuantityPerItem: number;
    highestQuantityItem: {
      id: number;
      name: string;
      quantity: number;
    };
    itemsByStatus: {
      IN_STOCK: number;
      LOW_STOCK: number;
      OUT_OF_STOCK: number;
    };
  };
}

export interface ItemScoreBreakdown {
  itemId: number;
  itemName: string;
  totalScore: number;
  breakdown: {
    activeProjectsScore: number;
    pausedProjectsScore: number;
    projectCountBonus: number;
    priorityMultiplier: number;
  };
  projectsUsage: Array<{
    projectId: number;
    projectName: string;
    status: string;
    priority: string;
    quantityUsed: number;
    contribution: number;
  }>;
}

export interface ProjectScoringBreakdown {
  project: {
    id: number;
    name: string;
  };
  itemsScoring: ItemScoreBreakdown[];
}

// Hook pour récupérer tous les projets
export function useGetProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await backendApi.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}

// Hook pour récupérer un projet spécifique
export function useGetProject(id: number | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const data = await backendApi.getProject(id);
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, loading, error, refetch: fetchProject };
}

// Hook pour les statistiques de scoring
export function useGetScoringStatistics() {
  const [statistics, setStatistics] = useState<ScoringStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await backendApi.getScoringStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refetch: fetchStatistics };
}

// Hook pour les articles les plus importants
export function useGetTopItems() {
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await backendApi.getTopItems();
      setTopItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopItems();
  }, [fetchTopItems]);

  return { topItems, loading, error, refetch: fetchTopItems };
}

// Hook pour les articles critiques
export function useGetCriticalItems() {
  const [criticalItems, setCriticalItems] = useState<CriticalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCriticalItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await backendApi.getCriticalItems();
      setCriticalItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCriticalItems();
  }, [fetchCriticalItems]);

  return { criticalItems, loading, error, refetch: fetchCriticalItems };
}
