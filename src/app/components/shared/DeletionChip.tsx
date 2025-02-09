import * as React from "react";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import DeleteForever from "@mui/icons-material/DeleteForever";
import { useState } from "react";

interface DeletionChipProps {
  tagId: number;
}

export const DeletionChip: React.FC<DeletionChipProps> = ({ tagId }) => {
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const res = await fetch("/api/tags/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Chip
        variant="outlined"
        color="danger"
        onClick={() => handleDelete(tagId)}
        sx={{ justifyContent: "center" }}
      >
        <DeleteForever sx={{ height: 22, width: 22, mb: 0.2 }} />
      </Chip>
    </Box>
  );
};
