"use client";
/**
 * Manager Component
 *
 * A unified component that manages rooms, places, and containers.
 * Centralizes the management of these related entities in one component
 * to avoid code duplication and improve maintainability.
 */
import React, { useState } from "react";
import Card from "@mui/joy/Card";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import Divider from "@mui/joy/Divider";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";

// Icons
import { DeleteOutlineIcon } from "@/app/assets/icons";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";

// Custom hooks
import useGetRooms from "@/app/hooks/useGetRooms";
import useGetPlaces from "@/app/hooks/useGetPlaces";
import useGetContainers from "@/app/hooks/useGetContainers";

// Types
import { Room, Place, Container } from "@/app/types";

// Components
import { BasicModal } from "@/app/components/shared/BasicModal";
import Loading from "@/app/components/shared/Loading";

// Forms
import { EditRoomForm } from "@/app/components/forms/EditRoomForm";
import { EditPlaceForm } from "@/app/components/forms/EditPlaceForm";
import { AddRoomForm } from "@/app/components/forms/AddRoomForm";
import { AddPlaceForm } from "@/app/components/forms/AddPlaceForm";
import { AddContainerForm } from "@/app/components/forms/AddContainerForm";
import { EditContainerForm } from "@/app/components/forms/EditContainerForm";

// API Functions
import deleteRoom from "@/app/components/requests/deleteRoom";
import deletePlace from "@/app/components/requests/deletePlace";
import deleteContainer from "@/app/components/requests/deleteContainer";

/**
 * Main Manager component
 *
 * @returns {JSX.Element} Rendered component
 */
