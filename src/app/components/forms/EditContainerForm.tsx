"use client";
import React, { useState, useEffect } from "react";
import { IconSelector } from "../shared/IconSelector";
import { type IconName } from "lucide-react/dynamic";
import editContainer from "@/app/components/requests/editContainer";
import useGetRooms from "@/app/hooks/useGetRooms";
import useGetPlaces from "@/app/hooks/useGetPlaces";
import { Place, Room } from "@/app/types";
import Loading from "../shared/Loading";

interface EditContainerFormProps {
  containerId: number;
}

export const EditContainerForm: React.FC<EditContainerFormProps> = ({
  containerId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    icon: "box" as IconName,
    roomId: 0,
    placeId: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { rooms } = useGetRooms();
  const { places } = useGetPlaces();
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);

  // Fetch container data when component mounts
  useEffect(() => {
    const fetchContainer = async () => {
      try {
        const response = await fetch(`/api/containers?id=${containerId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch container data");
        }

        const container = await response.json();
        setFormData({
          name: container.name || "",
          icon: container.icon || "box",
          roomId: container.roomId || 0,
          placeId: container.placeId || 0,
        });
      } catch (error) {
        setError("Failed to load container data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchContainer();
  }, [containerId]);

  // Filter places when room changes
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

    try {
      await editContainer(containerId, {
        name: formData.name,
        icon: formData.icon,
        placeId: formData.placeId,
        roomId: formData.roomId,
      });
      setSuccess("Container updated successfully!");
    } catch (err) {
      setError("Error updating container");
      console.error(err);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <label htmlFor="name" className="font-semibold text-gray-200">
        Container Name
      </label>
      <input
        type="text"
        id="name"
        name="name"
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        value={formData.name}
        onChange={handleChange}
      />

      <label htmlFor="roomId" className="font-semibold text-gray-200">
        Room
      </label>
      <select
        id="roomId"
        value={formData.roomId || ""}
        onChange={handleChange}
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
      >
        <option value="">Select a room</option>
        {rooms.map((room: Room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      <label htmlFor="placeId" className="font-semibold text-gray-200">
        Place
      </label>
      <select
        id="placeId"
        value={formData.placeId || ""}
        onChange={handleChange}
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        disabled={!formData.roomId}
      >
        <option value="">Select a place</option>
        {filteredPlaces.map((place: Place) => (
          <option key={place.id} value={place.id}>
            {place.name}
          </option>
        ))}
      </select>

      <label className="font-semibold text-gray-200">Icon</label>
      <IconSelector selectedIcon={formData.icon} onSelect={handleIconSelect} />

      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
      >
        Save Changes
      </button>

      {error && <p className="text-[#9E2A2B]">{error}</p>}
      {success && <p className="text-[#4FAE62]">{success}</p>}
    </form>
  );
};
