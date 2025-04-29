"use client";
/**
 * Module de carte de gestion (ManageCard)
 *
 * Ce composant affiche une carte permettant à l'utilisateur d'accéder
 * à la page de gestion des espaces. Il sert de raccourci visuel et
 * encourageant pour accéder aux fonctionnalités d'organisation.
 */
import * as React from "react";
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
    <div className="bg-[#222] text-white rounded-md overflow-hidden shadow-md">
      {/* Contenu principal de la carte */}
      <div className="p-4">
        {/* Texte d'appel à l'action */}
        <p className="font-bold text-sm">
          Order your spaces
        </p>
      </div>

      {/* Zone de boutons d'action */}
      <div className="px-4 py-2 bg-[#333]/50 border-t border-white/10">
        {/* Bouton pour accéder à la page de gestion */}
        <button
          className="px-4 py-1 bg-transparent border border-white/50 text-white hover:bg-white/10 rounded transition-colors"
          onClick={() => redirect("/manage")}
        >
          Manage
        </button>
      </div>
    </div>
  );
};
