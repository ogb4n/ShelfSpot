"use server";
import { BasicModal } from "@/app/components/shared/BasicModal";
import { PlacesList } from "@/app/components/PlacesList";
import { Divider } from "@mui/joy";
import { RoomsList } from "@/app/components/RoomsList";
import AddIcon from "@mui/icons-material/Add";
import Typography from "@mui/joy/Typography";
import { AddPlaceForm } from "@/app/components/forms/AddPlaceForm";

const Manage = () => {
  return (
    <>
      <header></header>
      <main className="flex min-h-screen items-center justify-center p-24 gap-2">
        <Typography></Typography>
        <PlacesList />
        <BasicModal
          openLabel="add places"
          modalTitle="Place addition"
          icon={<AddIcon />}
          modalLabel="places are meant to add order in your rooms"
          color="success"
        >
          <AddPlaceForm />
        </BasicModal>
        <Divider />
        <Typography></Typography>
        <BasicModal
          openLabel="add rooms"
          modalTitle="Room addition"
          icon={<AddIcon />}
          modalLabel="rooms are meant to add order in your places"
          color="warning"
        >
          oui
        </BasicModal>
        <RoomsList />
      </main>
    </>
  );
};

export default Manage;
