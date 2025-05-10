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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 p-6 rounded shadow theme-card theme-border">
            <h2 className="text-xl font-bold mb-2">Connexion</h2>
            <label className="flex flex-col">
                Email
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="theme-input rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
            </label>
            <label className="flex flex-col">
                Mot de passe
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="theme-input rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
            </label>
            <button
                type="submit"
                className="theme-primary rounded px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
                disabled={loading}
            >
                {loading ? "Connexion..." : "Se connecter"}
            </button>
            {error && <div className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</div>}
        </form>
    );
}
