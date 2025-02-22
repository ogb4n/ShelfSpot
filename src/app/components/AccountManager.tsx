"use client";
import React, { useState } from "react";
import { Box, Typography, Button, Input } from "@mui/joy";

interface AccountManagerProps {
  user:
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      }
    | undefined;
}

export const AccountManager = ({ user }: AccountManagerProps) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const handleSave = () => {
    // Ici, vous pouvez ajouter la logique pour sauvegarder les modifications, par exemple via un appel API.
    console.log("Profil sauvegardé", { name, email });
    setEditing(false);
  };

  const handleCancel = () => {
    // Réinitialisation des valeurs avec celles du profil utilisateur initial
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setEditing(false);
  };

  return (
    <Box>
      <Typography component="h2" mb={2}>
        Your profile
      </Typography>
      {editing ? (
        <>
          <Input
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box>
            <Button
              variant="solid"
              color="primary"
              onClick={handleSave}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button variant="outlined" color="neutral" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Typography sx={{ mb: 2 }}>Username: {name || "Unknown"}</Typography>
          <Typography sx={{ mb: 2 }}>
            Email: {email || "Not provided"}
          </Typography>
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
