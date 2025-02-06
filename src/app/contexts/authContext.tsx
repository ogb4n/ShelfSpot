"use client";
import { createContext, ReactNode, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AuthContext = createContext({ isLoggedIn: false });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useSession();
  const router = useRouter();
  const isLoggedIn = !!data?.user;
  const value = useMemo(() => ({ isLoggedIn }), [isLoggedIn]);

  useEffect(() => {
    if (!data?.user) {
      router.push("/login");
    }
  }, [data?.user, router]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
