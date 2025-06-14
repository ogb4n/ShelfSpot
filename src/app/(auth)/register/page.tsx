"use server";
import React from "react";
import SignUpForm from "@/components/forms/SignUpForm";

export default async function RegisterPage() {
  return (
    <>
      <header></header>
      <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md flex flex-col items-center justify-center">
          <h1 className="mb-12 mt-8 text-6xl text-primary font-bold">Shelfspot</h1>
          <SignUpForm />
        </div>
      </main>
    </>
  );
}
