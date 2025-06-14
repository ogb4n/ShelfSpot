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

    // Cast en RoomWithCount pour avoir accès à _count
    const roomsWithCount = rooms as RoomWithCount[];

    const roomDistribution = {
        labels: roomsWithCount?.map((room) => room.name) || [],
        datasets: [{
            data: roomsWithCount?.map((room) => room._count?.items || 0) || [],
            backgroundColor: backgroundColors,
            borderWidth: 1,
        }],
    };

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

    const inventoryValue = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
            {
                label: "Value (€)",
                data: [1200, 1300, 1250, 1400, 1500],
                fill: true,
                backgroundColor: "#3b82f6",
                borderColor: "#1e3a8a",
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Card 1: Distribution by room */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Distribution by room</h2>
                {loading ? (
                    <div className="text-gray-500">Loading...</div>
                ) : error ? (
                    <div className="text-red-500">Error loading rooms: {error}</div>
                ) : !rooms || rooms.length === 0 ? (
                    <div className="text-gray-500">No rooms found</div>
                ) : roomsWithItems.length === 0 ? (
                    <div className="text-gray-500">No items found in any room</div>
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

            {/* Card 2: Alerts per month */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Alerts per month</h2>
                <div className="w-full h-64">
                    <Bar data={alertsPerMonth} options={{ maintainAspectRatio: false }} />
                </div>
            </div>

            {/* Card 3: Inventory value */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Inventory value</h2>
                <div className="w-full h-64">
                    <Line data={inventoryValue} options={{ maintainAspectRatio: false }} />
                </div>
            </div>

            {/* Card 4: Status distribution */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Status distribution</h2>
                <div className="w-full h-64">
                    <Bar data={statusDistribution} options={{ maintainAspectRatio: false }} />
                </div>
            </div>
        </div>
    );
}
