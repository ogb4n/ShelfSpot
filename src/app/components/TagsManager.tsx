import React from "react";
import { Box } from "@mui/joy";
import { BasicModal } from "./shared/BasicModal";

export const TagsManager: React.FC = () => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "background.level1",
        boxShadow: "md",
        display: "flex",
        flexDirection: "row",
        gap: 2,
      }}
    >
      <BasicModal
        openLabel="see tags"
        modalLabel="you tags list"
        modalTitle="Tags pannel"
      >
        oui
      </BasicModal>
      <BasicModal
        openLabel="add tags"
        modalLabel="add tags"
        modalTitle="Tags pannel"
        color="success"
      >
        oui
      </BasicModal>
    </Box>
  );
};
