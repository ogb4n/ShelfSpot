"use client";
import React, { useState } from "react";
import { IconSelector } from "../shared/IconSelector";
import { type IconName } from "lucide-react/dynamic";
import { Tag as ITag } from "../../utils/types";

interface TagAddFormProps {
  onAddTag: (newTag: ITag) => void;
}

export const TagAddForm: React.FC<TagAddFormProps> = ({ onAddTag }) => {
  const [formData, setFormData] = useState({
    name: "",
    icon: "home" as IconName,
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

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/tags/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du tag");
      }

      const newTag = await response.json();

      onAddTag(newTag);
      setSuccess("Tag ajouté avec succès !");
      setFormData({ name: "", icon: "home" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <label htmlFor="name" className="font-semibold">
        Nom du tag
      </label>
      <input
        type="text"
        id="name"
        required
        className="w-full border-gray-300 rounded-sm p-2"
        value={formData.name}
        onChange={handleChange}
      />

      <IconSelector selectedIcon={formData.icon} onSelect={handleIconSelect} />

      <button type="submit">Créer un tag</button>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </form>
  );
};
