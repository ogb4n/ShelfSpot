"use client";
/**
 * Module de panneau d'administration (AdminPanel)
 * 
 * Ce composant affiche un panneau d'administration réservé aux utilisateurs
 * ayant des droits d'administrateur. Le composant vérifie les droits de l'utilisateur
 * via la session et n'affiche son contenu que pour les administrateurs.
 */
import React from "react";
import { Box, Typography } from "@mui/joy"; // Composants UI de base
import { useSession } from "next-auth/react"; // Hook pour accéder à la session utilisateur

/**
 * Composant de panneau d'administration
 * 
 * Vérifie si l'utilisateur connecté a des droits d'administrateur et
 * affiche le panneau d'administration uniquement dans ce cas.
 * 
 * @returns {JSX.Element | null} Le panneau d'administration ou null
 */
export const AdminPanel = () => {
  // Récupération des données de session de l'utilisateur
  const { data } = useSession();
  console.log(data);
  
  // Vérification des droits d'administrateur
  if (data?.user?.admin) {
    return (
      <Box>
        {/* Titre du panneau d'administration */}
        <Typography>Admin Panel</Typography>
      </Box>
    );
  }
  
  // Ne rien afficher si l'utilisateur n'est pas administrateur
  return null;
};
