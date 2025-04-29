"use client";
import React, { useState, useEffect } from "react";
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
      <div className="p-4 mt-4 border border-gray-600 rounded-md bg-[#2a2a2a]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (favourites.length === 0) {
    return (
      <div className="p-4 mt-4 border border-gray-600 rounded-md bg-[#2a2a2a]">
        <p className="text-gray-300">You don&apos;t have any favourite items yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto border border-gray-600 rounded-md bg-[#2a2a2a] p-4">
      <h3 className="text-xl font-bold mb-4 text-white">
        Your Favourites
      </h3>
      <ul className="space-y-3">
        {favourites.map((favourite) => (
          <li
            key={favourite.id}
            className="border border-gray-700 rounded-md bg-[#333] p-3 mb-2 flex justify-between items-start"
          >
            <div>
              <h4 className="font-medium text-white">
                {favourite.item?.name ?? "Unknown Item"}
              </h4>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-300">
                <p>
                  Quantity: {favourite.item?.quantity ?? "N/A"}
                </p>
                <p>
                  Room: {favourite.item?.room?.name ?? "N/A"}
                </p>
                <p>
                  Place: {favourite.item?.place?.name ?? "N/A"}
                </p>
              </div>
            </div>
            <button
              className="px-3 py-1 bg-red-900/30 text-red-400 rounded-md hover:bg-red-900/50 transition-colors flex items-center gap-1 text-sm"
              onClick={() => handleRemoveFavourite(favourite.id)}
            >
              <DeleteOutlineIcon className="w-4 h-4" />
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
