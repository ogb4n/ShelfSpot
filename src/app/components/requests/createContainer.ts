import * as zod from "zod";

/**
 * Schema for validating container creation data
 */
const formDataSchema = zod.object({
  name: zod.string().nonempty(),
  placeId: zod.number().int(),
  icon: zod.string().optional().default("box"),
});

/**
 * Creates a new container
 *
 * @param {Function} setSuccess - Function to set success message
 * @param {Function} setError - Function to set error message
 * @param {Object} formData - Container data (name, placeId, icon)
 * @returns {Promise} Promise that resolves after creation
 */
const createContainer = async (
  setSuccess: (msg: string) => void,
  setError: (msg: string) => void,
  formData: zod.infer<typeof formDataSchema>
) => {
  try {
    // Validate input data
    formDataSchema.parse(formData);

    const response = await fetch("/api/containers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Error adding container");
    }

    await response.json();

    setSuccess("Container added successfully!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    setError(err.message);
  }
};

export default createContainer;
