import React from "react";
import { FormField, SelectField } from "@/components/ui/form-field";

interface RoomFormProps {
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

interface PlaceFormProps {
    rooms: Array<{ id: number; name: string }>;
    selectedRoom: number | null;
    onRoomChange: (roomId: number | null) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

interface ContainerFormProps {
    rooms: Array<{ id: number; name: string }>;
    places: Array<{ id: number; name: string; roomId: number }>;
    selectedRoom: number | null;
    selectedPlace: number | null;
    onRoomChange: (roomId: number | null) => void;
    onPlaceChange: (placeId: number | null) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

interface ItemFormProps {
    rooms: Array<{ id: number; name: string }>;
    places: Array<{ id: number; name: string; roomId: number }>;
    containers: Array<{ id: number; name: string; placeId: number }>;
    selectedRoom: number | null;
    selectedPlace: number | null;
    selectedContainer: number | null;
    onRoomChange: (roomId: number | null) => void;
    onPlaceChange: (placeId: number | null) => void;
    onContainerChange: (containerId: number | null) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onFormChange: (updates: Record<string, unknown>) => void;
}

export function RoomForm({ onChange }: RoomFormProps) {
    return (
        <FormField
            label="Enter the name of the room"
            name="name"
            placeholder="Room name"
            required
            onChange={onChange}
            className="col-span-full"
        />
    );
}

export function PlaceForm({ rooms, selectedRoom, onRoomChange, onChange }: PlaceFormProps) {
    return (
        <>
            <SelectField
                label="Room"
                name="room"
                value={selectedRoom ?? ""}
                required
                options={rooms.map(room => ({ value: room.id, label: room.name }))}
                emptyLabel="Select a room"
                onChange={(e) => onRoomChange(Number(e.target.value) || null)}
            />
            <FormField
                label="Place name"
                name="name"
                placeholder="Place name"
                required
                onChange={onChange}
                className="col-span-2"
            />
        </>
    );
}

export function ContainerForm({
    rooms,
    places,
    selectedRoom,
    selectedPlace,
    onRoomChange,
    onPlaceChange,
    onChange
}: ContainerFormProps) {
    const filteredPlaces = places.filter(p => p.roomId === selectedRoom);

    return (
        <>
            <SelectField
                label="Room"
                name="room"
                value={selectedRoom ?? ""}
                required
                options={rooms.map(room => ({ value: room.id, label: room.name }))}
                emptyLabel="Select a room"
                onChange={(e) => {
                    const val = Number(e.target.value) || null;
                    onRoomChange(val);
                    onPlaceChange(null);
                }}
            />
            <SelectField
                label="Place"
                name="place"
                value={selectedPlace ?? ""}
                required
                disabled={!selectedRoom}
                options={filteredPlaces.map(place => ({ value: place.id, label: place.name }))}
                emptyLabel="Select a place"
                onChange={(e) => onPlaceChange(Number(e.target.value) || null)}
            />
            <FormField
                label="Container name"
                name="name"
                placeholder="Container name"
                required
                onChange={onChange}
            />
        </>
    );
}

export function ItemForm({
    rooms,
    places,
    containers,
    selectedRoom,
    selectedPlace,
    selectedContainer,
    onRoomChange,
    onPlaceChange,
    onContainerChange,
    onChange,
    onFormChange
}: ItemFormProps) {
    const filteredPlaces = places.filter(p => p.roomId === selectedRoom);
    const filteredContainers = containers.filter(c => c.placeId === selectedPlace);

    return (
        <>
            <FormField
                label="Item name"
                name="name"
                placeholder="Item name"
                required
                onChange={onChange}
                className="col-span-full"
            />

            <FormField
                label="Status (optional)"
                name="status"
                placeholder="Status"
                onChange={onChange}
                className="col-span-full"
            />

            <SelectField
                label="Room"
                name="room"
                value={selectedRoom ?? ""}
                options={rooms.map(room => ({ value: room.id, label: room.name }))}
                emptyLabel="Select a room"
                onChange={(e) => {
                    const val = Number(e.target.value) || null;
                    onRoomChange(val);
                    onPlaceChange(null);
                    onContainerChange(null);
                }}
            />

            <SelectField
                label="Place (optional)"
                name="place"
                value={selectedPlace ?? ""}
                disabled={!selectedRoom}
                options={filteredPlaces.map(place => ({ value: place.id, label: place.name }))}
                emptyLabel="Select a place"
                onChange={(e) => {
                    const val = Number(e.target.value) || null;
                    onPlaceChange(val);
                    onContainerChange(null);
                }}
            />

            <SelectField
                label="Container (optional)"
                name="container"
                value={selectedContainer ?? ""}
                disabled={!selectedPlace}
                options={filteredContainers.map(container => ({ value: container.id, label: container.name }))}
                emptyLabel="Select a container"
                onChange={(e) => onContainerChange(Number(e.target.value) || null)}
            />

            <FormField
                label="Quantity"
                name="quantity"
                type="number"
                min="1"
                defaultValue={1}
                placeholder="1"
                onChange={onChange}
            />

            <FormField
                label="Price MSRP"
                name="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={onChange}
            />

            <FormField
                label="Sell Price (optional)"
                name="sellprice"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={onChange}
            />

            <FormField
                label="Consumable Item"
                name="consumable"
                type="checkbox"
                onChange={(e) => onFormChange({ consumable: (e.target as HTMLInputElement).checked })}
            />
        </>
    );
}
