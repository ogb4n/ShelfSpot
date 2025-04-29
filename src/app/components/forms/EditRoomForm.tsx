import React, { useState } from "react";
import { IconSelector } from "../shared/IconSelector";
import { type IconName } from "lucide-react/dynamic";
import editRoom from "@/app/components/requests/editRoom";

export const EditRoomForm: React.FC<{ roomId: number }> = ({ roomId }) => {
  const [formData, setFormData] = useState({ name: "", icon: "search" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await editRoom(roomId, formData);
      setSuccess("Room updated successfully!");
      setError(null);
    } catch (err) {
      setError("Failed to update room.");
      setSuccess(null);
    }
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
      <IconSelector
        selectedIcon={formData.icon as IconName}
        onSelect={(iconName) => setFormData({ ...formData, icon: iconName })}
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
      >
        Save Changes
      </button>
      {error && <p className="text-[#9E2A2B]">{error}</p>}
      {success && <p className="text-[#4FAE62]">{success}</p>}
    </form>
  );
};
