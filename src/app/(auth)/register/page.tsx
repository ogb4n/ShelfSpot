"use server";
import React from "react";
import SignUpForm from "@/app/components/forms/SignUpForm";

export default async function RegisterPage() {
  return (
    <>
      <header></header>
      <main className="flex min-h-screen items-center justify-center p-24">
        <SignUpForm />
      </main>
    </>
  );
}
