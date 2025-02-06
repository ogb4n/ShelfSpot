"use client";
import React, { useState } from "react";
import { Item } from "@/app/utils/types";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
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
          tags: formData.tags.split(",").map((tag) => tag.trim()),
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
        placeholder="e.g., Laptop"
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
        placeholder="e.g., Available"
        className="border border-gray-300 rounded p-2 w-full"
      />
      {/* LES TAGS DOIVENT ETRE UNE LISTE SELECTIONNABLE ,
    PLUSIEURS TAGS PEUVENT ETRE SELECTIONNES,
    SI UN TAG EST SELECTIONNE UNE DEUXIEME FOIS ALORS IL SE DESELECTIONNE
    SI ON CLIQUE SUR UN TAG IL EST DESELECTIONNE */}
      <label htmlFor="tags" className="font-semibold">
        Tags
      </label>
      <input
        id="tags"
        type="text"
        value={formData.tags}
        onChange={handleChange}
        placeholder="electronics"
        className="border border-gray-300 rounded p-2 w-full"
      />

      <label htmlFor="roomId" className="font-semibold">
        Room ID
      </label>
      <input
        id="roomId"
        type="number"
        value={formData.roomId}
        onChange={handleChange}
        min="0"
        placeholder="e.g., 1"
        className="border border-gray-300 rounded p-2 w-full"
      />

      <label htmlFor="placeId" className="font-semibold">
        Place ID (optional)
      </label>
      <input
        id="placeId"
        type="number"
        value={formData.placeId}
        onChange={handleChange}
        min="0"
        placeholder="e.g., 2"
        className="border border-gray-300 rounded p-2 w-full"
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Item
      </button>
    </form>
  );
};
