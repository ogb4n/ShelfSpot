import React, { useState, useEffect } from "react";
import { Archive, HousePlus, DoorOpen, Lamp, SquareLibrary } from "lucide-react";
import Image from "next/image";

interface CreateObjectModalProps {
    open: boolean;
    onClose: () => void;
}

// Types pour les entités
interface Room { id: number; name: string; }
interface Place { id: number; name: string; roomId: number; }
interface Container { id: number; name: string; roomId: number; placeId: number; }

const objectTypes = [
    { key: "room", label: "Room", icon: <DoorOpen className="w-7 h-7 mb-2 text-violet-400" /> },
    { key: "place", label: "Place", icon: <SquareLibrary className="w-7 h-7 mb-2 text-violet-400" /> },
    { key: "container", label: "Container", icon: <Archive className="w-7 h-7 mb-2 text-violet-400" /> },
    { key: "item", label: "Item", icon: <Lamp className="w-7 h-7 mb-2 text-violet-400" /> },
];

const fetcher = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export default function CreateObjectModal({ open, onClose }: CreateObjectModalProps) {
    const [step, setStep] = useState<"select" | "form">("select");
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [form, setForm] = useState<any>({});
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
                fetcher("/api/room"),
                fetcher("/api/place"),
                fetcher("/api/container"),
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
            let endpoint = "/api/" + selectedType + "/add";
            let payload = { ...form };

            // Ajouter les IDs des relations selon le type
            if (selectedType === "place" && selectedRoomForPlace) {
                payload.roomId = selectedRoomForPlace;
            }
            if (selectedType === "container") {
                endpoint = "/api/container";
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
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Form fields per type avec menus déroulants
    const renderFormFields = () => {
        switch (selectedType) {
            case "room":
                return (
                    <label className="block mb-2 text-white">Room Name
                        <input
                            name="name"
                            className="theme-input w-full"
                            onChange={handleChange}
                            required
                        />
                    </label>
                );

            case "place":
                return (
                    <>
                        <label className="block mb-2 text-white">Room
                            <select
                                value={selectedRoomForPlace ?? ""}
                                onChange={e => setSelectedRoomForPlace(Number(e.target.value) || null)}
                                className="theme-input w-full"
                                required
                            >
                                <option value="">Select a room</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>{room.name}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block mb-2 text-white">Place Name
                            <input
                                name="name"
                                className="theme-input w-full"
                                onChange={handleChange}
                                required
                            />
                        </label>
                        {/* <label className="block mb-2 text-white">Icon (optional)
                            <input
                                name="icon"
                                className="theme-input w-full"
                                onChange={handleChange}
                            />
                        </label> */}
                    </>
                );

            case "container":
                return (
                    <>
                        <label className="block mb-2 text-white">Room
                            <select
                                value={selectedRoomForContainer ?? ""}
                                onChange={e => {
                                    const val = Number(e.target.value) || null;
                                    setSelectedRoomForContainer(val);
                                    setSelectedPlaceForContainer(null); // reset place when room changes
                                }}
                                className="theme-input w-full"
                                required
                            >
                                <option value="">Select a room</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>{room.name}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block mb-2 text-white">Place
                            <select
                                value={selectedPlaceForContainer ?? ""}
                                onChange={e => setSelectedPlaceForContainer(Number(e.target.value) || null)}
                                className="theme-input w-full"
                                required
                                disabled={!selectedRoomForContainer}
                            >
                                <option value="">Select a place</option>
                                {places
                                    .filter(p => p.roomId === selectedRoomForContainer)
                                    .map(place => (
                                        <option key={place.id} value={place.id}>{place.name}</option>
                                    ))}
                            </select>
                        </label>
                        <label className="block mb-2 text-white">Container Name
                            <input
                                name="name"
                                className="theme-input w-full"
                                onChange={handleChange}
                                required
                            />
                        </label>
                        {/* <label className="block mb-2 text-white">Icon (optional)
                            <input
                                name="icon"
                                className="theme-input w-full"
                                onChange={handleChange}
                            />
                        </label> */}
                    </>
                );

            case "item":
                return (
                    <>
                        <label className="block mb-2 text-white">Item Name
                            <input
                                name="name"
                                className="theme-input w-full"
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label className="block mb-2 text-white">Status (optional)
                            <input
                                name="status"
                                className="theme-input w-full"
                                onChange={handleChange}
                            />
                        </label>
                        <label className="block mb-2 text-white">Quantity
                            <input
                                name="quantity"
                                type="number"
                                min="1"
                                className="theme-input w-full"
                                onChange={handleChange}
                                defaultValue={1}
                            />
                        </label>
                        <label className="block mb-2 text-white">Price MSRP
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                className="theme-input w-full"
                                onChange={handleChange}
                            />
                        </label>
                        <label className="block mb-2 text-white">Sell Price (optional)
                            <input
                                name="sellprice"
                                type="number"
                                step="0.01"
                                className="theme-input w-full"
                                onChange={handleChange}
                            />
                        </label>
                        <label className="flex items-center mb-2 text-white">
                            <input
                                name="consumable"
                                type="checkbox"
                                className="mr-2"
                                onChange={e => setForm({ ...form, consumable: e.target.checked })}
                            />
                            Consumable Item
                        </label>

                        <h3 className="text-white font-semibold mb-2">Location :</h3>

                        <label className="block mb-2 text-white">Room
                            <select
                                value={selectedRoomForItem ?? ""}
                                onChange={e => {
                                    const val = Number(e.target.value) || null;
                                    setSelectedRoomForItem(val);
                                    setSelectedPlaceForItem(null);
                                    setSelectedContainerForItem(null);
                                }}
                                className="theme-input w-full"
                            >
                                <option value="">Select a room</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>{room.name}</option>
                                ))}
                            </select>
                        </label>

                        <label className="block mb-2 text-white">Place (optional)
                            <select
                                value={selectedPlaceForItem ?? ""}
                                onChange={e => {
                                    const val = Number(e.target.value) || null;
                                    setSelectedPlaceForItem(val);
                                    setSelectedContainerForItem(null);
                                }}
                                className="theme-input w-full"
                                disabled={!selectedRoomForItem}
                            >
                                <option value="">Select a place</option>
                                {places
                                    .filter(p => p.roomId === selectedRoomForItem)
                                    .map(place => (
                                        <option key={place.id} value={place.id}>{place.name}</option>
                                    ))}
                            </select>
                        </label>

                        <label className="block mb-2 text-white">Container (optional)
                            <select
                                value={selectedContainerForItem ?? ""}
                                onChange={e => setSelectedContainerForItem(Number(e.target.value) || null)}
                                className="theme-input w-full"
                                disabled={!selectedPlaceForItem}
                            >
                                <option value="">Select a container</option>
                                {containers
                                    .filter(c => c.placeId === selectedPlaceForItem)
                                    .map(container => (
                                        <option key={container.id} value={container.id}>{container.name}</option>
                                    ))}
                            </select>
                        </label>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[6px] bg-black/30">
            <div className="bg-gradient-to-br from-[#2a174a] to-[#3a1c5c] rounded-2xl p-8 min-w-[700px] max-w-6xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col justify-center items-center">
                {/* Fond image */}
                <div className="absolute inset-0 w-full h-full z-0 rounded-2xl overflow-hidden pointer-events-none">
                    <Image src="/modal_bg.png" alt="Modal background" fill style={{ objectFit: 'cover' }} priority />
                </div>
                {/* Contenu de la modale au-dessus du fond */}
                <button
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 text-2xl z-10"
                    onClick={() => {
                        resetModal();
                        onClose();
                    }}
                    aria-label="Fermer"
                >
                    ×
                </button>

                {step === "select" && (
                    <>
                        <h2 className="text-2xl font-semibold mb-8 text-center text-white relative z-20">
                            What would you like to add to your home ?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {objectTypes.map((type) => (
                                <div
                                    key={type.key}
                                    className="border border-violet-500 rounded-2xl p-8 flex flex-col items-center hover:bg-violet-800/30 transition cursor-pointer text-lg shadow-lg backdrop-blur-md bg-white/60 dark:bg-black/40 z-10"
                                    onClick={() => handleTypeSelect(type.key)}
                                >
                                    {type.icon}
                                    <span className="mb-2 text-white font-semibold">{type.label}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {step === "form" && selectedType && (
                    <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-full max-w-2xl mx-auto rounded-2xl border-2 border-blue-400 bg-black/30 dark:bg-white/10 backdrop-blur-md p-10 flex flex-col items-center relative z-20">
                            <h2 className="text-3xl font-semibold mb-8 text-center text-white">
                                {selectedType === "room" && "How should this room may be called ?"}
                                {selectedType === "place" && "How should this place may be called ?"}
                                {selectedType === "container" && "How should this container may be called ?"}
                                {selectedType === "item" && "How should this item may be called ?"}
                            </h2>
                            <div className="mb-8 flex flex-col items-center">
                                {objectTypes.find(t => t.key === selectedType)?.icon && (
                                    <div className="rounded-xl bg-black/30 dark:bg-white/10 p-6 mb-4 flex items-center justify-center">
                                        {objectTypes.find(t => t.key === selectedType)?.icon}
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
                                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                                    {/* ROOM */}
                                    {selectedType === "room" && (
                                        <div className="col-span-full flex flex-col gap-4 items-center">
                                            <label className="block text-white w-full max-w-md">
                                                <span className="block mb-2">Enter the name of the room</span>
                                                <input
                                                    name="name"
                                                    className="theme-input w-full text-center text-lg bg-black/40 border border-blue-400 rounded-lg px-4 py-2 text-white placeholder:text-zinc-400"
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
                                            <div className="flex flex-col gap-4">
                                                <label className="block text-white">
                                                    <span className="block mb-2">Room</span>
                                                    <select
                                                        value={selectedRoomForPlace ?? ""}
                                                        onChange={e => setSelectedRoomForPlace(Number(e.target.value) || null)}
                                                        className="theme-input w-full bg-black/40 border border-blue-400 text-white rounded-lg px-4 py-2"
                                                        required
                                                    >
                                                        <option value="">Select a room</option>
                                                        {rooms.map(room => (
                                                            <option key={room.id} value={room.id}>{room.name}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <label className="block text-white">
                                                    <span className="block mb-2">Place name</span>
                                                    <input
                                                        name="name"
                                                        className="theme-input w-full text-center text-lg bg-black/40 border border-blue-400 rounded-lg px-4 py-2 text-white placeholder:text-zinc-400"
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="Place name"
                                                    />
                                                </label>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                {/* Empty div for spacing */}
                                            </div>
                                        </>
                                    )}
                                    {/* CONTAINER */}
                                    {selectedType === "container" && (
                                        <>
                                            <div className="flex flex-col gap-4">
                                                <label className="block text-white">
                                                    <span className="block mb-2">Room</span>
                                                    <select
                                                        value={selectedRoomForContainer ?? ""}
                                                        onChange={e => {
                                                            const val = Number(e.target.value) || null;
                                                            setSelectedRoomForContainer(val);
                                                            setSelectedPlaceForContainer(null);
                                                        }}
                                                        className="theme-input w-full bg-black/40 border border-blue-400 text-white rounded-lg px-4 py-2"
                                                        required
                                                    >
                                                        <option value="">Select a room</option>
                                                        {rooms.map(room => (
                                                            <option key={room.id} value={room.id}>{room.name}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <label className="block text-white">
                                                    <span className="block mb-2">Place</span>
                                                    <select
                                                        value={selectedPlaceForContainer ?? ""}
                                                        onChange={e => setSelectedPlaceForContainer(Number(e.target.value) || null)}
                                                        className="theme-input w-full bg-black/40 border border-blue-400 text-white rounded-lg px-4 py-2"
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
                                            <div className="flex flex-col gap-4">
                                                <label className="block text-white">
                                                    <span className="block mb-2">Container name</span>
                                                    <input
                                                        name="name"
                                                        className="theme-input w-full text-center text-lg bg-black/40 border border-blue-400 rounded-lg px-4 py-2 text-white placeholder:text-zinc-400"
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
                                                <label className="block text-white">
                                                    <span className="block mb-2">Item name</span>
                                                    <input
                                                        name="name"
                                                        className="theme-input w-full text-center text-lg bg-black/40 border border-blue-400 rounded-lg px-4 py-2 text-white placeholder:text-zinc-400"
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="Item name"
                                                    />
                                                </label>
                                            </div>

                                            {/* Status - Full width */}
                                            <div className="col-span-full">
                                                <label className="block text-white">
                                                    <span className="block mb-2">Status (optional)</span>
                                                    <input
                                                        name="status"
                                                        className="theme-input w-full bg-black/40 border border-blue-400 rounded-lg px-4 py-2 text-white placeholder:text-zinc-400"
                                                        onChange={handleChange}
                                                        placeholder="Status"
                                                    />
                                                </label>
                                            </div>

                                            {/* Location row - 3 columns */}
                                            <div>
                                                <label className="block text-white">
                                                    <span className="block mb-2">Room</span>
                                                    <select
                                                        value={selectedRoomForItem ?? ""}
                                                        onChange={e => {
                                                            const val = Number(e.target.value) || null;
                                                            setSelectedRoomForItem(val);
                                                            setSelectedPlaceForItem(null);
                                                            setSelectedContainerForItem(null);
                                                        }}
                                                        className="theme-input w-full bg-black/40 border border-blue-400 text-white rounded-lg px-4 py-2"
                                                    >
                                                        <option value="">Select a room</option>
                                                        {rooms.map(room => (
                                                            <option key={room.id} value={room.id}>{room.name}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>
                                            <div>
                                                <label className="block text-white">
                                                    <span className="block mb-2">Place (optional)</span>
                                                    <select
                                                        value={selectedPlaceForItem ?? ""}
                                                        onChange={e => {
                                                            const val = Number(e.target.value) || null;
                                                            setSelectedPlaceForItem(val);
                                                            setSelectedContainerForItem(null);
                                                        }}
                                                        className="theme-input w-full bg-black/40 border border-blue-400 text-white rounded-lg px-4 py-2"
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
                                                <label className="block text-white">
                                                    <span className="block mb-2">Container (optional)</span>
                                                    <select
                                                        value={selectedContainerForItem ?? ""}
                                                        onChange={e => setSelectedContainerForItem(Number(e.target.value) || null)}
                                                        className="theme-input w-full bg-black/40 border border-blue-400 text-white rounded-lg px-4 py-2"
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
                                                <label className="block text-white">
                                                    <span className="block mb-2">Quantity</span>
                                                    <input
                                                        name="quantity"
                                                        type="number"
                                                        min="1"
                                                        className="theme-input w-full bg-black/40 border border-blue-400 rounded-lg px-4 py-2 text-white placeholder:text-zinc-400"
                                                        onChange={handleChange}
                                                        defaultValue={1}
                                                        placeholder="1"
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <label className="block text-white">
                                                    <span className="block mb-2">Price MSRP</span>
                                                    <input
                                                        name="price"
                                                        type="number"
                                                        step="0.01"
                                                        className="theme-input w-full bg-black/40 border border-blue-400 rounded-lg px-4 py-2 text-white placeholder:text-zinc-400"
                                                        onChange={handleChange}
                                                        placeholder="0.00"
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <label className="block text-white">
                                                    <span className="block mb-2">Sell Price (optional)</span>
                                                    <input
                                                        name="sellprice"
                                                        type="number"
                                                        step="0.01"
                                                        className="theme-input w-full bg-black/40 border border-blue-400 rounded-lg px-4 py-2 text-white placeholder:text-zinc-400"
                                                        onChange={handleChange}
                                                        placeholder="0.00"
                                                    />
                                                </label>
                                            </div>

                                            {/* Consumable checkbox - Full width */}
                                            <div className="col-span-full">
                                                <label className="flex items-center text-white justify-center">
                                                    <input
                                                        name="consumable"
                                                        type="checkbox"
                                                        className="mr-2"
                                                        onChange={e => setForm({ ...form, consumable: e.target.checked })}
                                                    />
                                                    Consumable Item
                                                </label>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="w-full flex justify-center">
                                    <button
                                        type="submit"
                                        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-full px-8 py-2 text-lg transition shadow"
                                        disabled={loading}
                                    >
                                        {loading ? "Creating..." : `Create a ${objectTypes.find(t => t.key === selectedType)?.label.toLowerCase()}`}
                                    </button>
                                </div>
                                {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
                                {success && <div className="text-green-400 text-sm mt-2">Created!</div>}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
