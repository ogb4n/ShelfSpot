"use client";
/**
 * Module de formulaire d'ajout d'articles (AddItemForm)
 *
 * Ce composant présente un formulaire permettant d'ajouter un nouvel article à l'inventaire.
 * Il permet de spécifier le nom, la quantité, la pièce, l'emplacement et les tags associés à l'article.
 * Le formulaire inclut également une option pour indiquer si l'article est consommable.
 */
import React, { useState, useEffect } from "react";
import useGetRooms from "../../hooks/useGetRooms"; // Hook pour récupérer les pièces disponibles
import useGetPlaces from "../../hooks/useGetPlaces"; // Hook pour récupérer les emplacements disponibles
import useGetTags from "../../hooks/useGetTags"; // Hook pour récupérer les tags disponibles
import useGetContainers from "../../hooks/useGetContainers"; // Hook pour récupérer les conteneurs disponibles
import { Item, Room, Place, Tag, Container } from "@/app/types"; // Types pour la validation des données
import createItem from "@/app/components/requests/createItem"; // Fonction API pour créer un nouvel article
import Switch from "@mui/joy/Switch"; // Composant interrupteur pour l'option consommable

/**
 * Composant de formulaire pour ajouter un nouvel article à l'inventaire
 *
 * @returns {JSX.Element} Le formulaire rendu
 */
export const AddItemForm: React.FC = () => {
  // État pour stocker les données du formulaire avec une structure complète
  const [formData, setFormData] = useState<Item>({
    name: "",
    quantity: 0,
    status: "",
    roomId: 0,
    room: { id: 0, name: "", icon: "" },
    place: { id: 0, name: "", icon: "", roomId: 0 },
    tags: [] as string[],
  });

  // États pour gérer les messages d'erreur et de succès
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Utilisation des hooks personnalisés pour récupérer les données
  const { rooms } = useGetRooms();
  const { places } = useGetPlaces();
  const { tags } = useGetTags();
  const { containers = [] } = useGetContainers(); // Add proper hook for containers

  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [filteredContainers, setFilteredContainers] = useState<Container[]>([]);
  const [checked, setChecked] = React.useState<boolean>(false);

  useEffect(() => {
    if (formData.room?.id) {
      const filtered = places.filter(
        (place: Place) => place.roomId === formData.room?.id
      );
      setFilteredPlaces(filtered);
      
      // Also filter containers by the selected room
      const roomContainers = containers.filter(
        (container: Container) => container.roomId === formData.room?.id
      );
      setFilteredContainers(roomContainers);
    } else {
      setFilteredPlaces([]);
      setFilteredContainers([]);
    }
  }, [formData.room?.id, places, containers]);

  /**
   * Gère les changements dans les champs du formulaire
   * Convertit automatiquement certains champs en nombres si nécessaire
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - L'événement de changement
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    const numValue =
      id === "stock" || id === "price" || id === "roomId" || id === "placeId"
        ? Number(value)
        : value;

    setFormData((prev) => {
      const updatedData = { ...prev, [id]: numValue };

      // Additional updates for select fields
      if (id === "roomId") {
        // Find the selected room object
        const selectedRoom = rooms.find(
          (room: Room) => room.id === Number(value)
        ) ?? { id: 0, name: "", icon: "" };
        updatedData.room = selectedRoom;
        // Reset place when room changes
        updatedData.place = { id: 0, name: "", icon: "", roomId: 0 };
        updatedData.placeId = 0;
      }

      if (id === "placeId") {
        // Find the selected place object
        const selectedPlace = places.find(
          (place: Place) => place.id === Number(value)
        ) ?? { id: 0, name: "", icon: "", roomId: 0 };
        updatedData.place = selectedPlace;
      }

      if (id === "stock") {
        updatedData.quantity = Number(value);
      }

      return updatedData;
    });
  };

  /**
   * Gère les changements dans les champs select du formulaire
   * Utilitaire spécifique pour les menus déroulants, utilise handleChange en interne
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e - L'événement de changement
   */
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e);
  };

  /**
   * Gère la sélection/désélection des tags
   * Ajoute ou retire un tag de la liste des tags sélectionnés
   *
   * @param {string} tagId - L'identifiant du tag à ajouter ou retirer
   */
  const handleTagChange = (tagId: string) => {
    setFormData((prev) => {
      const newTags = prev.tags?.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...(prev.tags ?? []), tagId];
      return { ...prev, tags: newTags };
    });
  };

  /**
   * Gère la soumission du formulaire
   * Envoie les données à l'API et gère les états de succès ou d'erreur
   *
   * @param {React.FormEvent} e - L'événement de soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createItem(setSuccess, setError, formData);
    } catch (err) {
      console.error(err);
      setError("An error occurred while creating the item.");
    }
  };

  // Rendu du formulaire avec tous ses champs et options
  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <label htmlFor="name" className="font-semibold text-gray-200">
        Item Name
      </label>
      <input
        type="text"
        id="name"
        name="name"
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label htmlFor="quantity" className="font-semibold text-gray-200">
        Quantity
      </label>
      <input
        type="number"
        id="quantity"
        name="quantity"
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        value={formData.quantity}
        onChange={handleChange}
        required
        min="1"
      />

      <label htmlFor="roomId" className="font-semibold text-gray-200">
        Room
      </label>
      <select
        id="roomId"
        name="roomId"
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        value={formData.roomId || ""}
        onChange={handleSelectChange}
        required
      >
        <option value="">Select a room</option>
        {Array.isArray(rooms) && rooms.map((room: Room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      <label htmlFor="placeId" className="font-semibold text-gray-200">
        Place
      </label>
      <select
        id="placeId"
        name="placeId"
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        value={formData.placeId || ""}
        onChange={handleSelectChange}
        required
        disabled={!formData.roomId}
      >
        <option value="">Select a place</option>
        {filteredPlaces.map((place) => (
          <option key={place.id} value={place.id}>
            {place.name}
          </option>
        ))}
      </select>

      <label htmlFor="containerId" className="font-semibold text-gray-200">
        Container (optional)
      </label>
      <select
        id="containerId"
        name="containerId"
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        value={formData.containerId || ""}
        onChange={handleSelectChange}
      >
        <option value="">Select a container</option>
        {filteredContainers.map((container) => (
          <option key={container.id} value={container.id}>
            {container.name}
          </option>
        ))}
      </select>

      <label htmlFor="tags" className="font-semibold text-gray-200">
        Tags (optional, comma separated)
      </label>
      <input
        type="text"
        id="tags"
        name="tags"
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2"
        value={formData.tags}
        onChange={handleChange}
        placeholder="tag1, tag2, tag3"
      />

      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
      >
        Create Item
      </button>

      {error && <p className="text-[#9E2A2B]">{error}</p>}
      {success && <p className="text-[#4FAE62]">{success}</p>}
    </form>
  );
};
