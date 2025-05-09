"use server";
import React from "react";
import LoginForm from "@/components/forms/LoginForm";

export default async function RegisterPage() {
  return (
    <>
      <header></header>
      <main className="flex min-h-screen items-center justify-center p-24">
        <LoginForm />
      </main>
    </>
  );
}
