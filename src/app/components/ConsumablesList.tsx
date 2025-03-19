"use client";
/**
 * Module de liste des consommables (ConsumablesList)
 *
 * Ce composant affiche et gère la liste des articles consommables de l'inventaire.
 * Il permet de visualiser, modifier et supprimer des consommables via une grille de données interactive.
 * Le composant offre des fonctionnalités d'édition en ligne, de tri et de pagination.
 */
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
} from "@mui/x-data-grid"; // Composants de grille de données avancée
import CircularProgress from "@mui/joy/CircularProgress"; // Indicateur de chargement
import Typography from "@mui/joy/Typography"; // Composant de texte stylisé
import {
  EditIcon,
  DeleteIcon,
  SaveIcon,
  CancelIcon,
  GradeIcon,
} from "@/app/utils/icons"; // Icônes pour les actions
import deleteItem from "@/app/components/requests/deleteItem"; // Fonction API pour supprimer un article
import editItem from "@/app/components/requests/editItem"; // Fonction API pour éditer un article

import theme from "@/app/theme"; // Thème de l'application
import { Item } from "@/app/utils/types"; // Interface définissant la structure d'un article

/**
 * Extension du module DataGrid pour ajouter des propriétés personnalisées
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
 * Actuellement vide mais peut être étendu pour ajouter des fonctionnalités
 *
 * @returns {JSX.Element} Barre d'outils de la grille
 */
function EditToolbar() {
  return <GridToolbarContainer></GridToolbarContainer>;
}

/**
 * Composant principal de liste des consommables
 * Affiche et gère les articles consommables dans une grille interactive
 *
 * @returns {JSX.Element} Le composant rendu
 */
