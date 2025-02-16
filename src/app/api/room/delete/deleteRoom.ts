const deleteRoom = async (
  id: number,
  setDeleting: React.Dispatch<React.SetStateAction<number | null>>
) => {
  try {
    const res = await fetch("/api/room/delete", {
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

export default deleteRoom;
