"use client";
/**
 * Module de changement de mot de passe utilisateur
 * Ce composant permet aux utilisateurs de modifier leur mot de passe
 */
import React, { useState } from "react";
import { Box, Typography, Button, Input, Alert } from "@mui/joy"; // Composants UI de Joy UI

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
    <Box sx={{ mt: 4 }}>
      {/* Titre de la section */}
      <Typography component="h2" mb={2}>
        Change Password
      </Typography>
      
      {/* Affichage conditionnel des messages d'erreur */}
      {error && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Affichage conditionnel du message de succès */}
      {success && (
        <Alert color="success" sx={{ mb: 2 }}>
          Mot de passe changé avec succès !
        </Alert>
      )}
      
      {/* Champ pour saisir le nouveau mot de passe */}
      <Input
        type="password"
        placeholder="Nouveau mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      {/* Champ pour confirmer le nouveau mot de passe */}
      <Input
        type="password"
        placeholder="Change your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      {/* Bouton de soumission du formulaire */}
      <Button variant="solid" color="primary" onClick={handleChangePassword}>
        Change your password
      </Button>
    </Box>
  );
};
