/**
 * Function to delete a room from the system
 *
 * This function sends a POST request to the API to remove a room
 * and updates the UI deletion state.
 *
 * Note: This uses POST instead of DELETE - consider standardizing REST methods
 *
 * @param {number} id - ID of the room to delete
 * @param {Function} setDeleting - State setter function to track deletion status
 * @returns {Promise<void>}
 */
const deleteRoom = async (
  id: number,
  setDeleting: React.Dispatch<React.SetStateAction<number | null>>
) => {
  try {
    // Send API request to delete the room
    const res = await fetch("/api/rooms/delete", {
      method: "DELETE", // Note: Using POST for deletion
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    // Handle API error response
    if (!res.ok) {
      throw new Error("Erreur lors de la suppression");
    }

    // Note: This function doesn't include UI update logic for the removed room
    // Consider adding a callback parameter like in deleteTag
  } catch (err) {
    // Log any errors that occur during deletion
    console.error(err);
  } finally {
    // Reset the deleting state regardless of outcome
    setDeleting(null);
  }
};

export default deleteRoom;
