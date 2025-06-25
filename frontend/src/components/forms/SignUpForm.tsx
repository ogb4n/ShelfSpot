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
            setNameError("Username must be at least 5 characters long.");
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
                setMessage("Registration successful! You can now log in.");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setName("");
            } else {
                setMessage(data.message || data.error || "Registration error");
            }
        } catch {
            setMessage("Network or server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-80">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full p-6">
                    <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Create an account</h2>
                    <label className="flex flex-col text-zinc-800 dark:text-zinc-200">
                        Username
                        <input
                            type="text"
                            placeholder="Username"
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
                        Password
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>
                    <label className="flex flex-col text-zinc-800 dark:text-zinc-200">
                        Confirm password
                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>
                    <button type="submit" className="bg-blue-600 dark:bg-blue-700 text-white rounded px-4 py-2 hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors" disabled={loading}>
                        {loading ? "Registering..." : "Sign up"}
                    </button>
                    {message && <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">{message}</div>}
                </form>
            </div>
        </div>
    );
}
