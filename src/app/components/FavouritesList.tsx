"use client";
import React, { useState, useEffect } from "react";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useSession } from "next-auth/react";
import Loading from "./shared/Loading";

interface FavouriteItem {
  id: number;
  itemId: number;
  userId: string;
  item?: {
    id: number;
    name: string;
    quantity: number;
    place?: {
      name: string;
    };
    room?: {
      name: string;
    };
  };
}

export const FavouritesList: React.FC = () => {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();

  // Fetch favourites from API
  useEffect(() => {
    const fetchFavourites = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/favourites");
        if (!response.ok) {
          throw new Error("Failed to fetch favourites");
        }
        const data = await response.json();
        setFavourites(data);
      } catch (err) {
        console.error("Error fetching favourites:", err);
        setError("Failed to load favourites. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  // Function to remove an item from favourites
  const handleRemoveFavourite = async (id: number) => {
    try {
      const response = await fetch(`/api/favourites?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove favourite");
      }

      // Update state to remove deleted favourite
      setFavourites((prevFavourites) =>
        prevFavourites.filter((fav) => fav.id !== id)
      );
    } catch (err) {
      console.error("Error removing favourite:", err);
      setError("Failed to remove favourite. Please try again.");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ p: 3, mt: 2 }}>
        <Typography color="danger">{error}</Typography>
      </Card>
    );
  }

  if (favourites.length === 0) {
    return (
      <Card variant="outlined" sx={{ p: 3, mt: 2 }}>
        <Typography>You don&apos;t have any favourite items yet.</Typography>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
      <Typography level="h3" sx={{ mb: 2 }}>
        Your Favourites
      </Typography>
      <List>
        {favourites.map((favourite) => (
          <ListItem
            key={favourite.id}
            sx={{
              borderRadius: "sm",
              mb: 1,
              boxShadow: "sm",
              bgcolor: "background.surface",
            }}
            endAction={
              <Button
                variant="soft"
                color="danger"
                size="sm"
                onClick={() => handleRemoveFavourite(favourite.id)}
                startDecorator={<DeleteOutlineIcon />}
              >
                Remove
              </Button>
            }
          >
            <ListItemContent>
              <Typography level="title-md">
                {favourite.item?.name ?? "Unknown Item"}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Typography level="body-sm">
                  Quantity: {favourite.item?.quantity ?? "N/A"}
                </Typography>
                <Typography level="body-sm">
                  Room: {favourite.item?.room?.name ?? "N/A"}
                </Typography>
                <Typography level="body-sm">
                  Place: {favourite.item?.place?.name ?? "N/A"}
                </Typography>
              </Box>
            </ListItemContent>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};
