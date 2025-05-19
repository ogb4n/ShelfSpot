"use client"
import ManageObjectClient from "@/components/ManageObjectClient";
import useGetItems from "@/app/hooks/useGetItems";
import { useParams } from "next/navigation";

export default function ManageObjectPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const { data, loading, error } = useGetItems(id);

    if (!id) {
        return (
            <main className="max-w-2xl mx-auto p-8 theme-bg">
                <h1 className="text-2xl font-bold mb-4">Paramètre manquant</h1>
                <p className="theme-muted">Aucun identifiant fourni.</p>
            </main>
        );
    }

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>Erreur : {error}</div>;
    if (!data || Array.isArray(data)) return <div>Aucun objet trouvé.</div>;

    const item = data;

    return (
        <main className="max-w-2xl mx-auto p-8 theme-bg">
            <div className="flex items-center gap-4 mb-6">

                <h1 className="text-3xl font-bold">{item.name}</h1>
            </div>
            <div className="theme-card theme-border rounded-lg shadow p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <span className="font-semibold">Quantité :</span> {item.quantity}
                </div>
                <div>
                    <span className="font-semibold">Statut :</span> {item.status || "-"}
                </div>
                <div>
                    <span className="font-semibold">Pièce :</span> {item.room?.name || "-"}
                </div>
                <div>
                    <span className="font-semibold">Emplacement :</span> {item.place?.name || "-"}
                </div>
                <div>
                    <span className="font-semibold">Contenant :</span> {item.container?.name || "-"}
                </div>
                <div>
                    <span className="font-semibold">Tags :</span> {item.tags && item.tags.length > 0 ? item.tags.join(", ") : "-"}
                </div>
            </div>
            <ManageObjectClient item={item} />
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Alerte de quantité</h2>
                <div className="theme-muted">Aucune alerte de quantité configurée pour cet objet.</div>
            </div>
            <p className="text-sm theme-muted mt-2">
                Pour modifier ou supprimer cet objet, utilisez les boutons ci-dessous. Si vous ne trouvez pas l&apos;objet, vérifiez qu&apos;il n&apos;est pas dans une autre pièce.
            </p>
        </main>
    );
}
