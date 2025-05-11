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

export default function DashboardCharts() {
    // Données fictives à remplacer par tes vraies données
    const repartitionPieces = {
        labels: ["Salon", "Cuisine", "Chambre", "Garage"],
        datasets: [
            {
                data: [12, 19, 7, 5],
                backgroundColor: ["#6366f1", "#f59e42", "#10b981", "#ef4444"],
            },
        ],
    };
    const repartitionStatuts = {
        labels: ["En stock", "Prêté", "Perdu"],
        datasets: [
            {
                data: [30, 5, 2],
                backgroundColor: ["#6366f1", "#f59e42", "#ef4444"],
            },
        ],
    };
    const alertesParMois = {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai"],
        datasets: [
            {
                label: "Alertes",
                data: [2, 1, 3, 0, 2],
                backgroundColor: "#ef4444",
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
                backgroundColor: "rgba(99,102,241,0.2)",
                borderColor: "#6366f1",
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-neutral-900 rounded-lg p-4 flex flex-col items-center">
                <h2 className="text-white text-lg mb-2">Répartition par pièce</h2>
                <div className="w-full max-w-xs h-64"><Pie data={repartitionPieces} options={{ maintainAspectRatio: false }} /></div>
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
                <div className="w-full max-w-xs h-64"><Pie data={repartitionStatuts} options={{ maintainAspectRatio: false }} /></div>
            </div>
        </div>
    );
}
