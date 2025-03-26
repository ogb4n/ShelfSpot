import React, { useState } from "react";
import { IconSelector } from "../shared/IconSelector";
import { type IconName } from "lucide-react/dynamic";
import editRoom from "@/app/components/requests/editRoom";

export const EditRoomForm: React.FC<{ roomId: number }> = ({ roomId }) => {
  const [formData, setFormData] = useState({ name: "", icon: "search" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return editRoom(roomId, formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Edit name"
      />
      <IconSelector
        selectedIcon={formData.icon as IconName}
        onSelect={(iconName) => setFormData({ ...formData, icon: iconName })}
      />
      <button type="submit">Save Changes</button>
    </form>
  );
};
