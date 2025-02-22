"use client";
import React, { useState } from "react";
import { Box, Typography, Button, Input, Alert } from "@mui/joy";

export const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = () => {
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError(null);
    // Ici, vous pouvez ajouter la logique pour envoyer le nouveau mot de passe via une API
    console.log("Nouveau mot de passe sauvegardé:", password);
    setSuccess(true);
    // Réinitialisation des champs après succès
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography component="h2" mb={2}>
        Change Password
      </Typography>
      {error && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" sx={{ mb: 2 }}>
          Mot de passe changé avec succès !
        </Alert>
      )}
      <Input
        type="password"
        placeholder="Nouveau mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Input
        type="password"
        placeholder="Confirmer le nouveau mot de passe"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="solid" color="primary" onClick={handleChangePassword}>
        Modifier le mot de passe
      </Button>
    </Box>
  );
};
