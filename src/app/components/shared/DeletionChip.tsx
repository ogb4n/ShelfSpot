import * as React from "react";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import DeleteForever from "@mui/icons-material/DeleteForever";

export const DeletionChip = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Chip
        variant="outlined"
        color="danger"
        onClick={() => alert("You clicked the chip!")}
        sx={{ justifyContent: "center" }}
      >
        <DeleteForever sx={{ height: 22, width: 22, mb: 0.2 }} />
      </Chip>
    </Box>
  );
};
