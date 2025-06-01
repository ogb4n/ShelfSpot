"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { BorderBeam } from "../magicui/border-beam";

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
            setError("Incorrect email or password.");
        } else if (res?.ok) {
            window.location.href = "/dashboard";
        }
    };

    return (
        <div className="relative w-80">
            <div
                className="glass-card relative overflow-hidden rounded-2xl shadow-lg border border-white/20 backdrop-blur-md bg-white/10 dark:bg-black/20"
                style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", borderRadius: "1.25rem" }}
            >
                <BorderBeam size={80} duration={7} colorFrom="#34d056" colorTo="#208336" className="z-10" />
                {/* Glassmorphic login form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full p-6 relative z-20">
                    <h2 className="text-xl font-bold mb-2">Sign in</h2>
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
                        Password
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
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                    {error && <div className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</div>}
                </form>
            </div>
        </div>
    );
}
