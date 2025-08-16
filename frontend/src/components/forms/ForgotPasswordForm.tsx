"use client";
import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { BackendApiError } from "@/lib/backend-api";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            await forgotPassword(email);
            setMessage(
                "If an account with this email exists, a temporary password has been sent to your email address."
            );
            setEmail("");
        } catch (error) {
            if (error instanceof BackendApiError) {
                setError(error.message);
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
                    <h2 className="text-xl font-bold mb-2">Forgot Password</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Enter your email address and we&apos;ll send you a temporary password.
                    </p>

                    <label className="flex flex-col">
                        Email
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 transition-colors disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Temporary Password"}
                    </button>

                    {message && (
                        <div className="text-sm text-green-600 dark:text-green-400 mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-600 dark:text-red-400 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="text-center mt-4">
                        <a
                            href="/login"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Back to Sign In
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}