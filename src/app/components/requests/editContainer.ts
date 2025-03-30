const editContainer = async (
  id: number,
  formData: { name: string; icon: string; placeId?: number; roomId?: number }
) => {
  try {
    const res = await fetch("/api/containers/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...formData }),
    });

    if (!res.ok) {
      throw new Error("Error updating container");
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default editContainer;