export const Manager: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<number>(0);

  // Deletion states
  const [deletingRoom, setDeletingRoom] = useState<number | null>(null);
  const [deletingPlace, setDeletingPlace] = useState<number | null>(null);
  const [deletingContainer, setDeletingContainer] = useState<number | null>(
    null
  );

  // Data fetching with custom hooks
  const { rooms, loading: loadingRooms, error: roomsError } = useGetRooms();
  const { places, loading: loadingPlaces, error: placesError } = useGetPlaces();
  const {
    containers,
    loading: loadingContainers,
    error: containersError,
  } = useGetContainers();

  // Handler functions for delete operations
  const handleDeleteRoom = async (id: number) => {
    setDeletingRoom(id);
    return deleteRoom(id, setDeletingRoom);
  };

  const handleDeletePlace = async (id: number) => {
    setDeletingPlace(id);
    return deletePlace(id, setDeletingPlace);
  };

  const handleDeleteContainer = async (id: number) => {
    setDeletingContainer(id);
    return deleteContainer(id, setDeletingContainer);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Typography level="h4" className="mb-4">
        Space Management
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue as number)}
        aria-label="Storage management tabs"
      >
        <TabList>
          <Tab>Rooms</Tab>
          <Tab>Places</Tab>
          <Tab>Containers</Tab>
        </TabList>

        {/* Rooms Tab */}
        <TabPanel value={0}>
          <Card className="p-4" variant="outlined">
            <Box className="flex justify-between items-center mb-4">
              <Typography typography="h5">Rooms</Typography>
              <BasicModal
                openLabel="Add Room"
                modalTitle="Add a new room"
                modalLabel="Create a new room in your space"
              >
                <AddRoomForm />
              </BasicModal>
            </Box>

            {loadingRooms ? (
              <Loading />
            ) : roomsError ? (
              <Typography color="danger">Error: {roomsError}</Typography>
            ) : (
              <List>
                {rooms.length > 0 ? (
                  rooms.map((room: Room, index: number) => (
                    <React.Fragment key={room.id}>
                      <ListItem
                        className="py-3"
                        endAction={
                          <Box className="flex gap-2">
                            <BasicModal
                              openLabel={<DriveFileRenameOutlineIcon />}
                              sx={{ backgroundColor: "#f3f4f6" }}
                              modalTitle="Edit room"
                              modalLabel="Change room details"
                            >
                              <EditRoomForm roomId={room.id} />
                            </BasicModal>

                            <Button
                              onClick={() => handleDeleteRoom(room.id)}
                              variant="soft"
                              color="danger"
                              size="sm"
                              disabled={deletingRoom === room.id}
                            >
                              {deletingRoom === room.id ? (
                                "Deleting..."
                              ) : (
                                <DeleteOutlineIcon />
                              )}
                            </Button>
                          </Box>
                        }
                      >
                        <ListItemContent>
                          <Typography>{room.name}</Typography>
                        </ListItemContent>
                      </ListItem>
                      {index < rooms.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <Typography
                    level="body-sm"
                    className="text-center py-4 text-gray-500"
                  >
                    No rooms available
                  </Typography>
                )}
              </List>
            )}
          </Card>
        </TabPanel>

        {/* Places Tab */}
        <TabPanel value={1}>
          <Card className="p-4" variant="outlined">
            <Box className="flex justify-between items-center mb-4">
              <Typography typography="h5">Places</Typography>
              <BasicModal
                openLabel="Add Place"
                modalTitle="Add a new place"
                modalLabel="Create a new place in a room"
              >
                <AddPlaceForm />
              </BasicModal>
            </Box>

            {loadingPlaces ? (
              <Loading />
            ) : placesError ? (
              <Typography color="danger">Error: {placesError}</Typography>
            ) : (
              <List>
                {places.length > 0 ? (
                  places.map((place: Place, index: number) => (
                    <React.Fragment key={place.id}>
                      <ListItem
                        className="py-3"
                        endAction={
                          <Box className="flex gap-2">
                            <BasicModal
                              openLabel={<DriveFileRenameOutlineIcon />}
                              sx={{ backgroundColor: "#f3f4f6" }}
                              modalTitle="Edit place"
                              modalLabel="Change place details"
                            >
                              <EditPlaceForm placeId={place.id} />
                            </BasicModal>

                            <Button
                              onClick={() => handleDeletePlace(place.id)}
                              variant="soft"
                              color="danger"
                              size="sm"
                              disabled={deletingPlace === place.id}
                            >
                              {deletingPlace === place.id ? (
                                "Deleting..."
                              ) : (
                                <DeleteOutlineIcon />
                              )}
                            </Button>
                          </Box>
                        }
                      >
                        <ListItemContent>
                          <Typography>{place.name}</Typography>
                        </ListItemContent>
                      </ListItem>
                      {index < places.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <Typography
                    level="body-sm"
                    className="text-center py-4 text-gray-500"
                  >
                    No places available
                  </Typography>
                )}
              </List>
            )}
          </Card>
        </TabPanel>

        {/* Containers Tab */}
        <TabPanel value={2}>
          <Card className="p-4" variant="outlined">
            <Box className="flex justify-between items-center mb-4">
              <Typography typography="h5">Containers</Typography>
              <BasicModal
                openLabel="Add Container"
                modalTitle="Add a new container"
                modalLabel="Create a new container in a place"
              >
                <AddContainerForm />
              </BasicModal>
            </Box>

            {loadingContainers ? (
              <Loading />
            ) : containersError ? (
              <Typography color="danger">Error: {containersError}</Typography>
            ) : (
              <List>
                {containers && containers.length > 0 ? (
                  containers.map((container: Container, index: number) => (
                    <React.Fragment key={container.id}>
                      <ListItem
                        className="py-3"
                        endAction={
                          <Box className="flex gap-2">
                            <BasicModal
                              openLabel={<DriveFileRenameOutlineIcon />}
                              sx={{ backgroundColor: "#f3f4f6" }}
                              modalTitle="Edit container"
                              modalLabel="Change container details"
                            >
                              <EditContainerForm containerId={container.id} />
                            </BasicModal>

                            <Button
                              onClick={() =>
                                handleDeleteContainer(container.id)
                              }
                              variant="soft"
                              color="danger"
                              size="sm"
                              disabled={deletingContainer === container.id}
                            >
                              {deletingContainer === container.id ? (
                                "Deleting..."
                              ) : (
                                <DeleteOutlineIcon />
                              )}
                            </Button>
                          </Box>
                        }
                      >
                        <ListItemContent>
                          <Typography>{container.name}</Typography>
                        </ListItemContent>
                      </ListItem>
                      {index < containers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <Typography
                    level="body-sm"
                    className="text-center py-4 text-gray-500"
                  >
                    No containers available
                  </Typography>
                )}
              </List>
            )}
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
};
