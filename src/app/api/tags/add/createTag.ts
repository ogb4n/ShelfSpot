const createTag = async (
  formData: { name: string; icon: string },
  setError: (msg: string | null) => void,
  setSuccess: (msg: string | null) => void
) => {
  try {
    const response = await fetch("/api/tags/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du tag");
    }

    setSuccess("Tag ajouté avec succès !");
    return response.json();
  } catch (err) {
    setError((err as Error).message);
  }
};

export default createTag;
