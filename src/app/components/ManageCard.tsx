"use client";
import * as React from "react";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardActions from "@mui/joy/CardActions";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import { redirect } from "next/navigation";
import theme from "@/app/theme";

export const MostUsedPlacesCard: React.FC = () => {
  return (
    <Card
      variant="solid"
      sx={{ backgroundColor: theme.colorSchemes.dark.palette.secondary[500] }}
      invertedColors
    >
      <CardContent orientation="horizontal">
        <CardContent>
          <Typography level="body-md" fontWeight="bold">
            Order your spaces
          </Typography>
        </CardContent>
      </CardContent>
      <CardActions>
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => redirect("/manage")}
        >
          Manage
        </Button>
      </CardActions>
    </Card>
  );
};
