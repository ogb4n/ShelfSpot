"use client";
import * as React from "react";
import { List, Box } from "@mui/joy";
import { Tag } from "./shared/Tag";
import { Icon } from "./shared/Icon";
import { DeletionChip } from "./shared/DeletionChip";
import useGetTags from "../hooks/useGetTags";
import { Tag as ITag } from "../utils/types";
import { type IconName } from "lucide-react/dynamic";

export const TagsList = () => {
  const { tags, loading, error } = useGetTags();
  const [deleting, setDeleting] = React.useState<number | null>(null);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <List sx={{ maxWidth: 300 }}>
      <Box alignItems={"center"}>
        {tags.map((tag: ITag) => (
          <Box key={tag.id} display={"flex"} gap={1} alignItems={"center"}>
            <Tag
              key={tag.id}
              label={tag.name}
              icon={
                <Icon name={tag.icon as IconName} color="green" size={16} />
              }
            ></Tag>
            <DeletionChip tagId={tag.id} />
          </Box>
        ))}
      </Box>
    </List>
  );
};
