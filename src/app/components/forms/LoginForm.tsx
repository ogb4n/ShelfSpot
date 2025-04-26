"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, TextField, Typography, Box } from "@mui/material";
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
    <Box
      component="form"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      sx={{ maxWidth: 400, mx: "auto", mt: 4 }}
    >
      <Typography variant="h4" component="h1" textAlign="center" mb={3}>
        Login
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Email"
          variant="outlined"
          {...form.register("email")}
          error={!!form.formState.errors.email}
          helperText={form.formState.errors.email?.message}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          {...form.register("password")}
          error={!!form.formState.errors.password}
          helperText={form.formState.errors.password?.message}
          fullWidth
        />
      </Box>
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          mt: 3,
        }}
      >
        Login
      </Button>
    </Box>
  );
};
