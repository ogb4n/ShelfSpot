'use client';
import { useState } from "react";
import { Item, Room, Place, Container } from "@/app/types";
import useGetRooms from "@/app/hooks/useGetRooms";
import useGetPlaces from "@/app/hooks/useGetPlaces";
import useGetContainers from "@/app/hooks/useGetContainers";

export default function ManageObjectClient({ item }: { item: Item }) {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<Partial<Item>>(item);
    const { rooms, loading: loadingRooms } = useGetRooms();
    const { places, loading: loadingPlaces } = useGetPlaces();
    const { containers, loading: loadingContainers } = useGetContainers();

    // Filtrage dynamique des places selon la pièce sélectionnée
    const filteredPlaces = form.roomId ? places.filter((p: Place) => p.roomId === form.roomId) : places;
    // Filtrage dynamique des containers selon la pièce et/ou l'emplacement sélectionné
    const filteredContainers = form.placeId
        ? containers.filter((c: Container) => c.placeId === form.placeId)
        : (form.roomId ? containers.filter((c: Container) => c.roomId === form.roomId) : containers);

    const handleDelete = async () => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet objet ? Cette action est irréversible.")) return;
        await fetch(`/api/items/delete?id=${item.id}`, { method: "DELETE" });
        window.location.href = "/manage";
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Actions</h2>
            <div className="flex gap-4">
                <button className="theme-primary px-4 py-2 rounded hover:bg-primary/90 transition" onClick={() => setShowModal(true)}>Modifier</button>
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition" onClick={handleDelete}>Supprimer</button>
            </div>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="theme-card shadow-lg p-8 w-full max-w-lg relative">
                        <button className="absolute top-2 right-2 theme-muted hover:text-foreground" onClick={() => setShowModal(false)}>&times;</button>
                        <h2 className="text-2xl font-bold mb-4">Modifier l&apos;objet</h2>
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
                                <input className="theme-input rounded px-2 py-1 w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Quantité</label>
                                <input type="number" className="theme-input rounded px-2 py-1 w-full" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Statut</label>
                                <input className="theme-input rounded px-2 py-1 w-full" value={form.status || ""} onChange={e => setForm({ ...form, status: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Pièce</label>
                                <select className="theme-input rounded px-2 py-1 w-full" value={form.roomId ?? ""} onChange={e => {
                                    const roomId = Number(e.target.value) || undefined;
                                    setForm(f => ({ ...f, roomId, placeId: undefined, containerId: undefined }));
                                }}>
                                    <option value="">Sélectionner une pièce</option>
                                    {loadingRooms ? <option>Chargement...</option> : rooms.map((room: Room) => (
                                        <option key={room.id} value={room.id}>{room.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Emplacement</label>
                                <select className="theme-input rounded px-2 py-1 w-full" value={form.placeId ?? ""} onChange={e => {
                                    const placeId = Number(e.target.value) || undefined;
                                    setForm(f => ({ ...f, placeId, containerId: undefined }));
                                }} disabled={!form.roomId}>
                                    <option value="">Sélectionner un emplacement</option>
                                    {loadingPlaces ? <option>Chargement...</option> : filteredPlaces.map((place: Place) => (
                                        <option key={place.id} value={place.id}>{place.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Contenant</label>
                                <select className="theme-input rounded px-2 py-1 w-full" value={form.containerId ?? ""} onChange={e => setForm(f => ({ ...f, containerId: Number(e.target.value) || undefined }))} disabled={!form.roomId && !form.placeId}>
                                    <option value="">Sélectionner un contenant</option>
                                    {loadingContainers ? <option>Chargement...</option> : filteredContainers.map((container: Container) => (
                                        <option key={container.id} value={container.id}>{container.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" className="px-4 py-2 rounded theme-muted hover:theme-bg" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="px-4 py-2 rounded theme-primary">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
