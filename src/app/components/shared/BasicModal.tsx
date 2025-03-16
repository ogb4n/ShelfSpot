"use client";
/**
 * Module de fenêtre modale basique (BasicModal)
 * 
 * Ce composant fournit une fenêtre modale réutilisable pour l'application.
 * Il permet d'afficher un contenu contextuel sans naviguer vers une nouvelle page.
 * La modale est utilisée pour diverses fonctionnalités comme les formulaires, les confirmations
 * ou l'affichage de détails supplémentaires.
 */

import * as React from "react";
import Button from "@mui/joy/Button"; // Bouton pour ouvrir la modale
import Modal from "@mui/joy/Modal"; // Composant de base pour la modale
import ModalClose from "@mui/joy/ModalClose"; // Bouton de fermeture de la modale
import Typography from "@mui/joy/Typography"; // Composant de texte stylisé
import Sheet from "@mui/joy/Sheet"; // Conteneur stylisé
import { SxProps } from "@mui/material"; // Type pour les propriétés de style

/**
 * Interface définissant les propriétés du composant BasicModal
 * 
 * @property {string | React.ReactNode} openLabel - Texte ou élément à afficher dans le bouton d'ouverture
 * @property {string} modalTitle - Titre de la modale
 * @property {SxProps} sx - Propriétés de style supplémentaires (optionnel)
 * @property {string} modalLabel - Sous-titre ou description de la modale
 * @property {React.ReactNode} icon - Icône à afficher dans le bouton d'ouverture (optionnel)
 * @property {React.ReactNode} children - Contenu à afficher dans la modale
 */
interface BasicModalProps {
  openLabel: string | React.ReactNode;
  modalTitle: string;
  sx?: SxProps;
  modalLabel: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Composant de modale basique réutilisable
 * Fournit une interface cohérente pour afficher des fenêtres modales dans l'application
 * 
 * @param {BasicModalProps} props - Les propriétés du composant
 * @returns {JSX.Element} - Le composant rendu
 */
export const BasicModal: React.FC<BasicModalProps> = ({
  openLabel,
  modalLabel,
  icon,
  modalTitle,
  sx,
  children,
}) => {
  // État pour contrôler l'ouverture/fermeture de la modale
  const [open, setOpen] = React.useState<boolean>(false);
  
  return (
    <React.Fragment>
      {/* Bouton déclencheur pour ouvrir la modale */}
      <Button variant="outlined" sx={sx} onClick={() => setOpen(true)}>
        {icon} {openLabel}
      </Button>
      
      {/* Composant modale avec gestion de l'état d'ouverture */}
      <Modal
        aria-labelledby="modal-title" // Pour l'accessibilité - associe le titre à la modale
        aria-describedby="modal-desc" // Pour l'accessibilité - associe la description à la modale
        open={open}
        onClose={() => setOpen(false)} // Ferme la modale quand l'utilisateur clique à l'extérieur
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }} // Centre la modale
      >
        {/* Contenu de la modale avec style */}
        <Sheet
          variant="outlined"
          sx={{ maxWidth: 500, borderRadius: "md", p: 3, boxShadow: "lg" }}
        >
          {/* Bouton de fermeture en haut à droite */}
          <ModalClose variant="plain" sx={{ m: 1 }} />
          
          {/* Titre de la modale */}
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor="inherit"
            sx={{ fontWeight: "lg", mb: 1 }}
          >
            {modalTitle}
          </Typography>
          
          {/* Sous-titre ou description de la modale */}
          <Typography
            id="modal-desc"
            level="body-md"
            fontWeight="bold"
            textColor="text.tertiary"
          >
            {modalLabel}
          </Typography>

          {/* Contenu principal de la modale (transmis via children) */}
          {children}
        </Sheet>
      </Modal>
    </React.Fragment>
  );
};
