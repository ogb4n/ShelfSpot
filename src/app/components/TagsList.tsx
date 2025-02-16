"use client";
import * as React from "react";
import { List, Box, Typography } from "@mui/joy";
import { Tag } from "./shared/Tag";
import { Icon } from "./shared/Icon";
import { DeletionChip } from "./shared/DeletionChip";
import { Tag as ITag } from "../utils/types";
import { type IconName } from "lucide-react/dynamic";
import theme from "../theme";

interface TagsListProps {
  tags: ITag[];
  onDelete: (id: number) => void;
}

export const TagsList: React.FC<TagsListProps> = ({ tags, onDelete }) => {
  if (!tags.length) {
    return (
      <Typography
        sx={{
          color: theme.colorSchemes.dark.palette.disabled[500],
          margin: 2,
        }}
      >
        No tags available
      </Typography>
    );
  }

  return (
    <List sx={{ maxWidth: 300 }}>
      <Box alignItems={"center"}>
        {tags.map((tag) => (
          <Box key={tag.id} display={"flex"} gap={1} alignItems={"center"}>
            <Tag
              label={tag.name}
              icon={
                <Icon name={tag.icon as IconName} color="green" size={16} />
              }
            />
            <DeletionChip tagId={tag.id} onDelete={onDelete} />
          </Box>
        ))}
      </Box>
    </List>
  );
};