export const ConsumablesList: React.FC = () => {
  // État pour stocker les données des lignes du tableau
  const [rows, setRows] = useState<GridRowsProp>([]);
  // État pour gérer les modes d'édition des lignes (vue/édition)
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  // État pour le chargement des données
  const [loading, setLoading] = useState<boolean>(true);
  // État pour les messages d'erreur
  const [error, setError] = useState<string | null>(null);
  // État pour la liste des pièces (utilisé dans les sélecteurs)
  const [rooms, setRooms] = useState<string[]>([]);
  // État pour la liste des emplacements (utilisé dans les sélecteurs)
  const [places, setPlaces] = useState<string[]>([]);

  /**
   * Récupère la liste des articles consommables depuis l'API
   * Transforme les données pour les adapter au format de la grille
   */
  const fetchItems = useCallback(async () => {
    setLoading(true); // Active l'indicateur de chargement
    setError(null); // Réinitialise les erreurs précédentes

    try {
      // Appel à l'API pour récupérer les articles consommables
      const response = await fetch("/api/items/consumables");
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }

      // Traitement des données reçues
      const data: Item[] = await response.json();

      // Formatage des données pour la grille avec gestion des valeurs nulles
      setRows(
        data.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          place: item.place ? item.place.name : "N/A", // Gestion des emplacements manquants
          room: item.room ? item.room.name : "N/A", // Gestion des pièces manquantes
          status: item.status ?? "N/A", // Gestion du statut manquant
        }))
      );
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setLoading(false); // Désactive l'indicateur de chargement
    }
  }, []);

  /**
   * Récupère la liste des pièces et des emplacements pour les sélecteurs
   * Ces données sont utilisées dans les menus déroulants d'édition
   */
  const fetchRoomsAndPlaces = useCallback(async () => {
    try {
      // Appels API parallèles pour récupérer les pièces et les emplacements
      const roomsResponse = await fetch("/api/rooms");
      const placesResponse = await fetch("/api/places");

      if (!roomsResponse.ok || !placesResponse.ok) {
        throw new Error("Failed to fetch rooms or places");
      }

      // Traitement des données reçues
      const roomsData = await roomsResponse.json();
      const placesData = await placesResponse.json();

      // Extraction des noms pour les listes déroulantes
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

  /**
   * Effet pour charger les données initiales au montage du composant
   */
  useEffect(() => {
    fetchItems(); // Chargement des articles consommables
    fetchRoomsAndPlaces(); // Chargement des pièces et emplacements
  }, [fetchItems, fetchRoomsAndPlaces]);

  /**
   * Gère l'arrêt de l'édition d'une ligne
   * Empêche la sortie automatique du mode édition lors d'un clic en dehors
   *
   * @param {Object} params - Paramètres de l'événement
   * @param {Object} event - L'événement d'arrêt d'édition
   */
  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true; // Empêche la sortie du mode édition
    }
  };

  /**
   * Active le mode édition pour une ligne spécifique
   *
   * @param {GridRowId} id - L'identifiant de la ligne à éditer
   * @returns {Function} Fonction de gestionnaire d'événements
   */
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  /**
   * Sauvegarde les modifications et quitte le mode édition
   *
   * @param {GridRowId} id - L'identifiant de la ligne modifiée
   * @returns {Function} Fonction de gestionnaire d'événements
   */
  const handleSaveClick = (id: GridRowId) => () => {
    return setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View },
    });
  };

  /**
   * Supprime un article consommable après confirmation
   *
   * @param {GridRowId} id - L'identifiant de la ligne à supprimer
   * @returns {Function} Fonction de gestionnaire d'événements asynchrone
   */
  const handleDeleteClick = (id: GridRowId) => async () => {
    await deleteItem(id); // Appel API pour supprimer l'article
    return setRows(rows.filter((row) => row.id !== id)); // Mise à jour de l'UI
  };

  /**
   * Annule les modifications en cours et quitte le mode édition
   *
   * @param {GridRowId} id - L'identifiant de la ligne en édition
   * @returns {Function} Fonction de gestionnaire d'événements
   */
  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true }, // Ignore les modifications
    });

    // Si c'est une nouvelle ligne, la supprimer du tableau
    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  /**
   * Traite la mise à jour d'une ligne après édition
   * Envoie les modifications à l'API et met à jour l'état local
   *
   * @param {GridRowModel} newRow - Les nouvelles données de la ligne
   * @returns {Promise<GridRowModel>} La ligne mise à jour
   */
  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    await editItem(updatedRow); // Appel API pour mettre à jour l'article

    // Mise à jour de l'UI avec les nouvelles données
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  /**
   * Met à jour le modèle des modes de ligne
   *
   * @param {GridRowModesModel} newRowModesModel - Le nouveau modèle de modes
   */
  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  /**
   * Définition des colonnes de la grille avec leurs propriétés
   * Chaque colonne peut avoir des types différents (texte, nombre, sélection, etc.)
   */
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
      type: "singleSelect", // Menu déroulant avec sélection unique
      valueOptions: places, // Options de sélection basées sur les emplacements disponibles
    },
    {
      field: "room",
      headerName: "Room",
      flex: 1,
      type: "singleSelect", // Menu déroulant avec sélection unique
      editable: true,
      valueOptions: rooms, // Options de sélection basées sur les pièces disponibles
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
      /**
       * Détermine quelles actions afficher selon le mode de la ligne
       *
       * @param {Object} params - Les paramètres de la cellule
       * @returns {Array<JSX.Element>} Les actions à afficher
       */
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        // Actions en mode édition (Sauvegarder, Annuler)
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

        // Actions en mode visualisation (Éditer, Supprimer, etc.)
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

  // Affichage de l'indicateur de chargement pendant le chargement des données
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

  // Affichage d'un message d'erreur avec possibilité de réessayer
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

  // Rendu principal du composant avec la grille de données
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows} // Données des lignes
        columns={columns} // Configuration des colonnes
        editMode="row" // Mode d'édition par ligne complète
        rowModesModel={rowModesModel} // État des modes d'édition
        onRowModesModelChange={handleRowModesModelChange} // Gestion des changements de mode
        onRowEditStop={handleRowEditStop} // Gestion de l'arrêt d'édition
        processRowUpdate={processRowUpdate} // Traitement des mises à jour
        slots={{ toolbar: EditToolbar }} // Personnalisation de la barre d'outils
        slotProps={{
          toolbar: { setRows, setRowModesModel }, // Propriétés passées à la barre d'outils
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5, // Nombre d'éléments par page
            },
          },
        }}
        pageSizeOptions={[5]} // Options de taille de page disponibles
        disableRowSelectionOnClick // Désactive la sélection au clic
      />
    </div>
  );
};
