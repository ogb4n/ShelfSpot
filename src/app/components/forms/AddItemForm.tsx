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
import { Item, Room, Place, Tag } from "@/app/types"; // Types pour la validation des données
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
  const { rooms } = useGetRooms(); // Récupère la liste des pièces
  const { places } = useGetPlaces(); // Récupère la liste des emplacements
  const { tags } = useGetTags(); // Récupère la liste des tags

  // État pour filtrer les emplacements en fonction de la pièce sélectionnée
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  // État pour gérer l'option "article consommable"
  const [checked, setChecked] = React.useState<boolean>(false);

  /**
   * Effet pour filtrer les emplacements en fonction de la pièce sélectionnée
   * Lorsqu'une pièce est choisie, seuls les emplacements associés à cette pièce sont affichés
   */
  useEffect(() => {
    if (formData.room?.id) {
      const filtered = places.filter(
        (place: Place) => place.roomId === formData.room?.id
      );
      setFilteredPlaces(filtered);
    } else {
      setFilteredPlaces([]);
    }
  }, [formData.room?.id, places]);

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

    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "stock" || id === "price" || id === "roomId" || id === "placeId"
          ? Number(value)
          : value,
    }));
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
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white shadow-sm rounded-sm space-y-4"
    >
      {/* Champ pour le nom de l'article */}
      <label htmlFor="name" className="font-semibold">
        Item Name
      </label>
      <input
        id="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        required
        className="border border-gray-300 rounded-sm p-2 w-full"
      />

      {/* Champ pour la quantité en stock */}
      <label htmlFor="stock" className="font-semibold">
        Stock
      </label>
      <input
        id="stock"
        type="number"
        value={formData.quantity}
        onChange={handleChange}
        min="0"
        required
        className="border border-gray-300 rounded-sm p-2 w-full"
      />

      {/* Sélecteur de pièce avec options dynamiques */}
      <label htmlFor="roomId" className="font-semibold">
        Room
      </label>
      <select
        id="roomId"
        value={formData.room?.id}
        onChange={handleChange}
        className="border border-gray-300 rounded-sm p-2 w-full"
      >
        <option value="">Select a room</option>
        {rooms.map((room: Room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      {/* Sélecteur d'emplacement filtré selon la pièce choisie */}
      <label htmlFor="placeId" className="font-semibold">
        Place
      </label>
      <select
        id="placeId"
        value={formData.place?.id}
        onChange={handleChange}
        className="border border-gray-300 rounded-sm p-2 w-full"
        disabled={!formData.room?.id} // Désactivé tant qu'une pièce n'est pas sélectionnée
      >
        <option value="">Select a place</option>
        {filteredPlaces.map((place: Place) => (
          <option key={place.id} value={place.id}>
            {place.name}
          </option>
        ))}
      </select>

      {/* Sélection de tags avec interface visuelle */}
      <label className="font-semibold" htmlFor="tags">
        Tags
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <button
            key={tag.id}
            type="button"
            className={`px-3 py-1 rounded ${
              formData.tags?.includes(tag.name)
                ? "bg-blue-500 text-white" // Style pour les tags sélectionnés
                : "bg-gray-200" // Style pour les tags non sélectionnés
            }`}
            onClick={() => handleTagChange(tag.name)}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {/* Option pour indiquer si l'article est consommable */}
      <label className="font-semibold" htmlFor="consumable">
        Is the item a consumable ?
      </label>
      <Switch
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />

      {/* Affichage des messages d'erreur et de succès */}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {/* Bouton de soumission du formulaire */}
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600"
      >
        Create Item
      </button>
    </form>
  );
};
