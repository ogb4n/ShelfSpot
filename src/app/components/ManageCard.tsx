"use client";
/**
 * Module de carte de gestion (ManageCard)
 *
 * Ce composant affiche une carte permettant à l'utilisateur d'accéder
 * à la page de gestion des espaces. Il sert de raccourci visuel et
 * encourageant pour accéder aux fonctionnalités d'organisation.
 */
import * as React from "react";
import Card from "@mui/joy/Card"; // Composant de carte
import CardContent from "@mui/joy/CardContent"; // Contenu de la carte
import CardActions from "@mui/joy/CardActions"; // Zone d'actions de la carte
import Typography from "@mui/joy/Typography"; // Composant de texte stylisé
import Button from "@mui/joy/Button"; // Bouton d'action
import { redirect } from "next/navigation"; // Fonction de redirection

/**
 * Composant de carte pour accéder à la gestion des espaces les plus utilisés
 *
 * Affiche une carte avec un appel à l'action pour accéder à la page
 * de gestion des espaces (pièces, emplacements, etc.).
 *
 * @returns {JSX.Element} Le composant rendu
 */
export const MostUsedPlacesCard: React.FC = () => {
  return (
    <Card
      variant="solid"
      invertedColors
    >
      {/* Contenu principal de la carte */}
      <CardContent orientation="horizontal">
        <CardContent>
          {/* Texte d'appel à l'action */}
          <Typography level="body-md" fontWeight="bold">
            Order your spaces
          </Typography>
        </CardContent>
      </CardContent>

      {/* Zone de boutons d'action */}
      <CardActions>
        {/* Bouton pour accéder à la page de gestion */}
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => redirect("/manage")}
        >
          Manage
        </Button>
      </CardActions>
    </Card>
  );
};
