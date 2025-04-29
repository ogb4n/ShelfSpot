"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";
import {
  EditIcon,
  DeleteIcon,
  SaveIcon,
  CancelIcon,
  GradeIcon,
} from "@/app/assets/icons"; // Icônes personnalisées pour les actions
import deleteItem from "@/app/components/requests/deleteItem";
import editItem from "@/app/components/requests/editItem";
import { Item, Room, Place } from "@/app/types";

/**
 * Extension du module de la grille de données pour ajouter des propriétés personnalisées
 * à la barre d'outils de la grille
 */
declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

/**
 * Composant de barre d'outils personnalisée pour la grille de données
 * Affiche le titre et permet d'ajouter des contrôles supplémentaires
 */
function EditToolbar() {
  return (
    <GridToolbarContainer
      sx={{
        display: "flex",
        justifyContent: "space-between",
        p: 2,
        borderBottom: "1px solid #333",
      }}
    >
      <Typography level="title-lg">Inventory Items</Typography>
    </GridToolbarContainer>
  );
}

/**
 * Composant principal de liste d'articles
 * Gère l'affichage et l'édition des articles dans une grille de données interactive
 * avec un style inspiré de Shadcn UI
 */
interface BasicListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}

export const BasicList: React.FC<BasicListProps> = ({ session }) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<string[]>([]);
  const [places, setPlaces] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<GridRowId>>(new Set());
  const [containers, setContainers] = useState<string[]>([]);

  // États pour stocker les objets complets et gérer les relations
  const [roomsData, setRoomsData] = useState<Room[]>([]);
  const [placesData, setPlacesData] = useState<Place[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [filteredPlaces, setFilteredPlaces] = useState<string[]>([]);

  /**
   * Récupère la liste des articles depuis l'API
   */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/items");
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      const data: Item[] = await response.json();

      setRows(
        data.map((item: Item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          place: item.place ? item.place.name : "N/A",
          room: item.room ? item.room.name : "N/A",
          container: item.container ? item.container.name : "N/A",
          status: item.status ?? "N/A",
          tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
          containerId: item.container?.id,
        }))
      );
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère la liste des pièces et des emplacements pour les sélecteurs
   */
  const fetchRoomsAndPlaces = useCallback(async () => {
    try {
      const roomsResponse = await fetch("/api/rooms");
      const placesResponse = await fetch("/api/places");
      const containersResponse = await fetch("/api/containers");

      if (!roomsResponse.ok || !placesResponse.ok || !containersResponse.ok) {
        console.error("Failed to fetch rooms or places");
        setError("Failed to load rooms or places. Please try again.");
        throw new Error("Failed to fetch rooms or places");
      }

      const roomsDataFetched = await roomsResponse.json();
      const placesDataFetched = await placesResponse.json();
      const containersData = await containersResponse.json();

      setRoomsData(roomsDataFetched);
      setPlacesData(placesDataFetched);

      setContainers(
        containersData.map((container: { id: number; name: string }) => container.name)
      );
      setRooms(
        roomsDataFetched.map((room: { id: number; name: string }) => room.name)
      );
      setPlaces(
        placesDataFetched.map((place: { id: number; name: string }) => place.name)
      );
    } catch (err) {
      console.error("Error fetching rooms or places:", err);
    }
  }, []);

  const fetchUserFavorites = useCallback(async () => {
    try {
      const response = await fetch(`/api/favourites`);
      if (!response.ok) {
        console.error("Failed to fetch favorites");
        return;
      }

      const data = await response.json();
      setFavorites(
        new Set(data.map((fav: { itemId: GridRowId }) => fav.itemId))
      );
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  }, []);

  const handleFavClick = (id: GridRowId) => async () => {
    const userName = session?.user?.name || "Unknown user";
    const isFavorite = favorites.has(id);

    try {
      let response;

      if (isFavorite) {
        response = await fetch(`/api/favourites?id=${id}`, {
          method: "DELETE",
        });
      } else {
        response = await fetch("/api/favourites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId: id, userName }),
        });
      }

      if (!response.ok) {
        throw new Error(
          `Failed to ${isFavorite ? "remove from" : "add to"} favorites`
        );
      }

      setFavorites((prevFavorites) => {
        const newFavorites = new Set(prevFavorites);
        if (isFavorite) {
          newFavorites.delete(id);
        } else {
          newFavorites.add(id);
        }
        return newFavorites;
      });
    } catch (err) {
      console.error(
        `Error ${isFavorite ? "removing from" : "adding to"} favorites:`,
        err
      );
    }
  };

  // Effet pour charger les données initiales
  useEffect(() => {
    fetchItems();
    fetchRoomsAndPlaces();
    fetchUserFavorites();
  }, [fetchItems, fetchRoomsAndPlaces, fetchUserFavorites]);

  // Effet pour filtrer les places en fonction de la room sélectionnée
  useEffect(() => {
    if (selectedRoom) {
      const selectedRoomObj = roomsData.find(room => room.name === selectedRoom);
      if (selectedRoomObj) {
        const placesInRoom = placesData
          .filter(place => place.roomId === selectedRoomObj.id)
          .map(place => place.name);

        setFilteredPlaces(placesInRoom);
      }
    } else {
      setFilteredPlaces(places);
    }
  }, [selectedRoom, roomsData, placesData, places]);

  // Double-click handler to start editing
  const handleRowDoubleClick = (params: any) => {
    setRowModesModel({
      ...rowModesModel,
      [params.id]: { mode: GridRowModes.Edit }
    });
  };

  const handleCellEditStart = (params: any) => {
    if (params.field === 'room') {
      const rowIndex = rows.findIndex((row) => row.id === params.id);
      if (rowIndex !== -1) {
        const currentRow = rows[rowIndex];
        setSelectedRoom(currentRow.room);
      }
    }
  };

  const handleCellEditCommit = (params: any) => {
    if (params.field === 'room') {
      setSelectedRoom(params.value);

      const rowIndex = rows.findIndex((row) => row.id === params.id);
      if (rowIndex !== -1) {
        const updatedRow = { ...rows[rowIndex], room: params.value, place: "N/A" };
        setRows(rows.map(row => row.id === params.id ? updatedRow : row));
      }
    }
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    return setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View },
    });
  };

  const handleDeleteClick = (id: GridRowId) => async () => {
    await deleteItem(id);
    return setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    await editItem(updatedRow);
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Item", flex: 1, editable: true },
    {
      field: "quantity",
      headerName: "Qty.",
      type: "number",
      flex: 0.5,
      editable: true,
    },
    {
      field: "place",
      headerName: "Place",
      flex: 1,
      editable: true,
      type: "singleSelect",
      valueOptions: selectedRoom ? filteredPlaces : places,
    },
    {
      field: "room",
      headerName: "Room",
      flex: 1,
      type: "singleSelect",
      editable: true,
      valueOptions: rooms,
    },
    {
      field: "container",
      headerName: "Container",
      flex: 1,
      type: "singleSelect",
      editable: true,
      valueOptions: containers,
    },
    {
      field: "tags",
      headerName: "Tags",
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={`save-${id}`}
              icon={<SaveIcon />}
              label="Save"
              sx={{ color: "#335C67" }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key={`cancel-${id}`}
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key={`edit-${id}`}
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key={`delete-${id}`}
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key={`fav-${id}`}
            icon={<GradeIcon />}
            label="favourite"
            onClick={handleFavClick(id)}
            color={favorites.has(id) ? "primary" : "inherit"}
          />,
        ];
      },
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress size="lg" />
        <Typography level="h3" sx={{ ml: 2 }}>
          Loading items...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Typography
          level="h3"
          sx={{ color: "#9E2A2B" }}
        >
          {error}
        </Typography>
        <button
          onClick={fetchItems}
          style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onRowDoubleClick={handleRowDoubleClick}
        slots={{ toolbar: EditToolbar }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        onCellEditStart={handleCellEditStart}
        sx={{
          border: '1px solid #333',
          '& .MuiDataGrid-root': {
            backgroundColor: '#111',
            color: '#fff',
            fontSize: '0.95rem',
          },
          '& .MuiDataGrid-cell': {
            borderColor: '#333',
            padding: '12px 16px',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#1a1a1a',
            color: '#fff',
            borderColor: '#333',
            borderRadius: '0',
            fontSize: '1rem',
          },
          '& .MuiDataGrid-columnSeparator': {
            color: '#333',
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#1a1a1a',
            borderColor: '#333',
            borderRadius: '0',
          },
          '& .MuiTablePagination-root': {
            color: '#fff',
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: '#2563eb',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#1a1a1a',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-row.Mui-hovered': {
            backgroundColor: '#1a1a1a',
          },
          '& .MuiDataGrid-row.Mui-even': {
            backgroundColor: '#151515',
          },
          '& .MuiDataGrid-editInputCell': {
            color: '#fff',
            backgroundColor: '#222',
            padding: '4px',
            borderRadius: '4px',
          },
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
      />
    </div>
  );
};
