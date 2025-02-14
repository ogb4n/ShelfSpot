import * as React from "react";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import DeleteForever from "@mui/icons-material/DeleteForever";
import { useState } from "react";
import theme from "@/app/theme";
interface DeletionChipProps {
  tagId: number;
  onDelete: (id: number) => void;
}

export const DeletionChip: React.FC<DeletionChipProps> = ({
  tagId,
  onDelete,
}) => {
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

      onDelete(id); // Mettre à jour la liste des tags
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
        onClick={() => handleDelete(tagId)}
        sx={{
          backgroundColor: theme.colorSchemes.dark.palette.primary[500],
          justifyContent: "center",
        }}
      >
        <DeleteForever sx={{ height: 22, width: 22, mb: 0.2 }} />
      </Chip>
    </Box>
  );
};
