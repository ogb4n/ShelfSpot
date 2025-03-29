"use client";
import React, { useState, useEffect } from "react";
import useGetPlaces from "../../hooks/useGetPlaces";
import { Place, Room } from "@/app/types";
import createContainer from "@/app/components/requests/createContainer";
import { IconSelector } from "../shared/IconSelector";
import { type IconName } from "lucide-react/dynamic";
import useGetRooms from "@/app/hooks/useGetRooms";

/**
 * Form component for adding new containers
 *
 * @returns {JSX.Element} Rendered form component
 */
export const AddContainerForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    placeId: 0,
    roomId: 0,
    icon: "box" as IconName,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { places } = useGetPlaces();
  const { rooms } = useGetRooms();

  // Use filteredPlaces as state that updates when roomId changes
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);

  // Update filteredPlaces whenever roomId or places change
  useEffect(() => {
    if (formData.roomId) {
      const placesInRoom = places.filter(
        (place: Place) => place.roomId === formData.roomId
      );
      setFilteredPlaces(placesInRoom);

      // Reset placeId if current selection isn't in the filtered list
      if (
        formData.placeId &&
        !placesInRoom.some((place: Place) => place.id === formData.placeId)
      ) {
        setFormData((prev) => ({ ...prev, placeId: 0 }));
      }
    } else {
      setFilteredPlaces([]);
    }
  }, [formData.roomId, places]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "roomId" || id === "placeId"
          ? value
            ? Number(value)
            : 0
          : value,
    }));
  };

  const handleIconSelect = (iconName: IconName) => {
    setFormData((prev) => ({
      ...prev,
      icon: iconName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    await createContainer(
      (msg) => setSuccess(msg),
      (msg) => setError(msg),
      formData
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <label htmlFor="name" className="font-semibold">
        Name
      </label>
      <input
        type="text"
        id="name"
        required
        className="w-full border-gray-300 rounded-sm p-2"
        value={formData.name}
        onChange={handleChange}
      />

      <label htmlFor="roomId" className="font-semibold">
        Room
      </label>
      <select
        id="roomId"
        value={formData.roomId || ""}
        onChange={handleChange}
        className="w-full border-gray-300 rounded-sm p-2"
        required
      >
        <option value="">Select a room</option>
        {rooms.map((room: Room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      <label htmlFor="placeId" className="font-semibold">
        Place
      </label>
      <select
        id="placeId"
        value={formData.placeId || ""}
        onChange={handleChange}
        className="w-full border-gray-300 rounded-sm p-2"
        required
        disabled={!formData.roomId} // Disable if no room is selected
      >
        <option value="">Select a place</option>
        {filteredPlaces.map((place: Place) => (
          <option key={place.id} value={place.id}>
            {place.name}
          </option>
        ))}
      </select>

      <label className="font-semibold">Icon</label>
      <IconSelector selectedIcon={formData.icon} onSelect={handleIconSelect} />

      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Container
      </button>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </form>
  );
};
