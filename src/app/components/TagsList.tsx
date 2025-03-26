"use client";
/**
 * Module de liste de tags (TagsList)
 *
 * Ce composant affiche la liste des tags disponibles dans l'application.
 * Il permet de visualiser les tags avec leurs icônes et offre une option
 * de suppression pour chaque tag via un composant DeletionChip.
 */
import * as React from "react";
import { List, Box, Typography } from "@mui/joy"; // Composants UI de base
import { Tag } from "./shared/Tag"; // Composant d'affichage d'un tag
import { Icon } from "./shared/Icon"; // Composant d'affichage d'icônes
import { DeletionChip } from "./shared/DeletionChip"; // Composant pour supprimer un tag
import { Tag as ITag } from "../types"; // Interface définissant la structure d'un tag
import { type IconName } from "lucide-react/dynamic"; // Type pour les noms d'icônes
import theme from "../assets/theme"; // Thème de l'application
/**
 * Interface définissant les propriétés du composant TagsList
 *
 * @property {ITag[]} tags - Tableau des tags à afficher
 * @property {Function} onDelete - Fonction de rappel appelée lors de la suppression d'un tag
 */
interface TagsListProps {
  tags: ITag[];
  onDelete: (id: number) => void;
}

/**
 * Composant d'affichage de la liste des tags
 *
 * Affiche tous les tags disponibles avec leurs icônes et options de suppression.
 * Si aucun tag n'est disponible, affiche un message approprié.
 *
 * @param {TagsListProps} props - Les propriétés du composant
 * @returns {JSX.Element} Le composant rendu
 */
export const TagsList: React.FC<TagsListProps> = ({ tags, onDelete }) => {
  // Affichage d'un message si aucun tag n'est disponible
  if (!tags.length) {
    return (
      <Typography
        sx={{
          color: theme.colorSchemes.dark.palette.disabled[500],
          margin: 2,
        }}
      >
        No tags available
      </Typography>
    );
  }

  // Affichage de la liste des tags
  return (
    <List sx={{ maxWidth: 300 }}>
      <Box alignItems={"center"}>
        {/* Parcours du tableau des tags pour les afficher */}
        {tags.map((tag) => (
          <Box key={tag.id} display={"flex"} gap={1} alignItems={"center"}>
            {/* Composant Tag avec son libellé et son icône */}
            <Tag
              label={tag.name}
              icon={
                <Icon name={tag.icon as IconName} color="green" size={16} />
              }
            />
            {/* Composant pour supprimer le tag */}
            <DeletionChip tagId={tag.id} onDelete={onDelete} />
          </Box>
        ))}
      </Box>
    </List>
  );
};
