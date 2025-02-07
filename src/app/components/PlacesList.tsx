"use client";
import useGetPlaces from "@/app/hooks/useGetPlaces";
import Card from "@mui/joy/Card";
import Button from "@mui/joy/Button";
import React, { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { Place } from "@/app/utils/types";

export const PlacesList: React.FC = () => {
  const { places, loading, error } = useGetPlaces();
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const res = await fetch("/api/place/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

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
            <Button color="primary" className="ml-2">
              <DriveFileRenameOutlineIcon />
            </Button>
            <Button
              onClick={() => handleDelete(place.id)}
              color="danger"
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
