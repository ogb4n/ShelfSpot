import { prisma } from "@/app/utils/prisma";
import { ApiModule } from "../types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/auth";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import * as z from "zod";

export const adminModule: ApiModule = {
  routes: [
    {
      path: "admin/accounts",
      handlers: {
        GET: async () => {
          const session = await getServerSession(authOptions);
          if (!session?.user?.admin) {
            return NextResponse.json(
              { message: "Access denied" },
              { status: 403 }
            );
          }

          try {
            const accounts = await prisma.user.findMany();
            return NextResponse.json(accounts);
          } catch (error) {
            return NextResponse.json(
              { message: `Internal server error : ${error}` },
              { status: 500 }
            );
          }
        },
      },
    },
    {
      path: "admin/accounts/add",
      handlers: {
        POST: async (req) => {
          const newUserSchema = z.object({
            email: z.string().email(),
            password: z.string().min(4),
            name: z.string().optional(),
            admin: z.boolean().optional(),
          });
          const session = await getServerSession(authOptions);
          if (!session?.user?.admin) {
            return NextResponse.json(
              { message: "Access denied" },
              { status: 403 }
            );
          }

          try {
            const body = await req.json();
            const { email, password, name, admin } = newUserSchema.parse(body);

            const existingUser = await prisma.user.findUnique({
              where: { email },
            });
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
              {
                message: "User created successfully",
                user: userWithoutPassword,
              },
              { status: 201 }
            );
          } catch {
            return NextResponse.json(
              { message: "Failed to create user" },
              { status: 500 }
            );
          }
        },
      },
    },
    {
      path: "admin/accounts/delete",
      handlers: {
        DELETE: async (req) => {
          const userDeleteSchema = z.object({
            id: z.number(),
          });
          const session = await getServerSession(authOptions);
          if (!session?.user?.admin) {
            return NextResponse.json(
              { message: "Access denied" },
              { status: 403 }
            );
          }

          try {
            const { id } = userDeleteSchema.parse(await req.json());
            const existingUser = await prisma.user.findUnique({
              where: { id },
            });
            if (!existingUser) {
              return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
              );
            }
            await prisma.user.delete({ where: { id } });
            return NextResponse.json({ message: "User deleted successfully" });
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "An unknown error occurred";
            return NextResponse.json(
              { message: errorMessage },
              { status: 500 }
            );
          }
        },
      },
    },
    {
      path: "admin/accounts/edit",
      handlers: {
        PUT: async (req) => {
          const userUpdateSchema = z.object({
            id: z.number(),
            name: z.string().optional(),
            email: z.string().email().optional(),
            password: z.string().min(4).optional(),
            admin: z.boolean().optional(),
          });
          const session = await getServerSession(authOptions);
          if (!session?.user?.admin) {
            return NextResponse.json(
              { message: "Access denied" },
              { status: 403 }
            );
          }

          try {
            const { id, ...data } = userUpdateSchema.parse(await req.json());
            const existingUser = await prisma.user.findUnique({
              where: { id },
            });
            if (!existingUser) {
              return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
              );
            }
            if (data.password) {
              data.password = await bcrypt.hash(data.password, 10);
            }
            const updatedUser = await prisma.user.update({
              where: { id },
              data,
            });
            return NextResponse.json({
              message: "User updated successfully",
              user: updatedUser,
            });
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "An unknown error occurred";
            return NextResponse.json(
              { message: errorMessage },
              { status: 500 }
            );
          }
        },
      },
    },
  ],
};
