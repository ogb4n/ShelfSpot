// Simple SignUpForm de base pour corriger l'erreur d'import
"use client";
import React, { useState } from "react";

export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [nameError, setNameError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setNameError("");
        if (name.length < 5) {
            setNameError("Le nom d'utilisateur doit contenir au moins 5 caractères.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: name,
                    email,
                    password,
                    confirmPassword,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Inscription réussie ! Vous pouvez vous connecter.");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setName("");
            } else {
                setMessage(data.message || data.error || "Erreur lors de l'inscription");
            }
        } catch {
            setMessage("Erreur réseau ou serveur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 p-6 rounded shadow bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Créer un compte</h2>
            <label className="flex flex-col text-zinc-800 dark:text-zinc-200">
                Nom
                <input
                    type="text"
                    placeholder="Nom"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                {nameError && <span className="text-red-600 text-xs mt-1">{nameError}</span>}
            </label>
            <label className="flex flex-col text-zinc-800 dark:text-zinc-200">
                Email
                <input
                    type="email"
                    placeholder="Email"
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
                    placeholder="Mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </label>
            <label className="flex flex-col text-zinc-800 dark:text-zinc-200">
                Confirmer le mot de passe
                <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </label>
            <button type="submit" className="bg-blue-600 dark:bg-blue-700 text-white rounded px-4 py-2 hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors" disabled={loading}>
                {loading ? "Inscription..." : "S'inscrire"}
            </button>
            {message && <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">{message}</div>}
        </form>
    );
}
