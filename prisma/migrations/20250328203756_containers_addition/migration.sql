-- CreateTable
CREATE TABLE "Container" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "roomId" INTEGER,
    "placeId" INTEGER,
    "itemId" INTEGER,
    CONSTRAINT "Container_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Container_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Container_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ContainerToItems" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ContainerToItems_A_fkey" FOREIGN KEY ("A") REFERENCES "Container" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContainerToItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Container_itemId_key" ON "Container"("itemId");

-- CreateIndex
CREATE INDEX "Container_roomId_idx" ON "Container"("roomId");

-- CreateIndex
CREATE INDEX "Container_placeId_idx" ON "Container"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "_ContainerToItems_AB_unique" ON "_ContainerToItems"("A", "B");

-- CreateIndex
CREATE INDEX "_ContainerToItems_B_index" ON "_ContainerToItems"("B");
