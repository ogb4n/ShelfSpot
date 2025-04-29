"use client";
/**
 * Module de carte d'articles (ItemsCard)
 *
 * Ce composant affiche une carte résumant le nombre d'articles stockés dans l'inventaire.
 * Il permet également d'accéder rapidement au formulaire d'ajout d'un nouvel article.
 * La carte présente un compteur visuel et un indicateur de chargement.
 */
import * as React from "react";
import { BasicModal } from "./shared/BasicModal"; // Composant de fenêtre modale
import { AddItemForm } from "./forms/AddItemForm"; // Formulaire d'ajout d'article
import { InventoryIcon } from "@/app/assets/icons"; // Icône d'inventaire

/**
 * Composant de carte affichant le nombre d'articles dans l'inventaire
 *
 * Affiche une carte avec un indicateur circulaire du nombre d'articles
 * et un bouton pour ajouter un nouvel article via une fenêtre modale.
 *
 * @returns {JSX.Element} Le composant rendu
 */
export const ItemsCard: React.FC = () => {
  // État pour stocker le nombre d'articles dans l'inventaire
  const [itemsCount, setItemsCount] = React.useState<number | null>(null);
  // État pour gérer l'affichage du chargement
  const [loading, setLoading] = React.useState<boolean>(true);

  /**
   * Effet pour récupérer le nombre d'articles au chargement du composant
   * Fait une requête à l'API pour obtenir la liste des articles et compte leur nombre
   */
  React.useEffect(() => {
    /**
     * Fonction asynchrone pour récupérer le nombre d'articles
     * Gère les erreurs et met à jour l'état de chargement
     */
    const fetchItemsCount = async () => {
      try {
        // Appel à l'API pour récupérer tous les articles
        const response = await fetch("/api/items");
        const items = await response.json();
        // Mise à jour du compteur d'articles
        setItemsCount(items.length);
      } catch (error) {
        // Gestion des erreurs
        console.error("Failed to fetch items count:", error);
        setItemsCount(0);
      } finally {
        // Fin du chargement dans tous les cas
        setLoading(false);
      }
    };

    // Exécution de la fonction de récupération
    fetchItemsCount();
  }, []); // Dépendances vides, exécuté uniquement au montage du composant

  return (
    <div className="bg-[#335C67] text-white rounded-md overflow-hidden shadow-md">
      {/* Zone principale de contenu avec l'indicateur et les informations */}
      <div className="p-4 flex flex-row items-center">
        {/* Indicateur circulaire avec l'icône d'inventaire */}
        <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-white/30">
          <div className="absolute">
            <InventoryIcon />
          </div>
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={`${(itemsCount ?? 0) * 2.83} 283`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
              className="opacity-70"
            />
          </svg>
        </div>

        {/* Informations textuelles */}
        <div className="ml-4">
          {/* Titre de la carte */}
          <p className="font-bold text-sm">
            Items stored
          </p>

          {/* Nombre d'articles ou indicateur de chargement */}
          <h2 className="text-2xl font-bold">
            {loading ? "Loading..." : itemsCount}
          </h2>
        </div>
      </div>

      {/* Zone d'actions avec le bouton d'ajout d'article */}
      <div className="px-4 py-2 bg-[#274956]/50 border-t border-white/10">
        {/* Modale pour ajouter un nouvel article */}
        <BasicModal
          openLabel="Add item"
          modalTitle="Add a new item"
          modalLabel="You can add a new item to your inventory by filling out the form below."
        >
          <AddItemForm />
        </BasicModal>
      </div>
    </div>
  );
};
