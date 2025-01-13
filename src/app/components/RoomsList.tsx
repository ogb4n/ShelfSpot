"use client";

import useGetRooms from "@/app/hooks/useGetRooms";
import Card from "@mui/joy/Card";
import Button from "@mui/joy/Button";
import React from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { Room } from "../utils/types";

export const RoomsList: React.FC = () => {
  const { rooms, loading, error } = useGetRooms();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className="p-2 w-2/5">
      {rooms.map((room: Room) => (
        <Card key={room.id} className="flex justify-between items-center">
          <div className="flex items-center w-full">
            {room.name}
            <Button color="primary" className="ml-2">
              <DriveFileRenameOutlineIcon />
            </Button>
            <Button color="danger" className="ml-2">
              <DeleteOutlineIcon />
            </Button>
          </div>
        </Card>
      ))}
    </Card>
  );
};
