"use server";
import React from "react";
import SignUpForm from "@/components/forms/SignUpForm";
import { BubbleBackground } from "@/components/animate-ui/backgrounds/bubble";
import { HyperText } from "@/components/magicui/hyper-text";

export default async function RegisterPage() {
  return (
    <>
      <header></header>
      <main className="fixed inset-0 min-h-screen min-w-full flex items-center justify-center p-0 overflow-hidden">
        <BubbleBackground
          interactive
          className="absolute inset-0 w-full h-full -z-10 overflow-hidden"
        />
        <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center">
          <HyperText className="mb-12 mt-8 text-6xl text-primary drop-shadow-lg">Shelfspot</HyperText>
          <SignUpForm />
        </div>
      </main>
    </>
  );
}
