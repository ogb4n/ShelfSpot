import * as zod from "zod";

const formDataSchema = zod.object({
  name: zod.string().nonempty(),
  roomId: zod.number().int(),
});

const createPlace = async (
  setSuccess: (msg: string) => void,
  setError: (msg: string) => void,
  formData: zod.infer<typeof formDataSchema>
) => {
  try {
    formDataSchema.parse(formData);

    const response = await fetch("/api/place/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout de la place");
    }

    await response.json();

    setSuccess("Place ajoutée avec succès !");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    setError(err.message);
  }
};

export default createPlace;
