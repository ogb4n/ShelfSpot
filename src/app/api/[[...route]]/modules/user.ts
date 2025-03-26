// app/api/[[...route]]/modules/user.ts - Module pour les routes d'utilisateur

import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";
import bcrypt, { hash } from "bcrypt";
import * as z from "zod";

export const userModule: ApiModule = {
  routes: [
    {
      path: "user",
      handlers: {
        GET: async (req) => {
          try {
            const { searchParams } = new URL(req.url);
            const userId = searchParams.get("id");

            if (!userId) {
              return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
              );
            }

            const user = await prisma.user.findUnique({
              where: { id: parseInt(userId) },
            });

            if (!user) {
              return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
              );
            }

            return NextResponse.json(user);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            console.error("Error fetching user:", error);
            return NextResponse.json(
              {
                error: "Failed to fetch user.",
                details:
                  error instanceof Error ? error.message : "Unknown error",
              },
              { status: 500 }
            );
          }
        },
      },
    },
    {
      path: "user/register",
      handlers: {
        POST: async (req) => {
          const userSchema = z
            .object({
              username: z
                .string()
                .min(1, "Username is required")
                .min(5, {
                  message: "Username must be at least 5 characters long",
                })
                .max(32, {
                  message: "Username must be at most 32 characters long",
                }),
              email: z
                .string()
                .min(1, "Email is required")
                .email("Invalid email"),
              password: z
                .string()
                .min(1, "Password is required")
                .min(8, "Password must be at least 8 characters long")
                .max(32, "Password must be at most 32 characters long"),
              confirmPassword: z
                .string()
                .min(1, "Confirm Password is required"),
            })
            .refine((data) => data.password === data.confirmPassword, {
              path: ["confirmPassword"],
              message: "Passwords do not match",
            });

          try {
            const body = await req.json();
            const { email, password, username } = userSchema.parse(body);

            //check if email exists
            const existingUser = await prisma.user.findUnique({
              where: { email: email },
            });
            if (existingUser) {
              return NextResponse.json(
                {
                  user: null,
                  message: "Account with this email already exists",
                },
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
        },
      },
    },
    {
      path: "user/password/reset",
      handlers: {
        POST: async (req) => {
          const { password, confirmPassword, userId } = await req.json();
          if (!password || !confirmPassword || password !== confirmPassword) {
            return new NextResponse(
              JSON.stringify({ error: "Passwords do not match" }),
              {
                status: 400,
              }
            );
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
          });
          return new NextResponse(JSON.stringify({ success: true }), {
            status: 200,
          });
        },
      },
    },
    {
      path: "user/name/edit",
      handlers: {
        POST: async (req) => {
          try {
            const { userId, name } = await req.json();

            if (!name) {
              return NextResponse.json(
                { error: "Le nom est requis." },
                { status: 400 }
              );
            }
            const updatedUser = await prisma.user.update({
              where: {
                id: userId,
              },
              data: {
                name: name,
              },
            });

            return NextResponse.json(
              { message: "Nom mis à jour avec succès.", user: updatedUser },
              { status: 200 }
            );
          } catch (error) {
            console.error("Error updating user name:", error);
            return NextResponse.json(
              {
                error: "Une erreur est survenue lors de la mise à jour du nom.",
              },
              { status: 500 }
            );
          } finally {
            await prisma.$disconnect();
          }
        },
      },
    },
  ],
};
