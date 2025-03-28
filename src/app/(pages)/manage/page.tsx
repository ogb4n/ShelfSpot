"use server";
import { BasicModal } from "@/app/components/shared/BasicModal";
import { PlacesList } from "@/app/components/PlacesList";
import { Divider } from "@mui/joy";
import { RoomsList } from "@/app/components/RoomsList";
import AddIcon from "@mui/icons-material/Add";
import { AddPlaceForm } from "@/app/components/forms/AddPlaceForm";
import { AddRoomForm } from "@/app/components/forms/AddRoomForm";
import { AddContainerForm } from "@/app/components/forms/AddContainerForm";

const Manage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center p-24 gap-2">
      <PlacesList />
      <BasicModal
        openLabel="add places"
        modalTitle="Place addition"
        icon={<AddIcon />}
        modalLabel="places are meant to add order in your rooms"
      >
        <AddPlaceForm />
      </BasicModal>
      <Divider />
      <BasicModal
        openLabel="add rooms"
        modalTitle="Room addition"
        icon={<AddIcon />}
        modalLabel="rooms are meant to add order in your house"
      >
        <AddRoomForm />
      </BasicModal>
      <RoomsList />

      <Divider />
      <BasicModal
        openLabel="add containers"
        modalTitle="Container addition"
        icon={<AddIcon />}
        modalLabel="containers are boxes to put your things in"
      >
        <AddContainerForm />
      </BasicModal>
    </main>
  );
};

export default Manage;
