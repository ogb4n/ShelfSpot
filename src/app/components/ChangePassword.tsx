"use client";
/**
 * Module de changement de mot de passe utilisateur
 * Ce composant permet aux utilisateurs de modifier leur mot de passe
 */
import React, { useState } from "react";

/**
 * Composant de changement de mot de passe
 * Fournit un formulaire permettant à l'utilisateur de modifier son mot de passe
 * avec une vérification de correspondance entre les deux champs
 * 
 * @returns {JSX.Element} - Le composant rendu
 */
export const ChangePassword = () => {
  // États pour gérer le formulaire et ses retours
  const [password, setPassword] = useState(""); // Nouveau mot de passe
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirmation du mot de passe
  const [error, setError] = useState<string | null>(null); // Message d'erreur éventuel
  const [success, setSuccess] = useState(false); // Indicateur de succès de l'opération

  /**
   * Gère la soumission du formulaire de changement de mot de passe
   * Vérifie la correspondance des mots de passe avant de procéder
   * Affiche un message de succès une fois l'opération terminée
   */
  const handleChangePassword = () => {
    // Vérification de la correspondance des deux champs de mot de passe
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    // Réinitialisation de l'erreur en cas de correspondance
    setError(null);

    // TODO: Implémentation de l'appel API pour changer le mot de passe
    console.log("Nouveau mot de passe sauvegardé:", password);

    // Mise à jour de l'état pour afficher le message de succès
    setSuccess(true);

    // Réinitialisation des champs du formulaire
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="mt-8">
      {/* Titre de la section */}
      <h2 className="text-xl font-medium mb-4 text-white">
        Change Password
      </h2>

      {/* Affichage conditionnel des messages d'erreur */}
      {error && (
        <div className="p-2 mb-4 bg-red-900/30 border border-red-500 text-red-300 rounded-sm">
          {error}
        </div>
      )}

      {/* Affichage conditionnel du message de succès */}
      {success && (
        <div className="p-2 mb-4 bg-green-900/30 border border-green-500 text-green-300 rounded-sm">
          Mot de passe changé avec succès !
        </div>
      )}

      {/* Champ pour saisir le nouveau mot de passe */}
      <input
        type="password"
        placeholder="Nouveau mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 mb-4 w-full bg-[#3a3a3a] text-white border border-gray-600 rounded-sm"
      />

      {/* Champ pour confirmer le nouveau mot de passe */}
      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="p-2 mb-4 w-full bg-[#3a3a3a] text-white border border-gray-600 rounded-sm"
      />

      {/* Bouton de soumission du formulaire */}
      <button
        className="px-4 py-2 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
        onClick={handleChangePassword}
      >
        Change your password
      </button>
    </div>
  );
};
