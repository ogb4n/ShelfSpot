"use client";
/**
 * Module de liste des consommables (ConsumablesList)
 *
 * Ce composant affiche et gère la liste des articles consommables de l'inventaire.
 * Il permet de visualiser, modifier et supprimer des consommables via une grille de données interactive.
 * Le composant offre des fonctionnalités d'édition en ligne, de tri et de pagination.
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  EditIcon,
  DeleteIcon,
  SaveIcon,
  CancelIcon,
  GradeIcon,
} from "@/app/assets/icons"; // Icônes pour les actions
import deleteItem from "@/app/components/requests/deleteItem"; // Fonction API pour supprimer un article
import editItem from "@/app/components/requests/editItem"; // Fonction API pour éditer un article
import Loading from "./shared/Loading";
import { Item } from "@/app/types"; // Interface définissant la structure d'un article

type ItemRow = {
  id: number;
  name: string;
  quantity: number;
  place: string;
  room: string;
  status?: string;
  isNew?: boolean;
};

/**
 * Composant principal de liste des consommables
 * Affiche et gère les articles consommables dans une grille interactive
 *
 * @returns {JSX.Element} Le composant rendu
 */
export const ConsumablesList: React.FC = () => {
  // État pour stocker les données des lignes du tableau
  const [rows, setRows] = useState<ItemRow[]>([]);
  // État pour suivre quelle ligne est en cours d'édition (null si aucune)
  const [editingId, setEditingId] = useState<number | null>(null);
  // État pour stocker les valeurs temporaires pendant l'édition
  const [editValues, setEditValues] = useState<Partial<ItemRow>>({});
  // État pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  // État pour le chargement des données
  const [loading, setLoading] = useState<boolean>(true);
  // État pour les messages d'erreur
  const [error, setError] = useState<string | null>(null);
  // État pour la liste des pièces (utilisé dans les sélecteurs)
  const [rooms, setRooms] = useState<string[]>([]);
  // État pour la liste des emplacements (utilisé dans les sélecteurs)
  const [places, setPlaces] = useState<string[]>([]);

  /**
   * Récupère la liste des articles consommables depuis l'API
   * Transforme les données pour les adapter au format de la grille
   */
  const fetchItems = useCallback(async () => {
    setLoading(true); // Active l'indicateur de chargement
    setError(null); // Réinitialise les erreurs précédentes

    try {
      // Appel à l'API pour récupérer les articles consommables
      const response = await fetch("/api/items/consumables");
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }

      // Traitement des données reçues
      const data: Item[] = await response.json();

      // Formatage des données pour la grille avec gestion des valeurs nulles
      setRows(
        data.map((item) => ({
          id: item.id ?? -1, // Ensure id is always a number, using -1 as a fallback
          name: item.name,
          quantity: item.quantity,
          place: item.place ? item.place.name : "N/A", // Gestion des emplacements manquants
          room: item.room ? item.room.name : "N/A", // Gestion des pièces manquantes
          status: item.status ?? "N/A", // Gestion du statut manquant
        }))
      );
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setLoading(false); // Désactive l'indicateur de chargement
    }
  }, []);

  /**
   * Récupère la liste des pièces et des emplacements pour les sélecteurs
   * Ces données sont utilisées dans les menus déroulants d'édition
   */
  const fetchRoomsAndPlaces = useCallback(async () => {
    try {
      // Appels API parallèles pour récupérer les pièces et les emplacements
      const roomsResponse = await fetch("/api/rooms");
      const placesResponse = await fetch("/api/places");

      if (!roomsResponse.ok || !placesResponse.ok) {
        throw new Error("Failed to fetch rooms or places");
      }

      // Traitement des données reçues
      const roomsData = await roomsResponse.json();
      const placesData = await placesResponse.json();

      // Extraction des noms pour les listes déroulantes
      setRooms(
        roomsData.map((room: { id: number; name: string }) => room.name)
      );
      setPlaces(
        placesData.map((place: { id: number; name: string }) => place.name)
      );
    } catch (err) {
      console.error("Error fetching rooms or places:", err);
    }
  }, []);

  /**
   * Effet pour charger les données initiales au montage du composant
   */
  useEffect(() => {
    fetchItems(); // Chargement des articles consommables
    fetchRoomsAndPlaces(); // Chargement des pièces et emplacements
  }, [fetchItems, fetchRoomsAndPlaces]);

  /**
   * Active le mode édition pour une ligne spécifique
   *
   * @param {number} id - L'identifiant de la ligne à éditer
   */
  const handleEditClick = (id: number) => {
    const row = rows.find(row => row.id === id);
    if (row) {
      setEditingId(id);
      setEditValues({ ...row });
    }
  };

  /**
   * Sauvegarde les modifications et quitte le mode édition
   *
   * @param {number} id - L'identifiant de la ligne modifiée
   */
  const handleSaveClick = async (id: number) => {
    try {
      // Get the current row and merge with edit values
      const currentRow = rows.find(row => row.id === id);
      if (!currentRow) return;
      
      const updatedRow: ItemRow = {
        ...currentRow,
        ...editValues,
        id, // Ensure id is a number
        isNew: false,
      };
      
      await editItem(updatedRow); // Appel API pour mettre à jour l'article

      // Mettre à jour l'interface avec les nouvelles données
      setRows(rows.map((row) => (row.id === id ? updatedRow : row)));
      setEditingId(null);
      setEditValues({});
    } catch (err) {
      console.error("Error saving row:", err);
      setError("Failed to update item. Please try again.");
    }
  };

  /**
   * Supprime un article consommable après confirmation
   *
   * @param {number} id - L'identifiant de la ligne à supprimer
   */
  const handleDeleteClick = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(id); // Appel API pour supprimer l'article
        setRows(rows.filter((row) => row.id !== id)); // Mise à jour de l'UI
      } catch (err) {
        console.error("Error deleting item:", err);
        setError("Failed to delete item. Please try again.");
      }
    }
  };

  /**
   * Annule les modifications en cours et quitte le mode édition
   *
   * @param {number} id - L'identifiant de la ligne en édition
   */
  const handleCancelClick = (id: number) => {
    setEditingId(null);
    setEditValues({});
  };

  /**
   * Gère les changements dans les champs d'édition
   */
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditValues(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value
    }));
  };

  // Pagination - calculer l'index de début et de fin pour les lignes à afficher
  const indexOfLastRow = (page + 1) * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  // Affichage de l'indicateur de chargement pendant le chargement des données
  if (loading) {
    return <Loading />;
  }

  // Affichage d'un message d'erreur avec possibilité de réessayer
  if (error) {
    return (
      <div className="text-center mt-8">
        <h3 className="text-xl text-red-400 mb-2">{error}</h3>
        <button
          onClick={fetchItems}
          className="mt-2 px-4 py-2 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Rendu principal du composant avec la table personnalisée
  return (
    <div className="w-full">
      {/* Table container */}
      <div className="overflow-x-auto border border-gray-700 rounded">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#232323]">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Item
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Qty.
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Place
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Room
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tags
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
            {currentRows.length > 0 ? (
              currentRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#232323]">
                  {/* Item Name */}
                  <td className="px-4 py-3">
                    {editingId === row.id ? (
                      <input
                        type="text"
                        name="name"
                        value={editValues.name || ''}
                        onChange={handleEditChange}
                        className="w-full p-1 bg-[#3a3a3a] border border-gray-600 rounded text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-200">{row.name}</span>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="px-4 py-3">
                    {editingId === row.id ? (
                      <input
                        type="number"
                        name="quantity"
                        value={editValues.quantity || 0}
                        onChange={handleEditChange}
                        className="w-full p-1 bg-[#3a3a3a] border border-gray-600 rounded text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-200">{row.quantity}</span>
                    )}
                  </td>

                  {/* Place */}
                  <td className="px-4 py-3">
                    {editingId === row.id ? (
                      <select
                        name="place"
                        value={editValues.place || ''}
                        onChange={handleEditChange}
                        className="w-full p-1 bg-[#3a3a3a] border border-gray-600 rounded text-white text-sm"
                      >
                        {places.map(place => (
                          <option key={place} value={place}>{place}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-200">{row.place}</span>
                    )}
                  </td>

                  {/* Room */}
                  <td className="px-4 py-3">
                    {editingId === row.id ? (
                      <select
                        name="room"
                        value={editValues.room || ''}
                        onChange={handleEditChange}
                        className="w-full p-1 bg-[#3a3a3a] border border-gray-600 rounded text-white text-sm"
                      >
                        {rooms.map(room => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-200">{row.room}</span>
                    )}
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-3">
                    <span className="text-gray-200">-</span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 space-x-2">
                    {editingId === row.id ? (
                      <>
                        <button
                          onClick={() => handleSaveClick(row.id)}
                          className="p-1 inline-flex items-center justify-center text-green-500 hover:bg-green-900/30 rounded"
                        >
                          <SaveIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleCancelClick(row.id)}
                          className="p-1 inline-flex items-center justify-center text-gray-400 hover:bg-gray-700/50 rounded"
                        >
                          <CancelIcon className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(row.id)}
                          className="p-1 inline-flex items-center justify-center text-blue-400 hover:bg-blue-900/30 rounded"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(row.id)}
                          className="p-1 inline-flex items-center justify-center text-red-400 hover:bg-red-900/30 rounded"
                        >
                          <DeleteIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="p-1 inline-flex items-center justify-center text-yellow-400 hover:bg-yellow-900/30 rounded"
                        >
                          <GradeIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No items available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#202020] border-t border-gray-700 text-sm">
        <div className="text-gray-400">
          Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, rows.length)} of {rows.length} entries
        </div>
        <div className="flex">
          <button
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
            className="px-3 py-1 border border-gray-700 rounded-l bg-[#2a2a2a] text-white disabled:opacity-50"
          >
            Previous
          </button>
          <div className="px-4 py-1 border-t border-b border-gray-700 bg-[#333] text-white">
            {page + 1} of {totalPages}
          </div>
          <button
            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 border border-gray-700 rounded-r bg-[#2a2a2a] text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
