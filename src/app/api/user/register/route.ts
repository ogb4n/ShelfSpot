import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";
import { hash } from "bcrypt";
import * as z from "zod";

//validation schema

const userSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(5, { message: "Username must be at least 5 characters long" })
      .max(32, { message: "Username must be at most 32 characters long" }),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .max(32, "Password must be at most 32 characters long"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, username } = userSchema.parse(body);

    //check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return NextResponse.json(
        { user: null, message: "Account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);
    const NewUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: username,
        createdAt: new Date(),
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: newUserPassword, ...rest } = NewUser;

    return NextResponse.json(
      { user: rest, message: "New User Registered" },
      { status: 201 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: "Something went wrong ", error: error.message },
      { status: 500 }
    );
  }
}
