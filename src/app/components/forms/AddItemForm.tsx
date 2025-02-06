"use client";
import React, { useState, useEffect } from "react";
import useGetRooms from "../../hooks/useGetRooms";
import useGetPlaces from "../../hooks/useGetPlaces";
import { Item, Room, Place } from "@/app/utils/types";

export const AddItemForm: React.FC = () => {
  const [formData, setFormData] = useState<Item>({
    name: "",
    stock: 0,
    price: 0,
    status: "",
    tags: "",
    roomId: 0,
    placeId: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { rooms } = useGetRooms();
  const { places } = useGetPlaces();
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);

  useEffect(() => {
    if (formData.roomId) {
      setFilteredPlaces(
        places.filter((place: Place) => place.roomId === formData.roomId)
      );
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
      [id]: id === "roomId" || id === "placeId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/items/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          stock: Number(formData.stock),
          price: Number(formData.price),
          status: formData.status,
          tags: formData.tags?.split(",").map((tag) => tag.trim()),
          roomId: formData.roomId ? Number(formData.roomId) : null,
          placeId: formData.placeId ? Number(formData.placeId) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create item");
      }

      setSuccess("Item successfully created!");
      setFormData({
        name: "",
        stock: 0,
        price: 0,
        status: "",
        tags: "",
        roomId: 0,
        placeId: 0,
      });
    } catch (err) {
      console.error(err);
      setError("An error occurred while creating the item.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white shadow rounded space-y-4"
    >
      <label htmlFor="name" className="font-semibold">
        Item Name
      </label>
      <input
        id="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        required
        className="border border-gray-300 rounded p-2 w-full"
      />

      <label htmlFor="stock" className="font-semibold">
        Stock
      </label>
      <input
        id="stock"
        type="number"
        value={formData.stock}
        onChange={handleChange}
        min="0"
        required
        className="border border-gray-300 rounded p-2 w-full"
      />

      <label htmlFor="price" className="font-semibold">
        Price
      </label>
      <input
        id="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        min="0"
        step="0.01"
        className="border border-gray-300 rounded p-2 w-full"
      />

      <label htmlFor="status" className="font-semibold">
        Status
      </label>
      <input
        id="status"
        type="text"
        value={formData.status}
        onChange={handleChange}
        className="border border-gray-300 rounded p-2 w-full"
      />

      {/* <label htmlFor="tags" className="font-semibold">
        Tags
      </label>
      <input
        id="tags"
        type="text"
        value={formData.tags}
        onChange={handleChange}
        className="border border-gray-300 rounded p-2 w-full"
      /> */}

      <label htmlFor="roomId" className="font-semibold">
        Room
      </label>
      <select
        id="roomId"
        value={formData.roomId}
        onChange={handleChange}
        className="border border-gray-300 rounded p-2 w-full"
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
        value={formData.placeId}
        onChange={handleChange}
        className="border border-gray-300 rounded p-2 w-full"
        disabled={!formData.roomId}
      >
        <option value="">Select a place</option>
        {filteredPlaces.map((place: Place) => (
          <option key={place.id} value={place.id}>
            {place.name}
          </option>
        ))}
      </select>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Item
      </button>
    </form>
  );
};
