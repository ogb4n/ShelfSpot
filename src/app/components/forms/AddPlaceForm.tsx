"use client";
import React, { useState } from "react";
import useGetRooms from "../../hooks/useGetRooms";
import { Room } from "@/app/types";
import createPlace from "@/app/components/requests/createPlace";

export const AddPlaceForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    roomId: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { rooms } = useGetRooms();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: id === "roomId" ? (value ? Number(value) : null) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await createPlace(setSuccess, setError, formData);
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

      <label htmlFor="roomId">Room</label>
      <select
        id="roomId"
        value={formData.roomId}
        onChange={handleChange}
        className="w-full border-gray-300 rounded-sm p-2"
      >
        <option value="">Select a room</option>
        {rooms.map((room: Room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      <button type="submit">Add Place</button>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </form>
  );
};
