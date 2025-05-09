import { Item } from "@/app/types";
import Image from "next/image";
import ManageObjectClient from "@/components/ManageObjectClient";

async function getItem(id: string): Promise<Item | null> {
    // Utilise l'URL absolue pour le fetch côté serveur
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    try {
        const res = await fetch(`${baseUrl}/api/items?id=${id}`, { cache: "no-store" });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function ManageObjectPage(props: { params: { id: string | string[] } }) {
    const { id } = await props.params;
    const idValue = Array.isArray(id) ? id[0] : id;
    if (!idValue) {
        return (
            <main className="max-w-2xl mx-auto p-8">
                <h1 className="text-2xl font-bold mb-4">Paramètre manquant</h1>
                <p className="text-gray-500">Aucun identifiant fourni.</p>
            </main>
        );
    }

    const item = await getItem(idValue);

    if (!item) {
        return (
            <main className="max-w-2xl mx-auto p-8">
                <h1 className="text-2xl font-bold mb-4">Objet introuvable</h1>
                <p className="text-gray-500">L&apos;objet demandé n&apos;existe pas ou une erreur est survenue.</p>
            </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto p-8">
            <div className="flex items-center gap-4 mb-6">
                {item.container?.icon && (
                    <Image src={item.container.icon} alt="Icône contenant" width={40} height={40} className="rounded" />
                )}
                <h1 className="text-3xl font-bold">{item.name}</h1>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border dark:border-neutral-700 dark:text-gray-100">
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
                <div className="text-gray-500">Aucune alerte de quantité configurée pour cet objet.</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
                Pour modifier ou supprimer cet objet, utilisez les boutons ci-dessous. Si vous ne trouvez pas l&apos;objet, vérifiez qu&apos;il n&apos;est pas dans une autre pièce.
            </p>
        </main>
    );
}
