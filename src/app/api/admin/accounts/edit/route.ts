import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/utils/prisma";
import { authOptions } from "@/app/utils/auth";
import * as z from "zod";

// Schema validation for user updates
const userUpdateSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  admin: z.boolean().optional(),
});

export async function POST(req: Request) {
  // Check admin permission
  const session = await getServerSession(authOptions);

  if (!session?.user?.admin) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  try {
    // Parse and validate request body
    const body = await req.json();
    const { id, name, email, admin } = userUpdateSchema.parse(body);

    // Verify the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prepare update data (only include fields that are provided)
    const updateData: { name?: string; email?: string; admin?: boolean } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (admin !== undefined) updateData.admin = admin;

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Return the updated user (excluding password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: "User updated successfully",
      user: userWithoutPassword,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating user:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 }
    );
  }
}
