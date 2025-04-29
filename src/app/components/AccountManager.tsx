"use client";
/**
 * Module de gestion du compte utilisateur
 * Ce composant permet aux utilisateurs de visualiser et modifier leurs informations de profil
 */
import React, { useState } from "react";
import { useSession } from "next-auth/react"; // Hook pour accéder à la session utilisateur
import { ChangePassword } from "./ChangePassword"; // Composant pour modifier le mot de passe
import Loading from "./shared/Loading"; // Composant d'indicateur de chargement

/**
 * Interface définissant les propriétés du composant AccountManager
 * @property {object} user - L'objet contenant les informations de l'utilisateur
 * @property {string} user.name - Le nom d'utilisateur (optionnel)
 * @property {string} user.email - L'adresse email de l'utilisateur (optionnel)
 * @property {string} user.image - L'URL de l'image de profil (optionnel)
 */
interface AccountManagerProps {
  user:
  | {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
  | undefined;
}

/**
 * Composant de gestion de compte utilisateur
 * Permet d'afficher et de modifier les informations du profil utilisateur
 *
 * @param {AccountManagerProps} props - Les propriétés du composant
 * @returns {JSX.Element} - Le composant rendu
 */
export const AccountManager = ({ user }: AccountManagerProps) => {
  // Récupération des données de session et de la fonction de mise à jour
  const { data: session, update } = useSession();

  // États locaux pour gérer l'interface et les données
  const [editing, setEditing] = useState(false); // Mode édition activé/désactivé
  const [name, setName] = useState(user?.name ?? ""); // Nom d'utilisateur
  const [email, setEmail] = useState(user?.email ?? ""); // Email de l'utilisateur (lecture seule)
  const [loading, setLoading] = useState(false); // État de chargement lors des requêtes
  const [error, setError] = useState<string | null>(null); // Message d'erreur éventuel

  // ID de l'utilisateur extrait de la session pour les requêtes API
  const userId = session?.user?.id;

  /**
   * Gère la sauvegarde des modifications du profil
   * Envoie une requête à l'API pour mettre à jour le nom d'utilisateur
   * Met également à jour la session côté client
   */
  const handleSave = async () => {
    setLoading(true); // Active l'indicateur de chargement
    setError(null); // Réinitialise les messages d'erreur

    try {
      // Appel à l'API pour mettre à jour le nom d'utilisateur
      const response = await fetch("/api/user/edit/name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, userId }),
      });

      // Vérification de la réponse HTTP
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Traitement de la réponse
      const data = await response.json();
      console.log("Profil sauvegardé", data);

      // Mise à jour de la session côté client pour refléter les changements
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
        },
      });

      // Désactivation du mode édition
      setEditing(false);
    } catch (err) {
      // Gestion des erreurs
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      console.error("Error updating profile:", err);
    } finally {
      // Désactivation de l'indicateur de chargement dans tous les cas
      setLoading(false);
    }
  };

  /**
   * Annule les modifications et réinitialise le formulaire
   * Rétablit les valeurs d'origine et quitte le mode édition
   */
  const handleCancel = () => {
    setName(user?.name ?? ""); // Restaure le nom original
    setEmail(user?.email ?? ""); // Restaure l'email original
    setEditing(false); // Désactive le mode édition
    setError(null); // Efface les messages d'erreur
  };

  // Rendu du composant
  return (
    <div className="w-full">
      {/* Titre du composant */}
      <h2 className="text-2xl font-bold mb-4 text-white">
        Your profile
      </h2>

      {/* Affichage des erreurs si présentes */}
      {error && (
        <div className="p-3 mb-4 bg-red-900/30 border border-red-500 text-red-300 rounded-sm">
          {error}
        </div>
      )}

      {/* Interface conditionnelle basée sur le mode d'édition */}
      {editing ? (
        <>
          {/* Formulaire d'édition */}
          <input
            className="p-2 mb-4 w-full bg-[#3a3a3a] text-white border border-gray-600 rounded-sm"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {/* L'email est affiché mais non modifiable */}
          <p className="mb-4 text-gray-300">
            Email: {email || "Not provided"}
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Bouton de sauvegarde avec indicateur de chargement */}
            <button
              className="px-4 py-2 bg-[#335C67] text-white rounded hover:bg-[#274956] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              onClick={handleSave}
              disabled={loading}
            >
              {loading && <span className="w-4 h-4">
                <svg className="animate-spin w-full h-full" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="60 30" />
                </svg>
              </span>}
              {loading ? "Saving..." : "Save"}
            </button>

            {/* Composant de changement de mot de passe */}
            <ChangePassword />

            {/* Bouton d'annulation */}
            <button
              className="px-4 py-2 bg-transparent border border-gray-400 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Mode affichage (non-édition) */}
          <p className="mb-3 text-gray-300">Username: {name || "Unknown"}</p>
          <p className="mb-3 text-gray-300">
            Email: {email || "Not provided"}
          </p>

          {/* Bouton pour activer le mode édition */}
          <button
            className="px-4 py-2 bg-[#335C67]/20 border border-[#335C67] text-[#4a9eb2] rounded hover:bg-[#335C67]/30 transition-colors mt-2"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
};
