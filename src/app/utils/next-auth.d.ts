import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      admin?: boolean | null;
    };
  }

  interface User {
    admin?: boolean | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    admin?: boolean | null;
  }
}
