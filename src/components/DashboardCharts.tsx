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
    const { rooms, loading, error } = useGetRooms();

    const roomDistribution = {
        labels: rooms?.map((room: any) => room.name) || [],
        datasets: [{
            data: rooms?.map((room: any) => room._count?.items || 0) || [],
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
                    <div className="text-red-500">Error loading rooms</div>
                ) : (
                    <div className="w-full h-64 flex justify-center">
                        <Pie data={roomDistribution} options={{ maintainAspectRatio: false }} />
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
