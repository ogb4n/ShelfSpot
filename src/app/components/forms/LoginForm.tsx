"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const FormSchema = z.object({
  email: z
    .string()
    .min(1, "Un pseudo est requis")
    .min(5, "Le pseudo doit faire au moins 5 caractères")
    .max(32, "Le pseudo doit faire moins de 32 caractères"),
  password: z
    .string()
    .min(1, "Un mot de passe est requis")
    .min(8, "Le mot de passe doit faire au moins 8 caractères")
    .max(32, "Le mot de passe doit faire moins de 32 caractères"),
});

export const LoginForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const signInData = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (signInData?.error) {
      console.log(signInData.error);
    } else {
      router.push("/");
      console.log("Signed in");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-md mx-auto mt-8 p-6 bg-[#2a2a2a] rounded-md"
    >
      <h1 className="text-2xl font-bold mb-6 text-center text-white">
        Login
      </h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <input
            className="p-2 bg-[#3a3a3a] text-white border border-gray-600 rounded-sm w-full"
            placeholder="Email"
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
            type="password"
            className="p-2 bg-[#3a3a3a] text-white border border-gray-600 rounded-sm w-full"
            placeholder="Password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <span className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </span>
          )}
        </div>
      </div>
      <button
        type="submit"
        className="w-full mt-6 p-2 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
      >
        Login
      </button>
    </form>
  );
};
