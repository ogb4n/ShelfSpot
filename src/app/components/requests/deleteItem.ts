import { GridRowId } from "@mui/x-data-grid";

const deleteItem = async (id: GridRowId) => {
  try {
    const response = await fetch(`/api/items/delete?id=${id}`, {
      method: "DELETE",
    });

    return response;
  } catch (error) {
    console.error("Error deleting row:", error);
  }
};

export default deleteItem;
