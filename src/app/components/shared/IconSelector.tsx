"use client";
/**
 * Module de sélecteur d'icônes (IconSelector)
 *
 * Ce composant permet à l'utilisateur de choisir une icône parmi une liste prédéfinie.
 * Il est utilisé dans différents formulaires où l'utilisateur peut associer une icône
 * à un élément (catégorie, tag, etc.).
 */
import React, { useMemo } from "react";
import { availableIcons } from "@/app/assets/icons"; // Liste des icônes disponibles
import { LucideIcon, icons } from "lucide-react";
import { type IconName } from "lucide-react/dynamic"; // Type pour les noms d'icônes
import { Fragment } from "react";

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
  // Charger dynamiquement les icônes disponibles
  const iconComponents = useMemo(() => {
    return availableIcons.map((name) => {
      const LucideIcon = icons[name];
      return { name, icon: <LucideIcon size={20} /> };
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value as IconName);
  };

  return (
    <div className="relative">
      <select
        value={selectedIcon}
        onChange={handleChange}
        className="w-full bg-[#2a2a2a] text-white border-gray-600 rounded-sm p-2 pl-10 appearance-none"
        style={{ paddingLeft: "2.5rem" }}
      >
        {iconComponents.map(({ name, icon }) => (
          <option key={name} value={name} className="flex items-center">
            {name}
          </option>
        ))}
      </select>
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
        {icons[selectedIcon] && React.createElement(icons[selectedIcon], { size: 20, color: "#ffffff" })}
      </div>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  );
};
