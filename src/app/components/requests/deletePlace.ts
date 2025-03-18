const deletePlace = async (
  id: number,
  setDeleting: (id: number | null) => void
) => {
  try {
    const res = await fetch("/api/places/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      throw new Error("Erreur lors de la suppression");
    }
  } catch (err) {
    console.error(err);
  } finally {
    setDeleting(null);
  }
};

export default deletePlace;
