'use client';
import { useState } from "react";
import { Item, Room, Place, Container } from "@/app/types";
import useGetRooms from "@/app/hooks/useGetRooms";
import useGetPlaces from "@/app/hooks/useGetPlaces";
import useGetContainers from "@/app/hooks/useGetContainers";
import { backendApi } from "@/lib/backend-api";

export default function ManageObjectClient({ item }: { item: Item }) {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<Partial<Item>>(item);
    const { data: rooms, loading: loadingRooms } = useGetRooms();
    const { data: places, loading: loadingPlaces } = useGetPlaces();
    const { data: containers, loading: loadingContainers } = useGetContainers();

    const filteredPlaces = form.roomId ? (places || []).filter((p: Place) => p.roomId === form.roomId) : (places || []);
    const filteredContainers = form.placeId
        ? (containers || []).filter((c: Container) => c.placeId === form.placeId)
        : (form.roomId ? (containers || []).filter((c: Container) => c.roomId === form.roomId) : (containers || []));

    const handleDelete = async () => {
        if (!window.confirm("Do you really want to delete this item? This action is irreversible.")) return;
        try {
            await backendApi.deleteItem(item.id);
            window.location.href = "/manage";
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Error deleting item");
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
            <div className="flex gap-4">
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                    Delete
                </button>
            </div>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit item</h2>
                            <button
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={async e => {
                            e.preventDefault();
                            try {
                                await backendApi.updateItem(item.id, form);
                                setShowModal(false);
                                window.location.reload(); // Refresh to show updated data
                            } catch (error) {
                                console.error("Error updating item:", error);
                                alert("Error updating item");
                            }
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={form.quantity}
                                    onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={form.status || ""}
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={form.roomId ?? ""}
                                    onChange={e => {
                                        const roomId = Number(e.target.value) || undefined;
                                        setForm(f => ({ ...f, roomId, placeId: undefined, containerId: undefined }));
                                    }}
                                >
                                    <option value="">Select a room</option>
                                    {loadingRooms ? <option>Loading...</option> : (rooms || []).map((room: Room) => (
                                        <option key={room.id} value={room.id}>{room.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Place</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                    value={form.placeId ?? ""}
                                    onChange={e => {
                                        const placeId = Number(e.target.value) || undefined;
                                        setForm(f => ({ ...f, placeId, containerId: undefined }));
                                    }}
                                    disabled={!form.roomId}
                                >
                                    <option value="">Select a place</option>
                                    {loadingPlaces ? <option>Loading...</option> : filteredPlaces.map((place: Place) => (
                                        <option key={place.id} value={place.id}>{place.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Container</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                    value={form.containerId ?? ""}
                                    onChange={e => setForm(f => ({ ...f, containerId: Number(e.target.value) || undefined }))}
                                    disabled={!form.roomId && !form.placeId}
                                >
                                    <option value="">Select a container</option>
                                    {loadingContainers ? <option>Loading...</option> : filteredContainers.map((container: Container) => (
                                        <option key={container.id} value={container.id}>{container.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
