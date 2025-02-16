"use client";
import useGetRooms from "@/app/hooks/useGetRooms";
import Card from "@mui/joy/Card";
import Button from "@mui/joy/Button";
import React, { useState } from "react";
import { DeleteOutlineIcon } from "../utils/icons";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { Room } from "../utils/types";
import { BasicModal } from "./shared/BasicModal";
import { EditRoomForm } from "./forms/EditRoomForm";
import theme from "../theme";
import deleteRoom from "../api/room/delete/deleteRoom";

export const RoomsList: React.FC = () => {
  const { rooms, loading, error } = useGetRooms();
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    return deleteRoom(id, setDeleting);
  };

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
            <BasicModal
              openLabel={<DriveFileRenameOutlineIcon />}
              sx={{
                backgroundColor: theme.colorSchemes.dark.palette.primary[500],
              }}
              modalTitle="Edit room"
              modalLabel="Change room details"
            >
              <EditRoomForm roomId={room.id} />
            </BasicModal>
            <Button
              onClick={() => handleDelete(room.id)}
              sx={{
                backgroundColor: theme.colorSchemes.dark.palette.danger[500],
              }}
              className="ml-2"
              disabled={deleting === room.id}
            >
              {deleting === room.id ? "Suppression..." : <DeleteOutlineIcon />}
            </Button>
          </div>
        </Card>
      ))}
    </Card>
  );
};
