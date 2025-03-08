"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Input,
  CircularProgress,
  Alert,
} from "@mui/joy";
import { useSession } from "next-auth/react";
import { ChangePassword } from "./ChangePassword";

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
  const { data: session, update } = useSession();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = session?.user?.id;

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/edit/name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, userId }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profil sauvegardé", data);

      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
        },
      });

      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      console.error("Error updating profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setEditing(false);
    setError(null);
  };

  return (
    <Box>
      <Typography typography={"h4"} mb={2} sx={{ font: "bold" }}>
        Your profile
      </Typography>
      {error && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {editing ? (
        <>
          <Input
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography sx={{ mb: 2 }}>
            Email: {email || "Not provided"}
          </Typography>
          <Box>
            <Button
              variant="solid"
              color="primary"
              onClick={handleSave}
              sx={{ mr: 1 }}
              disabled={isLoading}
              startDecorator={isLoading ? <CircularProgress size="sm" /> : null}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <ChangePassword />
            <Button
              variant="outlined"
              color="neutral"
              onClick={handleCancel}
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
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
