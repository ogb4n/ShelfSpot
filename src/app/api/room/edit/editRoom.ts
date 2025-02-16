const editRoom = async (id: number, formData: { name: string }) => {
  try {
    await fetch("/api/room/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, ...formData }),
    });
  } catch (error) {
    return console.error("Failed to edit room:", error);
  }
};

export default editRoom;
