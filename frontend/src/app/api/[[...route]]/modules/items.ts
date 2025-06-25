import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";
import { GET, POST, DELETE, EDIT_ITEM, GET_CONSUMABLES, GET_FAVOURITES, CREATE_FAVOURITE, DELETE_FAVOURITE } from "../controllers/items";

export const itemsModule: ApiModule = {
  routes: [
    {
      path: "items",
      handlers: {
        GET
      },
    },
    {
      path: "items/add",
      handlers: {
        POST
      },
    },
    {
      path: "items/delete",
      handlers: {
        DELETE
      },
    },
    {
      path: "items/edit",
      handlers: {
        POST: EDIT_ITEM,
      },
    },
    {
      path: "items/consumables",
      handlers: {
        GET: GET_CONSUMABLES
      },
    },
    {
      path: "favourites",
      handlers: {
        GET: GET_FAVOURITES,
        POST: CREATE_FAVOURITE,
        DELETE: DELETE_FAVOURITE,
      },
    },
  ],
};
