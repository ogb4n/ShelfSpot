import React, { useState, useEffect } from "react";
import { Archive, DoorOpen, Lamp, SquareLibrary } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface CreateObjectModalProps {
    open: boolean;
    onClose: () => void;
}

// Types pour les entités
interface Room { id: number; name: string; }
interface Place { id: number; name: string; roomId: number; }
interface Container { id: number; name: string; roomId: number; placeId: number; }

const objectTypes = [
    { key: "room", label: "Room", icon: <DoorOpen className="w-7 h-7 mb-2 text-blue-600 dark:text-blue-400" /> },
    { key: "place", label: "Place", icon: <SquareLibrary className="w-7 h-7 mb-2 text-blue-600 dark:text-blue-400" /> },
    { key: "container", label: "Container", icon: <Archive className="w-7 h-7 mb-2 text-blue-600 dark:text-blue-400" /> },
    { key: "item", label: "Item", icon: <Lamp className="w-7 h-7 mb-2 text-blue-600 dark:text-blue-400" /> },
];

export default function CreateObjectModal({ open, onClose }: CreateObjectModalProps) {
    const [step, setStep] = useState<"select" | "form">("select");
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [form, setForm] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Data states pour les listes déroulantes
    const [rooms, setRooms] = useState<Room[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [containers, setContainers] = useState<Container[]>([]);

    // States pour les sélections hiérarchiques
    const [selectedRoomForPlace, setSelectedRoomForPlace] = useState<number | null>(null);
    const [selectedRoomForContainer, setSelectedRoomForContainer] = useState<number | null>(null);
    const [selectedPlaceForContainer, setSelectedPlaceForContainer] = useState<number | null>(null);
    const [selectedRoomForItem, setSelectedRoomForItem] = useState<number | null>(null);
    const [selectedPlaceForItem, setSelectedPlaceForItem] = useState<number | null>(null);
    const [selectedContainerForItem, setSelectedContainerForItem] = useState<number | null>(null);

    // Fetch all data when modal opens
    const fetchAll = async () => {
        try {
            const [roomsData, placesData, containersData] = await Promise.all([
                apiRequest<Room[]>(API_ENDPOINTS.ROOMS),
                apiRequest<Place[]>(API_ENDPOINTS.PLACES),
                apiRequest<Container[]>(API_ENDPOINTS.CONTAINERS),
            ]);
            setRooms(roomsData);
            setPlaces(placesData);
            setContainers(containersData);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    };

    useEffect(() => {
        if (open) {
            fetchAll();
        }
    }, [open]);

    if (!open) return null;

    const resetModal = () => {
        setStep("select");
        setSelectedType(null);
        setForm({});
        setError(null);
        setSuccess(false);
        setSelectedRoomForPlace(null);
        setSelectedRoomForContainer(null);
        setSelectedPlaceForContainer(null);
        setSelectedRoomForItem(null);
        setSelectedPlaceForItem(null);
        setSelectedContainerForItem(null);
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type);
        setStep("form");
        setForm({}); // Reset form
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            let endpoint = "/api/" + selectedType;

            // Correction spécifique pour les items
            if (selectedType === "item") {
                endpoint = "/api/items/add";
            }

            const payload: Record<string, unknown> = { ...form };

            // Ajouter les IDs des relations selon le type
            if (selectedType === "place" && selectedRoomForPlace) {
                payload.roomId = selectedRoomForPlace;
            }
            if (selectedType === "container") {
                if (selectedRoomForContainer) payload.roomId = selectedRoomForContainer;
                if (selectedPlaceForContainer) payload.placeId = selectedPlaceForContainer;
            }
            if (selectedType === "item") {
                if (selectedRoomForItem) payload.roomId = selectedRoomForItem;
                if (selectedPlaceForItem) payload.placeId = selectedPlaceForItem;
                if (selectedContainerForItem) payload.containerId = selectedContainerForItem;
            }

            // Convertir les valeurs numériques
            if (payload.quantity) payload.quantity = parseInt(payload.quantity);
            if (payload.price) payload.price = parseFloat(payload.price);
            if (payload.sellprice) payload.sellprice = parseFloat(payload.sellprice);
            if (payload.roomId) payload.roomId = parseInt(payload.roomId);
            if (payload.placeId) payload.placeId = parseInt(payload.placeId);
            if (payload.containerId) payload.containerId = parseInt(payload.containerId);

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to create " + selectedType);

            setSuccess(true);
            setTimeout(() => {
                resetModal();
                onClose();
            }, 1000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 modal-backdrop p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative modal-content">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                        resetModal();
                        onClose();
                    }}
                    aria-label="Fermer"
                >
                    ×
                </button>

                {step === "select" && (
                    <div className="p-8">
                        <h2 className="text-2xl font-semibold mb-8 text-center text-gray-900 dark:text-white">
                            What would you like to add to your home ?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {objectTypes.map((type) => (
                                <div
                                    key={type.key}
                                    className="border-2 border-gray-200 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm"
                                    onClick={() => handleTypeSelect(type.key)}
                                >
                                    <div className="text-blue-600 dark:text-blue-400 mb-3">{type.icon}</div>
                                    <span className="text-gray-900 dark:text-white font-medium text-center">{type.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === "form" && selectedType && (
                    <div className="p-8">
                        <div className="flex items-center mb-6">
                            <button
                                type="button"
                                onClick={() => setStep("select")}
                                className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Back"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex-1 text-center">
                                {selectedType === "room" && "How should this room may be called ?"}
                                {selectedType === "place" && "How should this place may be called ?"}
                                {selectedType === "container" && "How should this container may be called ?"}
                                {selectedType === "item" && "How should this item may be called ?"}
                            </h2>
                            <div className="w-9"></div> {/* Spacer for centering */}
                        </div>
                        <div className="mb-6 flex flex-col items-center">
                            {objectTypes.find(t => t.key === selectedType)?.icon && (
                                <div className="rounded-xl p-6 mb-4 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <div className="text-blue-600 dark:text-blue-400 scale-125">{objectTypes.find(t => t.key === selectedType)?.icon}</div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* ROOM */}
                                {selectedType === "room" && (
                                    <div className="col-span-full">
                                        <label className="block text-gray-900 dark:text-white">
                                            <span className="block mb-2 font-medium">Enter the name of the room</span>
                                            <input
                                                name="name"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                onChange={handleChange}
                                                required
                                                placeholder="Room name"
                                            />
                                        </label>
                                    </div>
                                )}

                                {/* PLACE */}
                                {selectedType === "place" && (
                                    <>
                                        <div>
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Room</span>
                                                <select
                                                    value={selectedRoomForPlace ?? ""}
                                                    onChange={e => setSelectedRoomForPlace(Number(e.target.value) || null)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select a room</option>
                                                    {rooms.map(room => (
                                                        <option key={room.id} value={room.id}>{room.name}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Place name</span>
                                                <input
                                                    name="name"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Place name"
                                                />
                                            </label>
                                        </div>
                                    </>
                                )}

                                {/* CONTAINER */}
                                {selectedType === "container" && (
                                    <>
                                        <div>
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Room</span>
                                                <select
                                                    value={selectedRoomForContainer ?? ""}
                                                    onChange={e => {
                                                        const val = Number(e.target.value) || null;
                                                        setSelectedRoomForContainer(val);
                                                        setSelectedPlaceForContainer(null);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select a room</option>
                                                    {rooms.map(room => (
                                                        <option key={room.id} value={room.id}>{room.name}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Place</span>
                                                <select
                                                    value={selectedPlaceForContainer ?? ""}
                                                    onChange={e => setSelectedPlaceForContainer(Number(e.target.value) || null)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                    disabled={!selectedRoomForContainer}
                                                >
                                                    <option value="">Select a place</option>
                                                    {places.filter(p => p.roomId === selectedRoomForContainer).map(place => (
                                                        <option key={place.id} value={place.id}>{place.name}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Container name</span>
                                                <input
                                                    name="name"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Container name"
                                                />
                                            </label>
                                        </div>
                                    </>
                                )}

                                {/* ITEM */}
                                {selectedType === "item" && (
                                    <>
                                        {/* Item name - Full width */}
                                        <div className="col-span-full">
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Item name</span>
                                                <input
                                                    name="name"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Item name"
                                                />
                                            </label>
                                        </div>

                                        {/* Status - Full width */}
                                        <div className="col-span-full">
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Status (optional)</span>
                                                <input
                                                    name="status"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    onChange={handleChange}
                                                    placeholder="Status"
                                                />
                                            </label>
                                        </div>

                                        {/* Location row - 3 columns */}
                                        <div>
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Room</span>
                                                <select
                                                    value={selectedRoomForItem ?? ""}
                                                    onChange={e => {
                                                        const val = Number(e.target.value) || null;
                                                        setSelectedRoomForItem(val);
                                                        setSelectedPlaceForItem(null);
                                                        setSelectedContainerForItem(null);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select a room</option>
                                                    {rooms.map(room => (
                                                        <option key={room.id} value={room.id}>{room.name}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Place (optional)</span>
                                                <select
                                                    value={selectedPlaceForItem ?? ""}
                                                    onChange={e => {
                                                        const val = Number(e.target.value) || null;
                                                        setSelectedPlaceForItem(val);
                                                        setSelectedContainerForItem(null);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    disabled={!selectedRoomForItem}
                                                >
                                                    <option value="">Select a place</option>
                                                    {places.filter(p => p.roomId === selectedRoomForItem).map(place => (
                                                        <option key={place.id} value={place.id}>{place.name}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Container (optional)</span>
                                                <select
                                                    value={selectedContainerForItem ?? ""}
                                                    onChange={e => setSelectedContainerForItem(Number(e.target.value) || null)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    disabled={!selectedPlaceForItem}
                                                >
                                                    <option value="">Select a container</option>
                                                    {containers.filter(c => c.placeId === selectedPlaceForItem).map(container => (
                                                        <option key={container.id} value={container.id}>{container.name}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>

                                        {/* Quantity, Price, Sell Price row - 3 columns */}
                                        <div>
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Quantity</span>
                                                <input
                                                    name="quantity"
                                                    type="number"
                                                    min="1"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    onChange={handleChange}
                                                    defaultValue={1}
                                                    placeholder="1"
                                                />
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Price MSRP</span>
                                                <input
                                                    name="price"
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                />
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 dark:text-white">
                                                <span className="block mb-2 font-medium">Sell Price (optional)</span>
                                                <input
                                                    name="sellprice"
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                />
                                            </label>
                                        </div>

                                        {/* Consumable checkbox - Full width */}
                                        <div className="col-span-full">
                                            <label className="flex items-center text-gray-900 dark:text-white">
                                                <input
                                                    name="consumable"
                                                    type="checkbox"
                                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    onChange={e => setForm({ ...form, consumable: e.target.checked })}
                                                />
                                                <span className="font-medium">Consumable Item</span>
                                            </label>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-center pt-6">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-8 py-3 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                                    disabled={loading}
                                >
                                    {loading ? "Creating..." : `Create a ${objectTypes.find(t => t.key === selectedType)?.label.toLowerCase()}`}
                                </button>
                            </div>

                            {error && (
                                <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 shadow-sm">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-red-500">⚠</span>
                                        {error}
                                    </div>
                                </div>
                            )}
                            {success && (
                                <div className="text-green-600 dark:text-green-400 text-sm text-center bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        Created successfully!
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
