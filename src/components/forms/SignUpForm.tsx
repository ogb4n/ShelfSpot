// Simple SignUpForm de base pour corriger l'erreur d'import
"use client";
import React, { useState } from "react";

export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("Inscription non implémentée (exemple de formulaire)");
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
            <button type="submit" className="bg-blue-600 dark:bg-blue-700 text-white rounded px-4 py-2 hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">S&apos;inscrire</button>
            {message && <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">{message}</div>}
        </form>
    );
}
