"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FormSchema = z
  .object({
    username: z
      .string()
      .min(1, "Un pseudo est requis")
      .min(5, "Le pseudo doit faire au moins 5 caractères")
      .max(32, "Le pseudo doit faire moins de 32 caractères"),
    email: z
      .string()
      .min(1, "Un email est requis")
      .email("L'email n'est pas valide"),
    password: z
      .string()
      .min(1, "Un mot de passe est requis")
      .min(8, "Le mot de passe doit faire au moins 8 caractères")
      .max(32, "Le mot de passe doit faire moins de 32 caractères"),
    confirmPassword: z
      .string()
      .min(1, "La confirmation du mot de passe est requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const response = await fetch("/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      router.push("/login");
    } else {
      console.error("Registration failed");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-md mx-auto mt-8 p-6 bg-[#2a2a2a] rounded-md"
    >
      <h1 className="text-2xl font-bold mb-6 text-center text-white">
        Account creation
      </h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <input
            className="p-2 bg-[#3a3a3a] text-white border border-gray-600 rounded-sm w-full"
            placeholder="Username"
            {...form.register("username")}
          />
          {form.formState.errors.username && (
            <span className="text-sm text-red-500">
              {form.formState.errors.username.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <input
            className="p-2 bg-[#3a3a3a] text-white border border-gray-600 rounded-sm w-full"
            placeholder="Email Address"
            type="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <span className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <input
            className="p-2 bg-[#3a3a3a] text-white border border-gray-600 rounded-sm w-full"
            placeholder="Password"
            type="password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <span className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <input
            className="p-2 bg-[#3a3a3a] text-white border border-gray-600 rounded-sm w-full"
            placeholder="Confirm your password"
            type="password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <span className="text-sm text-red-500">
              {form.formState.errors.confirmPassword.message}
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-6 p-2 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
      >
        Register
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#2a2a2a] text-gray-400">or</span>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400">
        I already have an account to{" "}
        <Link href="/login" className="text-[#335C67] hover:underline">
          log in
        </Link>
      </p>
    </form>
  );
};

export default SignUpForm;
