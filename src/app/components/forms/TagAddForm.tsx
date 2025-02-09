"use client";
import React, { useState } from "react";
import { IconSelector } from "../shared/IconSelector";
import { type IconName } from "lucide-react/dynamic";

export const TagAddForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    icon: "home" as IconName, // Valeur par défaut
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

  const handleIconSelect = (iconName: IconName) => {
    setFormData((prev) => ({
      ...prev,
      icon: iconName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Form data being sent:", formData);

    try {
      const response = await fetch("/api/tags/add", {
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

      setSuccess("Room added successfully!");
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

      <IconSelector selectedIcon={formData.icon} onSelect={handleIconSelect} />

      <button type="submit">Create a tag</button>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </form>
  );
};
