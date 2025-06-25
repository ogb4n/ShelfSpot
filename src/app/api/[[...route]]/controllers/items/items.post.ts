import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';
import { Item } from "@/app/types";
import { sendTriggeredAlerts } from "@/lib/email";


async function checkItemAlerts(itemId: number) {
  try {
    // Récupérer l'item avec sa quantité actuelle
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) return;

    // Récupérer les alertes actives pour cet item
    const alerts = await prisma.alert.findMany({
      where: {
        itemId: itemId,
        isActive: true,
      },
    });

    // Filtrer les alertes déclenchées (quantity <= threshold)
    const triggeredAlerts = alerts.filter(alert => item.quantity <= alert.threshold);

    if (triggeredAlerts.length === 0) return;

    // Filtrer les alertes qui n'ont pas été envoyées récemment (moins de 24h)
    const now = new Date();
    const alertsToSend = triggeredAlerts.filter(alert => {
      if (!alert.lastSent) return true;
      
      const lastSent = new Date(alert.lastSent);
      const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
      
      return hoursSinceLastSent >= 24;
    });

    if (alertsToSend.length === 0) return;

    // Envoyer l'email
    await sendTriggeredAlerts(
      alertsToSend.map(alert => ({
        alert: {
          id: alert.id,
          itemId: alert.itemId,
          threshold: alert.threshold,
          name: alert.name,
          isActive: alert.isActive,
          lastSent: alert.lastSent?.toISOString(),
          createdAt: alert.createdAt.toISOString(),
          updatedAt: alert.updatedAt.toISOString(),
        },
        item: {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          status: item.status,
          itemLink: item.itemLink,
        },
      }))
    );

    // Mettre à jour la date du dernier envoi
    await prisma.alert.updateMany({
      where: {
        id: {
          in: alertsToSend.map(alert => alert.id),
        },
      },
      data: {
        lastSent: now,
      },
    });

    console.log(`Sent ${alertsToSend.length} alert(s) for item ${item.name}`);
  } catch (error) {
    console.error('Error checking item alerts:', error);
    // Ne pas interrompre le processus principal si les alertes échouent
  }
}

export async function POST(request: NextRequest) {
 try {
            const { name, quantity, status, roomId, placeId, containerId, tags, consumable, itemLink }: Item =
              await request.json();

            if (!name || !roomId) {
              return NextResponse.json(
                { error: "The fields 'name' and 'roomId' are required." },
                { status: 400 }
              );
            }

            if (placeId) {
              const placeExists = await prisma.place.findUnique({
                where: { id: placeId },
              });
              if (!placeExists) {
                return NextResponse.json(
                  { error: `Place with ID ${placeId} does not exist.` },
                  { status: 404 }
                );
              }
            }

            const item = await prisma.item.create({
              data: {
                name: name,
                quantity: quantity,
                status: status,
                consumable: consumable, // Ajout du champ consumable
                itemTags: {
                  create: tags?.map((tag) => ({
                    tag: {
                      connectOrCreate: {
                        where: { name: tag },
                        create: { name: tag },
                      },
                    },
                  })),
                },
                room: roomId ? { connect: { id: roomId } } : undefined,
                place: placeId ? { connect: { id: placeId } } : undefined,
                container: containerId ? { connect: { id: containerId } } : undefined,
              },
              include: {
                room: true,
                place: true,
                container: true,
              },
            });

            return NextResponse.json(item);
          } catch (error) {
            console.error("Error creating item:", error);
            return NextResponse.json(
              { error: "Failed to create item. Please try again later." },
              { status: 500 }
            );
          }
}

export async function EDIT_ITEM(request: NextRequest) {
  const body = await request.json();
          if (!body || typeof body !== "object") {
            return NextResponse.json(
              { error: "Invalid request body" },
              { status: 400 }
            );
          }

          try {
            // Correction : utiliser l'id si disponible, sinon le nom (string)
            let place;
            if (typeof body.placeId === "number") {
              place = await prisma.place.findUniqueOrThrow({
                where: { id: body.placeId },
              });
            } else if (typeof body.place === "string") {
              place = await prisma.place.findFirstOrThrow({
                where: { name: body.place },
              });
            } else {
              return NextResponse.json(
                { error: "A valid placeId or place name must be provided." },
                { status: 400 }
              );
            }
            let room;
            if (typeof body.roomId === "number") {
              room = await prisma.room.findUniqueOrThrow({
                where: { id: body.roomId },
              });
            } else if (typeof body.room === "string") {
              room = await prisma.room.findFirstOrThrow({
                where: { name: body.room },
              });
            } else {
              return NextResponse.json(
                { error: "A valid roomId or room name must be provided." },
                { status: 400 }
              );
            }
            
            // Prepare update data
            const updateData: Record<string, unknown> = {
              name: body.name ?? "",
              quantity: Number(body.quantity) || 0,
              place: {
                connect: { id: place.id },
              },
              room: {
                connect: { id: room.id },
              },
              status: body.status ?? "",
            };
            
            // Only include container connection if containerId is defined
            if (body.containerId && body.containerId !== undefined) {
              updateData.container = {
                connect: { id: body.containerId }
              };
            } else {
              // If no container is selected, disconnect any existing container
              updateData.container = {
                disconnect: true
              };
            }
            
            const item = await prisma.item.update({
              where: { id: body.id },
              data: updateData,
            });

            // Vérifier et déclencher les alertes pour l'item modifié
            await checkItemAlerts(body.id);

            return NextResponse.json(item);
          } catch (error) {
            console.error("Error updating item:", error);
            return NextResponse.json(
              { error: "An error occurred while updating the item." },
              { status: 500 }
            );
          }
        }
export async function CREATE_FAVOURITE(request: NextRequest) {
  try {
    const { itemId, userName } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "The field 'itemId' is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        name: userName,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const favourite = await prisma.favourite.create({
      data: {
        itemId: itemId,
        userId: user.id,
      },
    });

    return NextResponse.json(favourite);
  } catch (error) {
    console.error("Error creating favourite:", error);
    return NextResponse.json(
      { error: "Failed to create favourite." },
      { status: 500 }
    );
  }
}