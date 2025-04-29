/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Module de puce de suppression (DeletionChip)
 *
 * Ce composant fournit un bouton stylisé en forme de puce (chip) pour les opérations de suppression.
 * Il est principalement utilisé pour supprimer des tags, mais peut être réutilisé pour d'autres
 * éléments nécessitant une suppression via une interface visuelle compacte.
 */
import * as React from "react";
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
    <div className="flex items-center">
      {/* Button styled as a chip for delete action */}
      <button
        onClick={() => handleDelete(tagId)}
        className="flex items-center justify-center p-1 border border-red-400 text-red-400 rounded-full hover:bg-red-400/10 transition-colors"
        disabled={deleting === tagId}
        aria-label="Delete"
      >
        <DeleteForever className="h-5 w-5" />
      </button>
    </div>
  );
};
