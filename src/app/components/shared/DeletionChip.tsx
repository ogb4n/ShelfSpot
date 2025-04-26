/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Module de puce de suppression (DeletionChip)
 *
 * Ce composant fournit un bouton stylisé en forme de puce (chip) pour les opérations de suppression.
 * Il est principalement utilisé pour supprimer des tags, mais peut être réutilisé pour d'autres
 * éléments nécessitant une suppression via une interface visuelle compacte.
 */
import * as React from "react";
import Box from "@mui/joy/Box"; // Conteneur flexible
import Chip from "@mui/joy/Chip"; // Composant de puce interactive
import { useState } from "react"; // Hook pour la gestion d'état
import { DeleteForever } from "@/app/assets/icons"; // Icône de suppression
import deleteTag from "@/app/components/requests/deleteTag"; // Fonction API pour supprimer un tag

/**
 * Interface définissant les propriétés du composant DeletionChip
 *
 * @property {number} tagId - L'identifiant du tag à supprimer
 * @property {Function} onDelete - Fonction de rappel appelée après une suppression réussie
 */
interface DeletionChipProps {
  tagId: number;
  onDelete: (id: number) => void;
}

/**
 * Composant de puce pour la suppression d'éléments
 * Offre une interface visuelle compacte pour déclencher la suppression d'un tag
 *
 * @param {DeletionChipProps} props - Les propriétés du composant
 * @returns {JSX.Element} - Le composant rendu
 */
export const DeletionChip: React.FC<DeletionChipProps> = ({
  tagId,
  onDelete,
}) => {
  // État pour suivre l'ID de l'élément en cours de suppression (pour gérer l'état de chargement)
  const [deleting, setDeleting] = useState<number | null>(null);

  /**
   * Gère l'action de suppression d'un tag
   * Appelle l'API de suppression et met à jour l'interface en conséquence
   *
   * @param {number} id - L'identifiant du tag à supprimer
   */
  const handleDelete = async (id: number) => {
    // Marque l'élément comme étant en cours de suppression
    setDeleting(id);
    // Appelle la fonction API pour effectuer la suppression
    // Cette fonction gère également les callbacks et la réinitialisation de l'état
    await deleteTag(id, setDeleting, onDelete);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {/* Puce cliquable stylisée en rouge pour indiquer une action destructive */}
      <Chip
        variant="outlined"
        onClick={() => handleDelete(tagId)}
        sx={{
          justifyContent: "center",
        }}
      >
        {/* Icône de suppression définitive */}
        <DeleteForever sx={{ height: 22, width: 22, mb: 0.2 }} />
      </Chip>
    </Box>
  );
};
