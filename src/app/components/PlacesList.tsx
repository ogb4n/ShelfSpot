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
import { DeleteOutlineIcon } from "@/app/utils/icons"; // Icône de suppression
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"; // Icône d'édition
import { Place } from "@/app/utils/types"; // Interface définissant la structure d'un emplacement
import { BasicModal } from "@/app/components/shared/BasicModal"; // Composant de fenêtre modale
import { EditPlaceForm } from "@/app/components/forms/EditPlaceForm"; // Formulaire d'édition d'emplacement
import deletePlace from "./requests/deletePlace"; // Fonction API pour supprimer un emplacement
import theme from "../theme"; // Thème de l'application

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

  // Affichage d'un indicateur de chargement pendant la récupération des données
  if (loading) {
    return <div>Loading...</div>;
  }

  // Affichage d'un message d'erreur si la récupération a échoué
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Rendu de la liste des emplacements
  return (
    <Card className="p-2 w-2/5">
      {/* Parcours du tableau des emplacements pour les afficher */}
      {places.map((place: Place) => (
        <Card key={place.id} className="flex justify-between items-center">
          <div className="flex items-center w-full">
            {/* Nom de l'emplacement */}
            {place.name}

            {/* Modale pour éditer l'emplacement */}
            <BasicModal
              openLabel={<DriveFileRenameOutlineIcon />}
              modalTitle="Edit place"
              modalLabel="Change place details"
              sx={{
                backgroundColor: theme.colorSchemes.dark.palette.secondary[500],
              }}
            >
              <EditPlaceForm placeId={place.id} />
            </BasicModal>

            {/* Bouton pour supprimer l'emplacement */}
            <Button
              onClick={() => deletePlace(place.id, setDeleting)}
              sx={{
                backgroundColor: theme.colorSchemes.dark.palette.danger[500],
              }}
              className="ml-2"
              disabled={deleting === place.id} // Désactivé pendant la suppression
            >
              {/* Affichage dynamique en fonction de l'état de suppression */}
              {deleting === place.id ? "Suppression..." : <DeleteOutlineIcon />}
            </Button>
          </div>
        </Card>
      ))}
    </Card>
  );
};
