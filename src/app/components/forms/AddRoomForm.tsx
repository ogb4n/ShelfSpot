"use client";
import React, { useState } from "react";
import createRoom from "@/app/components/requests/createRoom";

export const AddRoomForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return createRoom(setSuccess, setError, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <label htmlFor="name" className="font-semibold text-gray-200">
        Room Name
      </label>
      <input
        type="text"
        id="name"
        name="name"
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        value={formData.name}
        onChange={handleChange}
      />

      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
      >
        Add Room
      </button>

      {error && <p className="text-[#9E2A2B]">{error}</p>}
      {success && <p className="text-[#4FAE62]">{success}</p>}
    </form>
  );
};
