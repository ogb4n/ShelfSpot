import React, { useState } from "react";
import editPlace from "@/app/api/place/edit/editPlace";

export const EditPlaceForm: React.FC<{ placeId: number }> = ({ placeId }) => {
  const [formData, setFormData] = useState({ name: "", icon: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await editPlace(placeId, formData);
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
