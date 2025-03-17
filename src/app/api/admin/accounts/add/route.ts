import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/utils/prisma";
import { authOptions } from "@/app/utils/auth";
import * as z from "zod";
import bcrypt from "bcrypt";

const newUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  name: z.string().optional(),
  admin: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.admin) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, password, name, admin } = newUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
      data: { email, password: hashedPassword, name, admin },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = createdUser;
    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}
