"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/joy";
import { BasicModal } from "./shared/BasicModal";
import { TagsList } from "./TagsList";
import { TagAddForm } from "./forms/TagAddForm";
import useGetTags from "../hooks/useGetTags";
import { Tag as ITag } from "../utils/types";

export const TagsManager: React.FC = () => {
  const { tags: initialTags, loading, error } = useGetTags();
  const [tags, setTags] = useState<ITag[]>([]);

  useEffect(() => {
    if (initialTags) {
      setTags(initialTags);
    }
  }, [initialTags]);

  const handleAddTag = (newTag: ITag) => {
    setTags((prevTags) => [...prevTags, newTag]);
  };

  const handleDeleteTag = (tagId: number) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));
  };

  return (
    <Box>
      <Typography typography={"h4"}>Your tags</Typography>
      <TagsList tags={tags} onDelete={handleDeleteTag} />
      <BasicModal
        openLabel="add tags"
        modalLabel="add tags"
        modalTitle="Tags pannel"
      >
        <TagAddForm onAddTag={handleAddTag} />
      </BasicModal>
    </Box>
  );
};
