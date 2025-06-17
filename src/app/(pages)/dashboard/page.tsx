"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
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

interface SearchItem {
  id: number;
  name: string;
  room?: { id: number; name: string };
  place?: { id: number; name: string };
  container?: { id: number; name: string };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes] = await Promise.all([

          fetch("/api/items?limit=5&sort=recent&include=location")
        ]);


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

  // Effect pour la recherche
  useEffect(() => {
    if (!search) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/items?search=${encodeURIComponent(search)}&include=location`);
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header avec barre de recherche */}
      <div className="text-center space-y-4">
        <div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Find your items quickly and manage your inventory efficiently
          </p>
        </div>

        {/* Barre de recherche principale */}
        <div className="max-w-xl mx-auto relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for any item in your inventory..."
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>


        </div>
      </div>

      {/* Stats Grid - Réorganisé en grille plus compacte */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

      {/* Contenu principal */}
      {search ? (
        /* Résultats de recherche */
        <div className="space-y-6">
          {searchLoading ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 animate-spin text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-2xl font-medium text-gray-900 dark:text-white mb-2">No items found</div>
              <p className="text-gray-500 dark:text-gray-400">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {searchResults.length} item{searchResults.length > 1 ? 's' : ''} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((item: SearchItem) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 transform hover:-translate-y-1"
                    onClick={() => {
                      router.push(`/manage/${item.id}`);
                      setSearch("");
                    }}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white text-xl mb-3">
                      {item.name}
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>
                        {item.room?.name || 'Unknown room'}
                        {item.place && ` • ${item.place.name}`}
                        {item.container && ` • ${item.container.name}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Contenu normal du dashboard */
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
      )}
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
