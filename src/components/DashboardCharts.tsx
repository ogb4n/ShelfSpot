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
    "#b46cff",
    "#9056cc",
    "#82618b",
    "#5a357f"
]

export default function DashboardCharts() {
    const { rooms, loading, error } = useGetRooms();
    // Génère dynamiquement les labels et valeurs à partir des rooms
    const repartitionPieces = {
        labels: rooms.map((room: any) => room.name),
        datasets: [
            {
                data: rooms.map((room: any) => room._count?.items ?? 0),
                backgroundColor: backgroundColors,
            },
        ],
    };
    const repartitionStatuts = {
        labels: ["En stock", "Prêté", "Perdu"],
        datasets: [
            {
                data: [11, 2, 0],
                backgroundColor: backgroundColors
            },
        ],
    };
    const alertesParMois = {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai"],
        datasets: [
            {
                label: "Alertes",
                data: [0, 0, 0, 0, 0],
                backgroundColor: backgroundColors,
            },
        ],
    };
    const valeurInventaire = {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai"],
        datasets: [
            {
                label: "Valeur (€)",
                data: [1200, 1300, 1250, 1400, 1500],
                fill: true,
                backgroundColor: "#b46cff",
                borderColor: "#5a357f",
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-neutral-900 rounded-lg p-4 flex flex-col items-center">
                <h2 className="text-white text-lg mb-2">Répartition par pièce</h2>
                {loading ? (
                    <div className="text-white">Chargement...</div>
                ) : error ? (
                    <div className="text-red-500">Erreur lors du chargement des pièces</div>
                ) : (
                    <div className="w-full max-w-xs h-64">
                        <Pie data={repartitionPieces} options={{ maintainAspectRatio: false }} />
                    </div>
                )}
            </div>
            <div className="bg-neutral-900 rounded-lg p-4 flex flex-col items-center">
                <h2 className="text-white text-lg mb-2">Alertes par mois</h2>
                <div className="w-full max-w-xs h-64"><Bar data={alertesParMois} options={{ maintainAspectRatio: false }} /></div>
            </div>
            <div className="bg-neutral-900 rounded-lg p-4 flex flex-col items-center">
                <h2 className="text-white text-lg mb-2">Valeur de l&apos;inventaire</h2>
                <div className="w-full max-w-xs h-64"><Line data={valeurInventaire} options={{ maintainAspectRatio: false }} /></div>
            </div>
            <div className="bg-neutral-900 rounded-lg p-4 flex flex-col items-center">
                <h2 className="text-white text-lg mb-2">Répartition des statuts</h2>
                <div className="w-full max-w-xs h-64"><Bar data={repartitionStatuts} options={{ maintainAspectRatio: false }} /></div>
            </div>
        </div>
    );
}
