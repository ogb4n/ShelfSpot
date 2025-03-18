import * as zod from "zod";

const createRoom = async (
  setSuccess: (msg: string | null) => void,
  setError: (msg: string | null) => void,
  formData: { name: string }
) => {
  const schema = zod.object({
    name: zod.string().min(1),
  });
  schema.parse(formData);
  setError(null);
  setSuccess(null);

  try {
    const response = await fetch("/api/rooms/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Failed to create room");
    }

    setSuccess("Room successfully created!");
  } catch (err) {
    console.error(err);
    setError("An error occurred while creating the room.");
  }
};

export default createRoom;
