"use client";
/**
 * Module de liste des emplacements (PlacesList)
 *
 * Ce composant affiche la liste des emplacements disponibles dans l'application.
 * Il permet de visualiser, modifier et supprimer des emplacements.
 * Chaque emplacement est affiché dans une carte avec des boutons d'action.
 */
import useGetPlaces from "@/app/hooks/useGetPlaces"; // Hook personnalisé pour récupérer les emplacements
import Card from "@mui/joy/Card"; // Composant de carte
import Button from "@mui/joy/Button"; // Composant de bouton
import React, { useState } from "react";
import { DeleteOutlineIcon } from "@/app/assets/icons"; // Icône de suppression
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"; // Icône d'édition
import { Place } from "@/app/types"; // Interface définissant la structure d'un emplacement
import { BasicModal } from "@/app/components/shared/BasicModal"; // Composant de fenêtre modale
import { EditPlaceForm } from "@/app/components/forms/EditPlaceForm"; // Formulaire d'édition d'emplacement
import deletePlace from "./requests/deletePlace"; // Fonction API pour supprimer un emplacement
import theme from "../assets/theme"; // Thème de l'application
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import Loading from "./shared/Loading";

/**
 * Composant d'affichage de la liste des emplacements
 *
 * Affiche tous les emplacements disponibles avec des options pour les éditer
 * et les supprimer. Utilise le hook useGetPlaces pour récupérer les données.
 *
 * @returns {JSX.Element} Le composant rendu
 */
export const PlacesList: React.FC = () => {
  // Récupération des emplacements depuis l'API via le hook personnalisé
  const { places, loading, error } = useGetPlaces();
  // État pour suivre l'emplacement en cours de suppression
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    // Marque cet emplacement comme étant en cours de suppression
    setDeleting(id);
    // Appelle la fonction API pour effectuer la suppression
    return deletePlace(id, setDeleting);
  };

  // Affichage d'un indicateur de chargement pendant la récupération des données
  if (loading) {
    return <Loading />;
  }

  // Affichage d'un message d'erreur si la récupération a échoué
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Rendu de la liste des emplacements
  return (
    <Card className="p-4 w-2/5" variant="outlined">
      <Typography typography="h5" className="mb-3">
        Places
      </Typography>
      <List>
        {places.map((place: Place, index: number) => (
          <React.Fragment key={place.id}>
            <ListItem
              className="py-3"
              endAction={
                <Box className="flex gap-2">
                  {/* Modale pour éditer l'emplacement */}
                  <BasicModal
                    openLabel={<DriveFileRenameOutlineIcon />}
                    sx={{
                      backgroundColor:
                        theme.colorSchemes.dark.palette.primary[500],
                    }}
                    modalTitle="Edit place"
                    modalLabel="Change place details"
                  >
                    <EditPlaceForm placeId={place.id} />
                  </BasicModal>

                  {/* Bouton pour supprimer l'emplacement */}
                  <Button
                    onClick={() => handleDelete(place.id)}
                    variant="soft"
                    color="danger"
                    size="sm"
                    disabled={deleting === place.id}
                  >
                    {deleting === place.id ? (
                      "Suppression..."
                    ) : (
                      <DeleteOutlineIcon />
                    )}
                  </Button>
                </Box>
              }
            >
              <ListItemContent>
                <Typography>{place.name}</Typography>
              </ListItemContent>
            </ListItem>
            {index < places.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {places.length === 0 && (
          <Typography
            level="body-sm"
            className="text-center py-4 text-gray-500"
          >
            Aucun emplacement disponible
          </Typography>
        )}
      </List>
    </Card>
  );
};
