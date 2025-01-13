"use client";
import * as React from "react";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardActions from "@mui/joy/CardActions";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import { redirect } from "next/navigation";

export const MostUsedPlacesCard: React.FC = () => {
  return (
    <Card variant="solid" sx={{ backgroundColor: "#07a875" }} invertedColors>
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
