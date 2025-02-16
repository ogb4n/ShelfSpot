const deleteTag = async (
  id: number,
  setDeleting: React.Dispatch<React.SetStateAction<number | null>>,
  onDelete: (id: number) => void
) => {
  try {
    const res = await fetch("/api/tags/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      throw new Error("Erreur lors de la suppression");
    }

    onDelete(id);
  } catch (err) {
    console.error(err);
  } finally {
    setDeleting(null);
  }
};

export default deleteTag;
