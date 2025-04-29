/**
 * Deletes a container by ID
 *
 * @param {number} id - The ID of the container to delete
 * @param {Function} setDeleting - Function to update the UI's deletion state
 * @returns {Promise} Promise that resolves after deletion
 */
const deleteContainer = async (
  id: number,
  setDeleting: (id: number | null) => void
) => {
  try {
    // Send DELETE request to the API
    const res = await fetch(`/api/containers`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      throw new Error("Error deleting container");
    }

    // Wait for a short delay to show deletion state in UI
    await new Promise((resolve) => setTimeout(resolve, 500));
    return res.json();
  } catch (err) {
    console.error(err);
  } finally {
    // Reset deletion state
    setDeleting(null);
  }
};

export default deleteContainer;
