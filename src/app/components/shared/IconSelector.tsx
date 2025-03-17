"use client";
/**
 * Module de sélecteur d'icônes (IconSelector)
 * 
 * Ce composant permet à l'utilisateur de choisir une icône parmi une liste prédéfinie.
 * Il est utilisé dans différents formulaires où l'utilisateur peut associer une icône
 * à un élément (catégorie, tag, etc.).
 */
import React from "react";
import { availableIcons } from "@/app/utils/icons"; // Liste des icônes disponibles
import { type IconName } from "lucide-react/dynamic"; // Type pour les noms d'icônes

/**
 * Interface définissant les propriétés du composant IconSelector
 * 
 * @property {IconName} selectedIcon - Le nom de l'icône actuellement sélectionnée
 * @property {Function} onSelect - Fonction de rappel appelée lorsqu'une nouvelle icône est sélectionnée
 */
interface IconSelectorProps {
  selectedIcon: IconName;
  onSelect: (iconName: IconName) => void;
}

/**
 * Composant de sélection d'icône
 * Affiche un menu déroulant permettant à l'utilisateur de choisir une icône
 * 
 * @param {IconSelectorProps} props - Les propriétés du composant
 * @returns {JSX.Element} - Le composant rendu
 */
export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onSelect,
}) => {
  return (
    <div>
      {/* Étiquette pour le sélecteur */}
      <label htmlFor="icon-selector" className="font-semibold">
        Icon
      </label>
      
      {/* Menu déroulant de sélection d'icône */}
      <select
        id="icon-selector"
        value={selectedIcon}
        onChange={(e) => onSelect(e.target.value as IconName)} // Conversion du type et appel du callback
        className="w-full border-gray-300 rounded-sm p-2"
      >
        {/* Génération dynamique des options à partir de la liste des icônes disponibles */}
        {availableIcons.map((icon) => (
          <option key={icon} value={icon}>
            {icon}
          </option>
        ))}
      </select>
    </div>
  );
};
