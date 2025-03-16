"use client";
/**
 * Module de liste des pièces (RoomsList)
 * 
 * Ce composant affiche la liste des pièces disponibles dans l'application.
 * Il permet de visualiser, modifier et supprimer des pièces.
 * Chaque pièce est affichée dans une carte avec des boutons d'action.
 */
import useGetRooms from "@/app/hooks/useGetRooms"; // Hook personnalisé pour récupérer les pièces
import Card from "@mui/joy/Card"; // Composant de carte
import Button from "@mui/joy/Button"; // Composant de bouton
import React, { useState } from "react";
import { DeleteOutlineIcon } from "../utils/icons"; // Icône de suppression
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"; // Icône d'édition
import { Room } from "../utils/types"; // Interface définissant la structure d'une pièce
import { BasicModal } from "./shared/BasicModal"; // Composant de fenêtre modale
import { EditRoomForm } from "./forms/EditRoomForm"; // Formulaire d'édition de pièce
import theme from "../theme"; // Thème de l'application
import deleteRoom from "../api/room/delete/deleteRoom"; // Fonction API pour supprimer une pièce

/**
 * Composant d'affichage de la liste des pièces
 * 
 * Affiche toutes les pièces disponibles avec des options pour les éditer
 * et les supprimer. Utilise le hook useGetRooms pour récupérer les données.
 * 
 * @returns {JSX.Element} Le composant rendu
 */
export const RoomsList: React.FC = () => {
  // Récupération des pièces depuis l'API via le hook personnalisé
  const { rooms, loading, error } = useGetRooms();
  // État pour suivre la pièce en cours de suppression
  const [deleting, setDeleting] = useState<number | null>(null);

  /**
   * Gère la suppression d'une pièce
   * Met à jour l'état local et appelle l'API pour effectuer la suppression
   * 
   * @param {number} id - L'identifiant de la pièce à supprimer
   * @returns {Promise} Promesse de suppression
   */
  const handleDelete = async (id: number) => {
    // Marque cette pièce comme étant en cours de suppression
    setDeleting(id);
    // Appelle la fonction API pour effectuer la suppression
    return deleteRoom(id, setDeleting);
  };

  // Affichage d'un indicateur de chargement pendant la récupération des données
  if (loading) {
    return <div>Loading...</div>;
  }

  // Affichage d'un message d'erreur si la récupération a échoué
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Rendu de la liste des pièces
  return (
    <Card className="p-2 w-2/5">
      {/* Parcours du tableau des pièces pour les afficher */}
      {rooms.map((room: Room) => (
        <Card key={room.id} className="flex justify-between items-center">
          <div className="flex items-center w-full">
            {/* Nom de la pièce */}
            {room.name}
            
            {/* Modale pour éditer la pièce */}
            <BasicModal
              openLabel={<DriveFileRenameOutlineIcon />}
              sx={{
                backgroundColor: theme.colorSchemes.dark.palette.primary[500],
              }}
              modalTitle="Edit room"
              modalLabel="Change room details"
            >
              <EditRoomForm roomId={room.id} />
            </BasicModal>
            
            {/* Bouton pour supprimer la pièce */}
            <Button
              onClick={() => handleDelete(room.id)}
              sx={{
                backgroundColor: theme.colorSchemes.dark.palette.danger[500],
              }}
              className="ml-2"
              disabled={deleting === room.id} // Désactivé pendant la suppression
            >
              {/* Affichage dynamique en fonction de l'état de suppression */}
              {deleting === room.id ? "Suppression..." : <DeleteOutlineIcon />}
            </Button>
          </div>
        </Card>
      ))}
    </Card>
  );
};
