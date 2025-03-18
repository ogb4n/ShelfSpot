const editPlace = async (
  id: number,
  formData: { name: string; icon: string }
) => {
  try {
    const res = await fetch("/api/places/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...formData }),
    });

    if (!res.ok) {
      throw new Error("Erreur lors de la modification");
    }
  } catch (err) {
    console.error(err);
  }
};

export default editPlace;
