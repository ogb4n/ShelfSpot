/**
 * Function to delete a tag from the system
 *
 * This function sends a DELETE request to the API to remove a tag
 * and updates the UI state accordingly.
 *
 * @param {number} id - ID of the tag to delete
 * @param {Function} setDeleting - State setter function to track deletion status
 * @param {Function} onDelete - Callback function to execute after successful deletion
 * @returns {Promise<void>}
 */
const deleteTag = async (
  id: number,
  setDeleting: React.Dispatch<React.SetStateAction<number | null>>,
  onDelete: (id: number) => void
) => {
  try {
    // Send API request to delete the tag
    const res = await fetch("/api/tags/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    // Handle API error response
    if (!res.ok) {
      throw new Error("Erreur lors de la suppression");
    }

    // Execute callback to update UI after successful deletion
    onDelete(id);
  } catch (err) {
    // Log any errors that occur during deletion
    console.error(err);
  } finally {
    // Reset the deleting state regardless of outcome
    setDeleting(null);
  }
};

export default deleteTag;
