"use client";
import useGetPlaces from "@/app/hooks/useGetPlaces";
import Card from "@mui/joy/Card";
import Button from "@mui/joy/Button";
import React, { useState } from "react";
import { DeleteOutlineIcon } from "@/app/utils/icons";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { Place } from "@/app/utils/types";
import { BasicModal } from "@/app/components/shared/BasicModal";
import { EditPlaceForm } from "@/app/components/forms/EditPlaceForm";
import deletePlace from "../api/place/delete/deletePlace";
import theme from "../theme";

export const PlacesList: React.FC = () => {
  const { places, loading, error } = useGetPlaces();
  const [deleting, setDeleting] = useState<number | null>(null);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className="p-2 w-2/5">
      {places.map((place: Place) => (
        <Card key={place.id} className="flex justify-between items-center">
          <div className="flex items-center w-full">
            {place.name}
            <BasicModal
              openLabel={<DriveFileRenameOutlineIcon />}
              modalTitle="Edit place"
              modalLabel="Change place details"
              sx={{
                backgroundColor: theme.colorSchemes.dark.palette.secondary[500],
              }}
            >
              <EditPlaceForm placeId={place.id} />
            </BasicModal>
            <Button
              onClick={() => deletePlace(place.id, setDeleting)}
              sx={{
                backgroundColor: theme.colorSchemes.dark.palette.danger[500],
              }}
              className="ml-2"
              disabled={deleting === place.id}
            >
              {deleting === place.id ? "Suppression..." : <DeleteOutlineIcon />}
            </Button>
          </div>
        </Card>
      ))}
    </Card>
  );
};
