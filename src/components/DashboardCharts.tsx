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
import { motion } from "motion/react"
import { RotateCcw } from "lucide-react";

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
    "#b46cff",
    "#9056cc",
    "#82618b",
    "#5a357f"
]

export default function DashboardCharts() {
    const { rooms, loading, error } = useGetRooms();
    // Dynamically generate labels and values from rooms
    const roomDistribution = {
        labels: rooms.map((room: any) => room.name),
        datasets: [
            {
                data: rooms.map((room: any) => room._count?.items ?? 0),
                backgroundColor: backgroundColors,
            },
        ],
    };
    const statusDistribution = {
        labels: ["In stock", "Borrowed", "Lost"],
        datasets: [
            {
                data: [11, 2, 0],
                backgroundColor: backgroundColors
            },
        ],
    };
    const alertsPerMonth = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
            {
                label: "Alerts",
                data: [0, 0, 0, 0, 0],
                backgroundColor: backgroundColors,
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
                backgroundColor: "#b46cff",
                borderColor: "#5a357f",
            },
        ],
    };

    // Add flip states for each card
    const [flip, setFlip] = React.useState([false, false, false, false]);
    const handleFlip = (idx: number) => {
        setFlip(f => f.map((v, i) => (i === idx ? !v : v)));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Card 1: Distribution by room */}
            <motion.div className="rounded-lg p-4 flex flex-col items-center relative"
                style={{ perspective: 1000 }}>
                <button className="absolute top-2 right-2 text-white hover:text-violet-400 z-10" onClick={() => handleFlip(0)} aria-label="Flip card">
                    <RotateCcw size={20} />
                </button>
                <motion.div
                    className="w-full h-full"
                    animate={{ rotateY: flip[0] ? 180 : 0 }}
                    transition={{ duration: 0.35, type: "spring", stiffness: 400, damping: 22 }}
                    style={{ transformStyle: "preserve-3d", minHeight: '16rem', position: 'relative' }}
                >
                    {/* Front side */}
                    <div className="absolute w-full h-full backface-hidden flex flex-col items-center  rounded-lg">
                        <h2 className="text-white text-lg mb-2">Distribution by room</h2>
                        {loading ? (
                            <div className="text-white">Loading...</div>
                        ) : error ? (
                            <div className="text-red-500">Error loading rooms</div>
                        ) : (
                            <div className="w-full max-w-xs h-64">
                                <Pie data={roomDistribution} options={{ maintainAspectRatio: false }} />
                            </div>
                        )}
                    </div>
                    {/* Back side */}
                    <div className="absolute w-full h-full flex flex-col items-center justify-center text-white rotate-y-180 backface-hidden p-4  rounded-lg">
                        <h2 className="text-lg mb-2">Detail by room</h2>
                        <ul className="w-full max-w-xs">
                            {rooms.map((room: any, idx: number) => (
                                <li key={room.name} className="flex justify-between border-b border-neutral-700 py-1">
                                    <span>{room.name}</span>
                                    <span>{room._count?.items ?? 0} items</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </motion.div>
            {/* Card 2: Alerts per month */}
            <motion.div className=" rounded-lg p-4 flex flex-col items-center relative"
                style={{ perspective: 1000 }}>
                <button className="absolute top-2 right-2 text-white hover:text-violet-400 z-10" onClick={() => handleFlip(1)} aria-label="Flip card">
                    <RotateCcw size={20} />
                </button>
                <motion.div
                    className="w-full h-full"
                    animate={{ rotateY: flip[1] ? 180 : 0 }}
                    transition={{ duration: 0.35, type: "spring", stiffness: 400, damping: 22 }}
                    style={{ transformStyle: "preserve-3d", minHeight: '16rem', position: 'relative' }}
                >
                    {/* Front side */}
                    <div className="absolute w-full h-full backface-hidden flex flex-col items-center  rounded-lg">
                        <h2 className="text-white text-lg mb-2">Alerts per month</h2>
                        <div className="w-full max-w-xs h-64">
                            <Bar data={alertsPerMonth} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                    {/* Back side */}
                    <div className="absolute w-full h-full flex flex-col items-center justify-center text-white rotate-y-180 backface-hidden p-4  rounded-lg">
                        <h2 className="text-lg mb-2">Alerts (values)</h2>
                        <ul className="w-full max-w-xs">
                            {alertsPerMonth.labels.map((month: string, idx: number) => (
                                <li key={month} className="flex justify-between border-b border-neutral-700 py-1">
                                    <span>{month}</span>
                                    <span>{alertsPerMonth.datasets[0].data[idx]}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </motion.div>
            {/* Card 3: Inventory value */}
            <motion.div className=" rounded-lg p-4 flex flex-col items-center relative"
                style={{ perspective: 1000 }}>
                <button className="absolute top-2 right-2 text-white hover:text-violet-400 z-10" onClick={() => handleFlip(2)} aria-label="Flip card">
                    <RotateCcw size={20} />
                </button>
                <motion.div
                    className="w-full h-full"
                    animate={{ rotateY: flip[2] ? 180 : 0 }}
                    transition={{ duration: 0.35, type: "spring", stiffness: 400, damping: 22 }}
                    style={{ transformStyle: "preserve-3d", minHeight: '16rem', position: 'relative' }}
                >
                    {/* Front side */}
                    <div className="absolute w-full h-full backface-hidden flex flex-col items-center  rounded-lg">
                        <h2 className="text-white text-lg mb-2">Inventory value</h2>
                        <div className="w-full max-w-xs h-64">
                            <Line data={inventoryValue} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                    {/* Back side */}
                    <div className="absolute w-full h-full flex flex-col items-center justify-center text-white rotate-y-180 backface-hidden p-4  rounded-lg">
                        <h2 className="text-lg mb-2">Value (€) per month</h2>
                        <ul className="w-full max-w-xs">
                            {inventoryValue.labels.map((month: string, idx: number) => (
                                <li key={month} className="flex justify-between border-b border-neutral-700 py-1">
                                    <span>{month}</span>
                                    <span>{inventoryValue.datasets[0].data[idx]} €</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </motion.div>
            {/* Card 4: Status distribution */}
            <motion.div className=" rounded-lg p-4 flex flex-col items-center relative"
                style={{ perspective: 1000 }}>
                <button className="absolute top-2 right-2 text-white hover:text-violet-400 z-10" onClick={() => handleFlip(3)} aria-label="Flip card">
                    <RotateCcw size={20} />
                </button>
                <motion.div
                    className="w-full h-full"
                    animate={{ rotateY: flip[3] ? 180 : 0 }}
                    transition={{ duration: 0.35, type: "spring", stiffness: 400, damping: 22 }}
                    style={{ transformStyle: "preserve-3d", minHeight: '16rem', position: 'relative' }}
                >
                    {/* Front side */}
                    <div className="absolute w-full h-full backface-hidden flex flex-col items-center  rounded-lg">
                        <h2 className="text-white text-lg mb-2">Status distribution</h2>
                        <div className="w-full max-w-xs h-64">
                            <Bar data={statusDistribution} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                    {/* Back side */}
                    <div className="absolute w-full h-full flex flex-col items-center justify-center text-white rotate-y-180 backface-hidden p-4  rounded-lg">
                        <h2 className="text-lg mb-2">Status (values)</h2>
                        <ul className="w-full max-w-xs">
                            {statusDistribution.labels.map((status: string, idx: number) => (
                                <li key={status} className="flex justify-between border-b border-neutral-700 py-1">
                                    <span>{status}</span>
                                    <span>{statusDistribution.datasets[0].data[idx]}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
