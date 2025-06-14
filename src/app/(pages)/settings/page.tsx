"use client";

import { useEffect, useState } from "react";
import { ChangeEvent, FormEvent } from "react";
import { signOut } from "next-auth/react";

// Types pour la session et les utilisateurs
interface User {
  id: string;
  name?: string;
  email: string;
  admin?: boolean;
}
interface Session {
  user: User;
}

export default function Settings() {
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch session info
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        if (data?.user) {
          setUserForm((f) => ({ ...f, name: data.user.name || "", email: data.user.email || "" }));
        }
        // If admin, fetch users
        if (data?.user?.admin) {
          setLoadingUsers(true);
          fetch("/api/admin/accounts")
            .then((res) => res.json())
            .then((users) => setUsers(users))
            .finally(() => setLoadingUsers(false));
        }
      });
  }, []);

  // Handlers for user info update
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleNameChange = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!session) return;
    const res = await fetch("/api/user/name/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.user.id, name: userForm.name }),
    });
    const data = await res.json();
    setMessage(data.message || data.error || "Name updated.");
  };

  const handleEmailChange = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!session) return;
    const res = await fetch("/api/admin/accounts/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(session.user.id), email: userForm.email }),
    });
    const data = await res.json();
    setMessage(data.message || data.error || "Email updated.");
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!session) return;
    if (userForm.password !== userForm.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    const res = await fetch("/api/user/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.user.id, password: userForm.password, confirmPassword: userForm.confirmPassword }),
    });
    const data = await res.json();
    setMessage(data.success ? "Password updated." : data.error || "Error updating password.");
  };

  if (!session) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-600 dark:text-gray-400">Loading...</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Admin Section - Site Users */}
      {session.user.admin && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Site users</h2>
          {loadingUsers ? (
            <div className="text-gray-500 dark:text-gray-400">Loading users...</div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {u.name || u.email}
                        {u.admin && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                            admin
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Information Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit my informations</h2>

        {message && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg">
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Username */}
          <form onSubmit={handleNameChange} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <div className="flex gap-3">
              <input
                name="name"
                value={userForm.name}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
          </form>

          {/* Email */}
          <form onSubmit={handleEmailChange} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="flex gap-3">
              <input
                name="email"
                type="email"
                value={userForm.email}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
          </form>

          {/* Password */}
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New password
            </label>
            <div className="space-y-3">
              <input
                name="password"
                type="password"
                value={userForm.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
              />
              {userForm.password && (
                <input
                  name="confirmPassword"
                  type="password"
                  value={userForm.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sign out</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sign out of your account on this device
        </p>
        <button
          onClick={(e) => { e.preventDefault(); signOut(); }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
