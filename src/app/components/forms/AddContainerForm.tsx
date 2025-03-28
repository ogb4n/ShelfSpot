"use client";
import React, { useState, useEffect } from "react";
import useGetRooms from "../../hooks/useGetRooms";
import useGetPlaces from "../../hooks/useGetPlaces";
import { Room, Place } from "@/app/types";

export const AddContainerForm: React.FC = () => {
  // Form data state with required fields for a container
  const [formData, setFormData] = useState({
    name: "",
    roomId: 0,
    placeId: 0,
  });

  // State for error and success messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Get rooms and places data from custom hooks
  const { rooms } = useGetRooms();
  const { places } = useGetPlaces();

  // State for filtered places based on selected room
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);

  // Update filtered places whenever room selection changes
  useEffect(() => {
    if (formData.roomId) {
      const filtered = places.filter(
        (place: Place) => place.roomId === formData.roomId
      );
      setFilteredPlaces(filtered);
    } else {
      setFilteredPlaces([]);
    }
  }, [formData.roomId, places]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "roomId" || id === "placeId"
          ? value
            ? Number(value)
            : 0
          : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name) {
        setError("Container name is required");
        setLoading(false);
        return;
      }

      if (!formData.placeId) {
        setError("Please select a place for this container");
        setLoading(false);
        return;
      }

      // Send API request to create the container
      const response = await fetch("/api/containers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create container");
      }

      // Success handling
      setSuccess("Container successfully created!");
      // Reset form
      setFormData({
        name: "",
        roomId: 0,
        placeId: 0,
      });
    } catch (err) {
      console.error(err);
      setError("An error occurred while creating the container.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {/* Container Name Field */}
      <label htmlFor="name" className="font-semibold">
        Container Name
      </label>
      <input
        type="text"
        id="name"
        required
        className="w-full border-gray-300 rounded-sm p-2"
        value={formData.name}
        onChange={handleChange}
      />

      {/* Room Selection */}
      <label htmlFor="roomId" className="font-semibold">
        Room
      </label>
      <select
        id="roomId"
        value={formData.roomId || ""}
        onChange={handleChange}
        className="w-full border-gray-300 rounded-sm p-2"
      >
        <option value="">Select a room</option>
        {rooms.map((room: Room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      {/* Place Selection - filtered by selected room */}
      <label htmlFor="placeId" className="font-semibold">
        Place
      </label>
      <select
        id="placeId"
        value={formData.placeId || ""}
        onChange={handleChange}
        className="w-full border-gray-300 rounded-sm p-2"
        disabled={!formData.roomId} // Disabled until a room is selected
      >
        <option value="">Select a place</option>
        {filteredPlaces.map((place: Place) => (
          <option key={place.id} value={place.id}>
            {place.name}
          </option>
        ))}
      </select>

      {/* Submit Button */}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Creating..." : "Add Container"}
      </button>

      {/* Error and Success Messages */}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </form>
  );
};
