import React from "react";

export const AddOutcomeForm = () => {
  const [formData, setFormData] = React.useState({ name: "", description: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Outcome submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Outcome Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <textarea
        placeholder="Outcome Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />
      <button type="submit">Add Outcome</button>
    </form>
  );
};
