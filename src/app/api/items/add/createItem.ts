import { Item } from "@/app/utils/types";

const createItem = async (
  setSuccess: (msg: string | null) => void,
  setError: (msg: string | null) => void,
  formData: Item
) => {
  //   const schema = zod.object({
  //     name: zod.string().min(1),
  //     stock: zod.number().int().positive(),
  //     price: zod.number().int().positive(),
  //     status: zod.string().min(1),
  //     roomId: zod.number().int().positive(),
  //     placeId: zod.number().int().positive(),
  //     icon: zod.string().min(1),
  //     tags: zod.array(zod.string()).optional(),
  //   });
  //   schema.parse(formData);
  setError(null);
  setSuccess(null);

  try {
    const response = await fetch("/api/items/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        stock: Number(formData.stock),
        price: Number(formData.price),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create item");
    }

    setSuccess("Item successfully created!");
  } catch (err) {
    console.error(err);
    setError("An error occurred while creating the item.");
  }
};

export default createItem;
