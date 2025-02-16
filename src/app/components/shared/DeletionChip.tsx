import * as React from "react";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import { useState } from "react";
import { DeleteForever } from "@/app/utils/icons";
import theme from "@/app/theme";
import deleteTag from "@/app/api/tags/delete/deleteTag";
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
    await deleteTag(id, setDeleting, onDelete);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Chip
        variant="outlined"
        onClick={() => handleDelete(tagId)}
        sx={{
          color: theme.colorSchemes.dark.palette.danger[500],
          justifyContent: "center",
        }}
      >
        <DeleteForever sx={{ height: 22, width: 22, mb: 0.2 }} />
      </Chip>
    </Box>
  );
};
