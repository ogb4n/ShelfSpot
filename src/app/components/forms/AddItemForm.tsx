"use client";
import React, { useState, useEffect } from "react";
import useGetRooms from "../../hooks/useGetRooms";
import useGetPlaces from "../../hooks/useGetPlaces";
import useGetTags from "../../hooks/useGetTags";
import { Item, Room, Place, Tag } from "@/app/utils/types";
import { IconName } from "lucide-react/dynamic";

export const AddItemForm: React.FC = () => {
  const [formData, setFormData] = useState<Item>({
    name: "",
    stock: 0,
    price: 0,
    status: "",
    roomId: 0,
    placeId: 0,
    icon: "home" as IconName,
    tags: [] as string[],
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { rooms } = useGetRooms();
  const { places } = useGetPlaces();
  const { tags } = useGetTags();
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);

  useEffect(() => {
    if (formData.roomId) {
      const filtered = places.filter(
        (place: Place) => place.roomId === formData.roomId
      );
      setFilteredPlaces(filtered);
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

  const handleTagChange = (tagId: string) => {
    setFormData((prev) => {
      const newTags = prev.tags?.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...(prev.tags ?? []), tagId];
      return { ...prev, tags: newTags };
    });
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
          ...formData,
          stock: Number(formData.stock),
          price: Number(formData.price),
          roomId: formData.roomId ?? null,
          placeId: formData.placeId ?? null,
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
        roomId: 0,
        placeId: 0,
        icon: "home",
        tags: [],
      });
    } catch (err) {
      console.error(err);
      setError("An error occurred while creating the item.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white shadow-sm rounded-sm space-y-4"
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
        className="border border-gray-300 rounded-sm p-2 w-full"
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
        className="border border-gray-300 rounded-sm p-2 w-full"
      />

      <label htmlFor="roomId" className="font-semibold">
        Room
      </label>
      <select
        id="roomId"
        value={formData.roomId}
        onChange={handleChange}
        className="border border-gray-300 rounded-sm p-2 w-full"
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
        className="border border-gray-300 rounded-sm p-2 w-full"
        disabled={!formData.roomId}
      >
        <option value="">Select a place</option>
        {filteredPlaces.map((place: Place) => (
          <option key={place.id} value={place.id}>
            {place.name}
          </option>
        ))}
      </select>

      <label className="font-semibold" htmlFor="tags">
        Tags
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <button
            key={tag.id}
            type="button"
            className={`px-3 py-1 rounded ${
              formData.tags?.includes(tag.name)
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleTagChange(tag.name)}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600"
      >
        Create Item
      </button>
    </form>
  );
};
