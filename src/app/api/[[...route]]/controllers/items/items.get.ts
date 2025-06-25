import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
          const id = searchParams.get("id");
          const search = searchParams.get("search")?.trim() || "";
          if (id) {
            try {
              const item = await prisma.item.findUnique({
                where: { id: Number(id) },
                include: {
                  room: true,
                  place: true,
                  container: true,
                  itemTags: { include: { tag: true } },
                },
              });
              if (!item) {
                return NextResponse.json({ error: "Item not found" }, { status: 404 });
              }
              return NextResponse.json({
                ...item,
                tags: item.itemTags ? item.itemTags.map((itemTag) => itemTag.tag.name) : [],
                itemTags: undefined,
              });
            } catch {
              // error is intentionally ignored, handled by the return statement below
              return NextResponse.json({ error: "Failed to fetch item." }, { status: 500 });
            }
          }
          try {
            const items = await prisma.item.findMany({
              include: {
                room: true,
                place: true,
                container: true,
                itemTags: {
                  include: {
                    tag: true,
                  },
                },
              },
            });

            // Filtrage avancé côté serveur si search est présent
            let filteredItems = items;
            if (search) {
              const normalize = (str: unknown) => (str as string).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
              const searchWords = (normalize(search) as string).split(/\s+/).filter(Boolean);
              filteredItems = items.filter((item) => {
                const fields = [
                  item.name,
                  item.status,
                  item.room?.name,
                  item.place?.name,
                  item.container?.name,
                  ...(item.itemTags?.map((t) => t.tag.name) || [])
                ].filter(Boolean).map(normalize);
                return searchWords.every(word =>
                  fields.some(field => (field as string).includes(word))
                );
              });
            }

            const transformedItems = filteredItems.map((item) => ({
              ...item,
              tags: item.itemTags.map((itemTag) => itemTag.tag.name),
              itemTags: undefined,
            }));
            return NextResponse.json(transformedItems);
          } catch (error) {
            console.error("Error fetching items:", error);

            return NextResponse.json(
              {
                error: "Failed to fetch items.",
                details:
                  error instanceof Error ? error.message : "Unknown error",
              },
              { status: 500 }
            );
          }
        }

export async function GET_CONSUMABLES(request: NextRequest) {
    try {
      const consumables = await prisma.item.findMany({
        where: {
          consumable: true,
        },
        include: {
          room: true,
          place: true,
          container: true,
          itemTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      const transformedConsumables = consumables.map((item) => ({
        ...item,
        tags: item.itemTags ? item.itemTags.map((itemTag) => itemTag.tag.name) : [],
        itemTags: undefined,
      }));

      return NextResponse.json(transformedConsumables);
    } catch (error) {
      console.error("Error fetching consumables:", error);
      return NextResponse.json(
        { error: "Failed to fetch consumables." },
        { status: 500 }
      );
    }
  }

export async function GET_FAVOURITES(request: NextRequest) {
    try {
      const favourites = await prisma.favourite.findMany({
        include: {
          item: {
            include: {
              room: true,
              place: true,
              container: true,
              itemTags: { include: { tag: true } },
            },
          },
        },
      });

      // Transforme chaque item pour avoir tags (array de string) et itemTags: undefined
      const transformedFavourites = favourites.map(fav => ({
        ...fav,
        item: fav.item ? {
          ...fav.item,
          tags: fav.item.itemTags ? fav.item.itemTags.map((itemTag) => itemTag.tag.name) : [],
          itemTags: undefined,
        } : null,
      }));

      return NextResponse.json(transformedFavourites);
    } catch (error) {
      console.error("Error fetching favourites:", error);
      return NextResponse.json(
        { error: "Failed to fetch favourites." },
        { status: 500 }
      );
    }
  }