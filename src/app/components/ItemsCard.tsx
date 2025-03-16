"use client";
/**
 * Module de carte d'articles (ItemsCard)
 * 
 * Ce composant affiche une carte résumant le nombre d'articles stockés dans l'inventaire.
 * Il permet également d'accéder rapidement au formulaire d'ajout d'un nouvel article.
 * La carte présente un compteur visuel et un indicateur de chargement.
 */
import * as React from "react";
import Card from "@mui/joy/Card"; // Composant de carte
import CardContent from "@mui/joy/CardContent"; // Contenu de la carte
import CardActions from "@mui/joy/CardActions"; // Zone d'actions de la carte
import CircularProgress from "@mui/joy/CircularProgress"; // Indicateur circulaire
import Typography from "@mui/joy/Typography"; // Composant de texte stylisé
import { BasicModal } from "./shared/BasicModal"; // Composant de fenêtre modale
import { AddItemForm } from "./forms/AddItemForm"; // Formulaire d'ajout d'article
import { InventoryIcon } from "@/app/utils/icons"; // Icône d'inventaire
import theme from "../theme"; // Thème de l'application

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
    <Card
      variant="solid"
      sx={{ backgroundColor: theme.colorSchemes.dark.palette.primary[500] }}
      invertedColors
    >
      {/* Zone principale de contenu avec l'indicateur et les informations */}
      <CardContent orientation="horizontal">
        {/* Indicateur circulaire avec l'icône d'inventaire */}
        <CircularProgress size="lg" determinate value={itemsCount ?? 0}>
          <InventoryIcon />
        </CircularProgress>
        
        {/* Informations textuelles */}
        <CardContent>
          {/* Titre de la carte */}
          <Typography level="body-md" fontWeight="bold">
            Items stored
          </Typography>
          
          {/* Nombre d'articles ou indicateur de chargement */}
          <Typography level="h2">
            {loading ? "Loading..." : itemsCount}
          </Typography>
        </CardContent>
      </CardContent>
      
      {/* Zone d'actions avec le bouton d'ajout d'article */}
      <CardActions>
        {/* Modale pour ajouter un nouvel article */}
        <BasicModal
          openLabel="Add item"
          modalTitle="Add a new item"
          modalLabel="You can add a new item to your inventory by filling out the form below."
        >
          <AddItemForm />
        </BasicModal>
      </CardActions>
    </Card>
  );
};
