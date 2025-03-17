import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

// Extend the built-in types
declare module "next-auth" {
  interface User {
    admin?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      admin?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    admin?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jhon@mail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const existingUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!existingUser) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          existingUser.password
        );
        if (!passwordMatch) return null;

        return {
          id: String(existingUser.id),
          email: existingUser.email,
          name: existingUser.name,
          admin: existingUser.admin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          admin: user.admin, // Ajout de l'attribut admin ici
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id,
          name: token.name,
          email: token.email,
          admin: token.admin, // Transfert de l'attribut admin du token à la session
        },
      };
    },
  },
};
