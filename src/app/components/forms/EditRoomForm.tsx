import React, { useState } from "react";

export const EditRoomForm: React.FC<{ roomId: number }> = ({ roomId }) => {
  const [formData, setFormData] = useState({ name: "", icon: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await fetch("/api/room/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId, ...formData }),
      });
    } catch (error) {
      return console.error("Failed to edit room:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Edit name"
      />
      <input
        name="icon"
        value={formData.icon}
        onChange={handleChange}
        placeholder="Edit icon"
      />
      <button type="submit">Save Changes</button>
    </form>
  );
};
