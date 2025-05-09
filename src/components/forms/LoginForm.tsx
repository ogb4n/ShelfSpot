"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });
        setLoading(false);
        if (res?.error) {
            setError("Email ou mot de passe incorrect.");
        } else if (res?.ok) {
            window.location.href = "/dashboard";
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 p-6 rounded shadow bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Connexion</h2>
            <label className="flex flex-col text-zinc-800 dark:text-zinc-200">
                Email
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </label>
            <label className="flex flex-col text-zinc-800 dark:text-zinc-200">
                Mot de passe
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </label>
            <button
                type="submit"
                className="bg-blue-600 dark:bg-blue-700 text-white rounded px-4 py-2 hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-60"
                disabled={loading}
            >
                {loading ? "Connexion..." : "Se connecter"}
            </button>
            {error && <div className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</div>}
        </form>
    );
}
