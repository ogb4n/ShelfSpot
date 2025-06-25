import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") as string, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const item = await prisma.item.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

export async function DELETE_FAVOURITE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const itemId = parseInt(searchParams.get("id") as string, 10);

  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  try {
    // First find the favorite entry by itemId
    const favorite = await prisma.favourite.findFirst({
      where: {
        itemId: itemId,
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    // Then delete the favorite entry
    await prisma.favourite.delete({
      where: {
        id: favorite.id,
      },
    });

    return NextResponse.json({ message: "Favorite deleted successfully" });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    return NextResponse.json(
      { error: "Failed to delete favorite" },
      { status: 500 }
    );
  }
}