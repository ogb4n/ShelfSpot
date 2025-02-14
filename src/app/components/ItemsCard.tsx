"use client";
import * as React from "react";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardActions from "@mui/joy/CardActions";
import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";
import { BasicModal } from "./shared/BasicModal";
import { AddItemForm } from "./forms/AddItemForm";
import InventoryIcon from "@mui/icons-material/Inventory";
import theme from "../theme";

export const ItemsCard: React.FC = () => {
  const [itemsCount, setItemsCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchItemsCount = async () => {
      try {
        const response = await fetch("/api/items");
        const items = await response.json();
        setItemsCount(items.length);
      } catch (error) {
        console.error("Failed to fetch items count:", error);
        setItemsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchItemsCount();
  }, []);

  return (
    <Card
      variant="solid"
      sx={{ backgroundColor: theme.colorSchemes.dark.palette.primary[500] }}
      invertedColors
    >
      <CardContent orientation="horizontal">
        <CircularProgress size="lg" determinate value={itemsCount ?? 0}>
          <InventoryIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md" fontWeight="bold">
            Items stored
          </Typography>
          <Typography level="h2">
            {loading ? "Loading..." : itemsCount}
          </Typography>
        </CardContent>
      </CardContent>
      <CardActions>
        <BasicModal
          openLabel="Add item"
          modalTitle="Add a new item"
          modalLabel="You can add a new item to your inventory by filling out the form below."
        >
          <AddItemForm />
        </BasicModal>
      </CardActions>
    </Card>
  );
};
