/**
 * Function to create a new tag in the system
 *
 * This function sends a POST request to the API to create a new tag
 * with the provided name and icon, then updates UI state based on the result.
 *
 * @param {Object} formData - Object containing tag data
 * @param {string} formData.name - Name of the tag
 * @param {string} formData.icon - Icon identifier for the tag
 * @param {Function} setError - State setter function for error messages
 * @param {Function} setSuccess - State setter function for success messages
 * @returns {Promise<any|undefined>} The created tag data if successful
 */
const createTag = async (
  formData: { name: string; icon: string },
  setError: (msg: string | null) => void,
  setSuccess: (msg: string | null) => void
) => {
  try {
    // Send API request to create the tag
    const response = await fetch("/api/tags/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Handle API error response
    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du tag");
    }

    // Set success message on success
    setSuccess("Tag ajouté avec succès !");
    // Return the newly created tag data
    return response.json();
  } catch (err) {
    // Set error message if an exception occurs
    setError((err as Error).message);
  }
};

export default createTag;
