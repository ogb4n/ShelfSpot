'use client';
import { useState } from "react";

export default function ManageObjectClient({ item }: { item: any }) {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<any>(item);
    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Actions</h2>
            <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={() => setShowModal(true)}>Modifier</button>
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Supprimer</button>
            </div>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}>&times;</button>
                        <h2 className="text-2xl font-bold mb-4">Modifier l'objet</h2>
                        <form onSubmit={async e => {
                            e.preventDefault();
                            await fetch(`/api/items/edit`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(form),
                            });
                            setShowModal(false);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Nom</label>
                                <input className="border rounded px-2 py-1 w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Quantité</label>
                                <input type="number" className="border rounded px-2 py-1 w-full" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Statut</label>
                                <input className="border rounded px-2 py-1 w-full" value={form.status || ""} onChange={e => setForm({ ...form, status: e.target.value })} />
                            </div>
                            {/* Ajoute ici les autres champs (pièce, emplacement, contenant, tags) selon ton modèle */}
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
