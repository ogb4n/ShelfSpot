"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Link,
} from "@mui/material";
import { useRouter } from "next/navigation";
import theme from "@/app/theme";

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
    <Box
      component="form"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      sx={{ maxWidth: 400, mx: "auto", mt: 4 }}
    >
      <Typography variant="h4" component="h1" textAlign="center" mb={3}>
        Account creation
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Nom d'utilisateur"
          variant="outlined"
          {...form.register("username")}
          error={!!form.formState.errors.username}
          helperText={form.formState.errors.username?.message}
          fullWidth
        />
        <TextField
          label="Adresse email"
          variant="outlined"
          {...form.register("email")}
          error={!!form.formState.errors.email}
          helperText={form.formState.errors.email?.message}
          fullWidth
        />
        <TextField
          label="Mot de passe"
          type="password"
          variant="outlined"
          {...form.register("password")}
          error={!!form.formState.errors.password}
          helperText={form.formState.errors.password?.message}
          fullWidth
        />
        <TextField
          label="Confirmation du mot de passe"
          type="password"
          variant="outlined"
          {...form.register("confirmPassword")}
          error={!!form.formState.errors.confirmPassword}
          helperText={form.formState.errors.confirmPassword?.message}
          fullWidth
        />
      </Box>
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: theme.colorSchemes.dark.palette.primary[500],
          mt: 3,
        }}
      >
        Register
      </Button>
      <Divider sx={{ my: 2 }}>or</Divider>
      <Typography textAlign="center" variant="body2">
        I already have an account to{" "}
        <Link href="/login" underline="hover">
          log in
        </Link>
      </Typography>
    </Box>
  );
};

export default SignUpForm;
