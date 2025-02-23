"use client";
import React, { useState, useEffect } from "react";
import useGetRooms from "../../hooks/useGetRooms";
import useGetPlaces from "../../hooks/useGetPlaces";
import useGetTags from "../../hooks/useGetTags";
import { Item, Room, Place, Tag } from "@/app/utils/types";
import createItem from "@/app/api/items/add/createItem";
import Switch from "@mui/joy/Switch";

export const AddItemForm: React.FC = () => {
  const [formData, setFormData] = useState<Item>({
    name: "",
    quantity: 0,
    status: "",
    room: { id: 0, name: "", icon: "" },
    place: { id: 0, name: "", icon: "", roomId: 0 },
    tags: [] as string[],
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { rooms } = useGetRooms();
  const { places } = useGetPlaces();
  const { tags } = useGetTags();
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [checked, setChecked] = React.useState<boolean>(false);

  useEffect(() => {
    if (formData.room?.id) {
      const filtered = places.filter(
        (place: Place) => place.roomId === formData.room?.id
      );
      setFilteredPlaces(filtered);
    } else {
      setFilteredPlaces([]);
    }
  }, [formData.room?.id, places]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "stock" || id === "price" || id === "roomId" || id === "placeId"
          ? Number(value)
          : value,
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
    try {
      await createItem(setSuccess, setError, formData);
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
        value={formData.quantity}
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
        value={formData.room?.id}
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
        value={formData.place?.id}
        onChange={handleChange}
        className="border border-gray-300 rounded-sm p-2 w-full"
        disabled={!formData.room?.id}
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

      <label className="font-semibold" htmlFor="consumable">
        Is the item a consumable ?
      </label>
      <Switch
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />

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
