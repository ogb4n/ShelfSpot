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
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <label htmlFor="name" className="font-semibold text-gray-200">
        Place Name
      </label>
      <input
        type="text"
        id="name"
        name="name"
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label htmlFor="roomId" className="font-semibold text-gray-200">
        Room
      </label>
      <select
        id="roomId"
        name="roomId"
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        value={formData.roomId || ""}
        onChange={handleChange}
        required
      >
        <option value="">Select a room</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
      >
        Add Place
      </button>

      {error && <p className="text-[#9E2A2B]">{error}</p>}
      {success && <p className="text-[#4FAE62]">{success}</p>}
    </form>
  );
};
