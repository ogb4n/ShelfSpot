"use client";
/**
 * Module de liste des pièces (RoomsList)
 *
 * Ce composant affiche la liste des pièces disponibles dans l'application.
 * Il permet de visualiser, modifier et supprimer des pièces.
 * Chaque pièce est affichée dans une carte avec des boutons d'action.
 */
import useGetRooms from "@/app/hooks/useGetRooms";
import Card from "@mui/joy/Card";
import Button from "@mui/joy/Button";
import React, { useState } from "react";
import { DeleteOutlineIcon } from "../assets/icons";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { Room } from "../types";
import { BasicModal } from "./shared/BasicModal";
import { EditRoomForm } from "./forms/EditRoomForm";
import theme from "../assets/theme";
import deleteRoom from "./requests/deleteRoom";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import Loading from "./shared/Loading";

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

  const handleDelete = async (id: number) => {
    // Marque cette pièce comme étant en cours de suppression
    setDeleting(id);
    // Appelle la fonction API pour effectuer la suppression
    return deleteRoom(id, setDeleting);
  };

  // Affichage d'un indicateur de chargement pendant la récupération des données
  if (loading) {
    return <Loading />;
  }

  // Affichage d'un message d'erreur si la récupération a échoué
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Rendu de la liste des pièces
  return (
    <Card className="p-4 w-2/5" variant="outlined">
      <Typography typography="h5" className="mb-3">
        Rooms
      </Typography>
      <List>
        {rooms.map((room: Room, index: number) => (
          <React.Fragment key={room.id}>
            <ListItem
              className="py-3"
              endAction={
                <Box className="flex gap-2">
                  {/* Modale pour éditer la pièce */}
                  <BasicModal
                    openLabel={<DriveFileRenameOutlineIcon />}
                    sx={{
                      backgroundColor:
                        theme.colorSchemes.dark.palette.primary[500],
                    }}
                    modalTitle="Edit room"
                    modalLabel="Change room details"
                  >
                    <EditRoomForm roomId={room.id} />
                  </BasicModal>

                  {/* Bouton pour supprimer la pièce */}
                  <Button
                    onClick={() => handleDelete(room.id)}
                    variant="soft"
                    color="danger"
                    size="sm"
                    disabled={deleting === room.id}
                  >
                    {deleting === room.id ? (
                      "Suppression..."
                    ) : (
                      <DeleteOutlineIcon />
                    )}
                  </Button>
                </Box>
              }
            >
              <ListItemContent>
                <Typography>{room.name}</Typography>
              </ListItemContent>
            </ListItem>
            {index < rooms.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {rooms.length === 0 && (
          <Typography
            level="body-sm"
            className="text-center py-4 text-gray-500"
          >
            Aucune pièce disponible
          </Typography>
        )}
      </List>
    </Card>
  );
};
