import { Item } from "@/app/utils/types";
import * as z from "zod";

const createItem = async (
  setSuccess: (msg: string | null) => void,
  setError: (msg: string | null) => void,
  formData: Item
) => {
  const schema = z.object({
    name: z.string().min(1),
    stock: z.number().int().positive(),
    price: z.number().int().positive(),
    status: z.string().min(1),
    roomId: z.number().int().positive(),
    placeId: z.number().int().positive(),
    icon: z.string().min(1),
    tags: z.array(z.string()).optional(),
  });
  schema.parse(formData);
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
        stock: Number(formData.quantity),
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
