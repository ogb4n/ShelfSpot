"use client";
/**
 * Manager Component
 *
 * A unified component that manages rooms, places, and containers.
 * Centralizes the management of these related entities in one component
 * to avoid code duplication and improve maintainability.
 */
import React, { useState } from "react";

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
      <h2 className="text-2xl font-bold mb-6 text-white">
        Space Management
      </h2>

      <div className="w-full">
        {/* Custom tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex">
            {["Rooms", "Places", "Containers"].map((tab, index) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium text-sm ${activeTab === index
                    ? "border-b-2 border-[#335C67] text-[#335C67]"
                    : "text-gray-400 hover:text-white"
                  }`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms Tab */}
        {activeTab === 0 && (
          <div className="border border-gray-700 rounded-md bg-[#2a2a2a] p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Rooms</h3>
              <BasicModal
                openLabel="Add Room"
                modalTitle="Add a new room"
                modalLabel="Create a new room in your space"
              >
                <AddRoomForm />
              </BasicModal>
            </div>

            {loadingRooms ? (
              <Loading />
            ) : roomsError ? (
              <p className="text-red-500">Error: {roomsError}</p>
            ) : (
              <ul className="divide-y divide-gray-700">
                {rooms.length > 0 ? (
                  rooms.map((room: Room) => (
                    <li key={room.id} className="py-3 flex justify-between items-center">
                      <span className="text-gray-200">{room.name}</span>
                      <div className="flex gap-2">
                        <BasicModal
                          openLabel={<DriveFileRenameOutlineIcon />}
                          modalTitle="Edit room"
                          modalLabel="Change room details"
                          sx={{ backgroundColor: "#333" }}
                        >
                          <EditRoomForm roomId={room.id} />
                        </BasicModal>

                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={deletingRoom === room.id}
                        >
                          {deletingRoom === room.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <DeleteOutlineIcon />
                          )}
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500 text-sm">
                    No rooms available
                  </p>
                )}
              </ul>
            )}
          </div>
        )}

        {/* Places Tab */}
        {activeTab === 1 && (
          <div className="border border-gray-700 rounded-md bg-[#2a2a2a] p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Places</h3>
              <BasicModal
                openLabel="Add Place"
                modalTitle="Add a new place"
                modalLabel="Create a new place in a room"
              >
                <AddPlaceForm />
              </BasicModal>
            </div>

            {loadingPlaces ? (
              <Loading />
            ) : placesError ? (
              <p className="text-red-500">Error: {placesError}</p>
            ) : (
              <ul className="divide-y divide-gray-700">
                {places.length > 0 ? (
                  places.map((place: Place) => (
                    <li key={place.id} className="py-3 flex justify-between items-center">
                      <span className="text-gray-200">{place.name}</span>
                      <div className="flex gap-2">
                        <BasicModal
                          openLabel={<DriveFileRenameOutlineIcon />}
                          modalTitle="Edit place"
                          modalLabel="Change place details"
                          sx={{ backgroundColor: "#333" }}
                        >
                          <EditPlaceForm placeId={place.id} />
                        </BasicModal>

                        <button
                          onClick={() => handleDeletePlace(place.id)}
                          className="p-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={deletingPlace === place.id}
                        >
                          {deletingPlace === place.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <DeleteOutlineIcon />
                          )}
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500 text-sm">
                    No places available
                  </p>
                )}
              </ul>
            )}
          </div>
        )}

        {/* Containers Tab */}
        {activeTab === 2 && (
          <div className="border border-gray-700 rounded-md bg-[#2a2a2a] p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Containers</h3>
              <BasicModal
                openLabel="Add Container"
                modalTitle="Add a new container"
                modalLabel="Create a new container in a place"
              >
                <AddContainerForm />
              </BasicModal>
            </div>

            {loadingContainers ? (
              <Loading />
            ) : containersError ? (
              <p className="text-red-500">Error: {containersError}</p>
            ) : (
              <ul className="divide-y divide-gray-700">
                {containers && containers.length > 0 ? (
                  containers.map((container: Container) => (
                    <li key={container.id} className="py-3 flex justify-between items-center">
                      <span className="text-gray-200">{container.name}</span>
                      <div className="flex gap-2">
                        <BasicModal
                          openLabel={<DriveFileRenameOutlineIcon />}
                          modalTitle="Edit container"
                          modalLabel="Change container details"
                          sx={{ backgroundColor: "#333" }}
                        >
                          <EditContainerForm containerId={container.id} />
                        </BasicModal>

                        <button
                          onClick={() => handleDeleteContainer(container.id)}
                          className="p-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={deletingContainer === container.id}
                        >
                          {deletingContainer === container.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <DeleteOutlineIcon />
                          )}
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500 text-sm">
                    No containers available
                  </p>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
