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
} from "@/app/utils/icons";
import deleteItem from "@/app/api/items/delete/deleteItem";
import editItem from "@/app/api/items/edit/editItem";

import theme from "@/app/theme";
import { Item } from "@/app/utils/types";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

function EditToolbar() {
  return <GridToolbarContainer></GridToolbarContainer>;
}

export const ConsumablesList: React.FC = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<string[]>([]);
  const [places, setPlaces] = useState<string[]>([]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/items/consumables");
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      const data: Item[] = await response.json();
      setRows(
        data.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          place: item.place ? item.place.name : "N/A",
          room: item.room ? item.room.name : "N/A",
          status: item.status ?? "N/A",
        }))
      );
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoomsAndPlaces = useCallback(async () => {
    try {
      const roomsResponse = await fetch("/api/room");
      const placesResponse = await fetch("/api/place");

      if (!roomsResponse.ok || !placesResponse.ok) {
        throw new Error("Failed to fetch rooms or places");
      }

      const roomsData = await roomsResponse.json();
      const placesData = await placesResponse.json();

      setRooms(
        roomsData.map((room: { id: number; name: string }) => room.name)
      );
      setPlaces(
        placesData.map((place: { id: number; name: string }) => place.name)
      );
    } catch (err) {
      console.error("Error fetching rooms or places:", err);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchRoomsAndPlaces();
  }, [fetchItems, fetchRoomsAndPlaces]);

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
      valueOptions: places,
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
      field: "tags",
      headerName: "Tags",
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      flex: 0.5,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={`save-${id}`}
              icon={<SaveIcon />}
              label="Save"
              sx={{ color: theme.colorSchemes.dark.palette.primary[500] }}
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
            key={`cancel-${id}`}
            icon={<GradeIcon />}
            label="Cancel"
            className="textPrimary"
            onClick={handleCancelClick(id)}
            color="inherit"
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
          sx={{ color: theme.colorSchemes.dark.palette.danger[500] }}
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
        slots={{ toolbar: EditToolbar }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        disableRowSelectionOnClick
      />
    </div>
  );
};
