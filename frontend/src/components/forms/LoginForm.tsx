"use client";
import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { BackendApiError } from "@/lib/backend-api";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        console.log("LoginForm: Starting login process", { email });

        try {
            await login(email, password);
            console.log("LoginForm: Login successful, redirecting to dashboard");
            // Rediriger vers le dashboard
            window.location.href = "/dashboard";
        } catch (error) {
            console.error("LoginForm: Login failed", error);
            if (error instanceof BackendApiError) {
                setError("Incorrect email or password.");
            } else {
                setError("Network or server error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-80">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full p-6">
                    <h2 className="text-xl font-bold mb-2">Sign in</h2>
                    <label className="flex flex-col">
                        Email
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>
                    <label className="flex flex-col">
                        Password
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 transition-colors disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                    {error && <div className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</div>}
                </form>
            </div>
        </div>
    );
}
