"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";

// Types
interface Stats {
  totalItems: number;
  totalRooms: number;
  totalPlaces: number;
  totalContainers: number;
  totalTags: number;
  consumables: number;
}

interface RecentItem {
  id: number;
  name: string;
  createdAt: string;
  room?: { id: number; name: string };
  place?: { id: number; name: string };
  container?: { id: number; name: string };
  status?: string;
  quantity?: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/items?limit=5&sort=recent&include=location")
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setRecentItems(itemsData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Overview of your inventory management system
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
          />
          <StatCard
            title="Rooms"
            value={stats.totalRooms}
            className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
          />
          <StatCard
            title="Places"
            value={stats.totalPlaces}
            className="bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700"
          />
          <StatCard
            title="Containers"
            value={stats.totalContainers}
            className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700"
          />
          <StatCard
            title="Tags"
            value={stats.totalTags}
            className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700"
          />
          <StatCard
            title="Consumables"
            value={stats.consumables}
            className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Analytics
          </h2>
          <div className="h-[690px]">
            <DashboardCharts />
          </div>
        </div>

        {/* Recent Items */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-[52px] flex flex-col h-[725px] overflow-visible">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Items
          </h2>
          <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide overflow-x-visible"
            style={{ overflowX: 'visible' }}
          >
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => router.push(`/manage/${item.id}`)}
                  title={`Created: ${new Date(item.createdAt).toLocaleDateString()}${item.status ? ` • Status: ${item.status}` : ''}${item.quantity ? ` • Qty: ${item.quantity}` : ''}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>
                        {item.room?.name || 'Unknown room'}
                        {item.place && ` • ${item.place.name}`}
                        {item.container && ` • ${item.container.name}`}
                      </span>
                    </div>
                  </div>

                  {/* Tooltip hover overlay */}
                  <div className="absolute right-0 bottom-full mb-4 hidden group-hover:block z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700">
                    <div className="space-y-1">
                      <div><strong>Created:</strong> {new Date(item.createdAt).toLocaleDateString()}</div>
                      {item.status && <div><strong>Status:</strong> {item.status}</div>}
                      {item.quantity && <div><strong>Quantity:</strong> {item.quantity}</div>}
                      <div><strong>Location:</strong></div>
                      <div className="ml-2">
                        Room: {item.room?.name || 'Unknown'}
                        {item.place && <><br />Place: {item.place.name}</>}
                        {item.container && <><br />Container: {item.container.name}</>}
                      </div>
                      <div className="text-blue-300 mt-2">Click to view details</div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent items
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, className }: { title: string; value: number; className?: string }) {
  return (
    <div className={`p-4 rounded-lg border ${className || 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
