// eslint-disable-next-line @typescript-eslint/no-explicit-any
const editItem = async (updatedRow: any) => {
  try {
    const response = await fetch("/api/items/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRow),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error("Error updating row:", error);
  }
};

export default editItem;
