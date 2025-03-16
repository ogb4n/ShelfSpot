"use client";
/**
 * Module de gestionnaire de tags (TagsManager)
 * 
 * Ce composant permet de gérer les tags (étiquettes) de l'application.
 * Il offre une interface pour visualiser, ajouter et supprimer des tags.
 * Les tags peuvent être utilisés pour catégoriser et rechercher des éléments.
 */
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/joy"; // Composants UI de base
import { BasicModal } from "./shared/BasicModal"; // Composant de fenêtre modale
import { TagsList } from "./TagsList"; // Composant d'affichage de la liste des tags
import { TagAddForm } from "./forms/TagAddForm"; // Formulaire d'ajout de tag
import useGetTags from "../hooks/useGetTags"; // Hook personnalisé pour récupérer les tags
import { Tag as ITag } from "../utils/types"; // Interface définissant la structure d'un tag

/**
 * Composant de gestion des tags
 * 
 * Permet aux utilisateurs de visualiser, créer et supprimer des tags.
 * Utilise un état local synchronisé avec les données du serveur.
 * 
 * @returns {JSX.Element} Le composant rendu
 */
export const TagsManager: React.FC = () => {
  // Récupération des tags depuis l'API via le hook personnalisé
  const { tags: initialTags, loading, error } = useGetTags();
  // État local pour la liste des tags (permet des mises à jour immédiates de l'UI)
  const [tags, setTags] = useState<ITag[]>([]);

  /**
   * Effet pour synchroniser l'état local avec les données récupérées
   * Met à jour les tags lorsque les données sont chargées depuis l'API
   */
  useEffect(() => {
    if (initialTags) {
      setTags(initialTags);
    }
  }, [initialTags]);

  /**
   * Gère l'ajout d'un nouveau tag
   * Met à jour l'état local pour refléter immédiatement l'ajout
   * 
   * @param {ITag} newTag - Le nouveau tag à ajouter
   */
  const handleAddTag = (newTag: ITag) => {
    setTags((prevTags) => [...prevTags, newTag]);
  };

  /**
   * Gère la suppression d'un tag
   * Met à jour l'état local pour refléter immédiatement la suppression
   * 
   * @param {number} tagId - L'identifiant du tag à supprimer
   */
  const handleDeleteTag = (tagId: number) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));
  };

  return (
    <Box>
      {/* Titre de la section */}
      <Typography typography={"h4"}>Your tags</Typography>
      
      {/* Liste des tags avec gestion de la suppression */}
      <TagsList tags={tags} onDelete={handleDeleteTag} />
      
      {/* Modale pour ajouter un nouveau tag */}
      <BasicModal openLabel="add tags" modalLabel="" modalTitle="Tag addition">
        <TagAddForm onAddTag={handleAddTag} />
      </BasicModal>
    </Box>
  );
};
