import React from "react";
import { Box, Typography } from "@mui/joy";
import { BasicModal } from "./shared/BasicModal";
import { TagsList } from "./TagsList";
import { TagAddForm } from "./forms/TagAddForm";

export const TagsManager: React.FC = () => {
  return (
    <Box>
      <Typography typography={"h4"}>Your tags</Typography>
      <TagsList />
      <BasicModal
        openLabel="add tags"
        modalLabel="add tags"
        modalTitle="Tags pannel"
        color="success"
      >
        <TagAddForm />
      </BasicModal>
    </Box>
  );
};
