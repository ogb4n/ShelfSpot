import React from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
    Chart,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";
import useGetRooms from "@/app/hooks/useGetRooms";
import { useInventoryValue } from "@/app/hooks/useInventoryValue";
import { Room } from "@/app/types";

// Type étendu pour inclure _count
type RoomWithCount = Room & {
    _count?: {
        items?: number;
    };
};

Chart.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

const backgroundColors = [
    "#3b82f6",
    "#1d4ed8",
    "#1e40af",
    "#1e3a8a"
]

export default function DashboardCharts() {
    const { data: rooms, loading, error } = useGetRooms();
    const { data: inventoryValueData, loading: inventoryLoading } = useInventoryValue();

    // Cast en RoomWithCount pour avoir accès à _count
    const roomsWithCount = rooms as RoomWithCount[];

    // Filtrer les rooms qui ont des items pour le chart
    const roomsWithItems = roomsWithCount?.filter((room) =>
        room._count?.items && room._count.items > 0) || [];

    const filteredRoomDistribution = {
        labels: roomsWithItems.map((room) => room.name),
        datasets: [{
            data: roomsWithItems.map((room) => room._count?.items || 0),
            backgroundColor: backgroundColors,
            borderWidth: 1,
        }],
    };

    const alertsPerMonth = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
            {
                label: "Alerts",
                data: [12, 8, 15, 6, 10],
                backgroundColor: "#3b82f6",
                borderColor: "#1e3a8a",
            },
        ],
    };

    const statusDistribution = {
        labels: ["Good", "Damaged", "Missing", "Expired"],
        datasets: [
            {
                label: "Items by status",
                data: [45, 12, 5, 8],
                backgroundColor: backgroundColors,
                borderWidth: 1,
            },
        ],
    };

    const currentValue = inventoryValueData?.totalValue || 0;

    const inventoryValue = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
            {
                label: "Value (€)",
                data: [currentValue, currentValue, currentValue, currentValue, currentValue],
                fill: true,
                backgroundColor: "#3b82f6",
                borderColor: "#1e3a8a",
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Modern Card 1: Distribution by room */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    <h2 className="text-gray-900 dark:text-white text-xl font-bold">Distribution by room</h2>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="relative mb-6">
                            <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"></div>
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading room data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <span className="text-red-500 text-2xl">⚠️</span>
                        </div>
                        <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">Error loading rooms</div>
                        <div className="text-gray-500 dark:text-gray-400 text-sm">{error}</div>
                    </div>
                ) : !rooms || rooms.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">🏠</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">No rooms found</div>
                        <div className="text-gray-500 dark:text-gray-500 text-sm">Create your first room to see distribution</div>
                    </div>
                ) : roomsWithItems.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <span className="text-blue-500 text-2xl">📦</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">No items found</div>
                        <div className="text-gray-500 dark:text-gray-500 text-sm">Add items to see room distribution</div>
                    </div>
                ) : (
                    <div className="w-full h-64 flex justify-center">
                        <Pie
                            data={filteredRoomDistribution}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom' as const,
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                const label = context.label || '';
                                                const value = context.parsed || 0;
                                                return `${label}: ${value} items`;
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Modern Card 2: Alerts per month */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                    <h2 className="text-gray-900 dark:text-white text-xl font-bold">Alerts per month</h2>
                </div>
                <div className="w-full h-64">
                    <Bar data={alertsPerMonth} options={{ maintainAspectRatio: false }} />
                </div>
            </div>

            {/* Modern Card 3: Inventory value */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
                    <h2 className="text-gray-900 dark:text-white text-xl font-bold">Inventory value</h2>
                </div>
                {inventoryLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="relative mb-6">
                            <div className="w-16 h-16 border-4 border-green-100 dark:border-green-900/30 rounded-full"></div>
                            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Calculating inventory value...</p>
                    </div>
                ) : inventoryValueData ? (
                    <>
                        <div className="mb-4 text-center">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                €{inventoryValueData.totalValue.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Based on {inventoryValueData.itemsWithValue} items with selling prices
                            </div>
                        </div>
                        <div className="w-full h-48">
                            <Line data={inventoryValue} options={{ maintainAspectRatio: false }} />
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">💰</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">No inventory value data</div>
                        <div className="text-gray-500 dark:text-gray-500 text-sm">Add selling prices to items to see inventory value</div>
                    </div>
                )}
            </div>

            {/* Modern Card 4: Status distribution */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                    <h2 className="text-gray-900 dark:text-white text-xl font-bold">Status distribution</h2>
                </div>
                <div className="w-full h-64">
                    <Bar data={statusDistribution} options={{ maintainAspectRatio: false }} />
                </div>
            </div>
        </div>
    );
}
