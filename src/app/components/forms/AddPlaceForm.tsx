"use client";
import React, { useState } from "react";
import useGetRooms from "../../hooks/useGetRooms";
import { Room } from "@/app/utils/types";

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

    console.log("Form data being sent:", formData);

    try {
      const response = await fetch("/api/place/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la place");
      }

      await response.json();

      setSuccess("Place ajoutée avec succès !");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
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
        className="w-full border-gray-300 rounded p-2"
        value={formData.name}
        onChange={handleChange}
      />

      <label htmlFor="roomId">Room</label>
      <select
        id="roomId"
        value={formData.roomId}
        onChange={handleChange}
        className="w-full border-gray-300 rounded p-2"
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
