"use client";
/**
 * Module de gestion du compte utilisateur
 * Ce composant permet aux utilisateurs de visualiser et modifier leurs informations de profil
 */
import React, { useState } from "react";
import { Box, Typography, Button, Input, Alert } from "@mui/joy"; // Composants UI de la bibliothèque Joy UI de Material
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
    <Box>
      {/* Titre du composant */}
      <Typography typography={"h4"} mb={2} sx={{ font: "bold" }}>
        Your profile
      </Typography>

      {/* Affichage des erreurs si présentes */}
      {error && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Interface conditionnelle basée sur le mode d'édition */}
      {editing ? (
        <>
          {/* Formulaire d'édition */}
          <Input
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          {/* L'email est affiché mais non modifiable */}
          <Typography sx={{ mb: 2 }}>
            Email: {email || "Not provided"}
          </Typography>
          <Box>
            {/* Bouton de sauvegarde avec indicateur de chargement */}
            <Button
              variant="solid"
              color="primary"
              onClick={handleSave}
              sx={{ mr: 1 }}
              disabled={loading}
              startDecorator={Loading ? <Loading /> : null}
            >
              {loading ? "Saving..." : "Save"}
            </Button>

            {/* Composant de changement de mot de passe */}
            <ChangePassword />

            {/* Bouton d'annulation */}
            <Button
              variant="outlined"
              color="neutral"
              onClick={handleCancel}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </>
      ) : (
        <>
          {/* Mode affichage (non-édition) */}
          <Typography sx={{ mb: 2 }}>Username: {name || "Unknown"}</Typography>
          <Typography sx={{ mb: 2 }}>
            Email: {email || "Not provided"}
          </Typography>

          {/* Bouton pour activer le mode édition */}
          <Button
            variant="soft"
            color="primary"
            onClick={() => setEditing(true)}
            sx={{ mt: 2 }}
          >
            Edit Profile
          </Button>
        </>
      )}
    </Box>
  );
};
