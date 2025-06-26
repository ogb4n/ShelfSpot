"use client";

import { useEffect, useState } from "react";
import { ChangeEvent, FormEvent } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth-context";
import { backendApi, BackendApiError } from "@/lib/backend-api";

// Types pour les utilisateurs
interface User {
  id: number;
  name?: string;
  email: string;
  admin?: boolean;
}

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");

  // États pour gérer l'expansion des sections
  const [expandedSections, setExpandedSections] = useState({
    users: false,
    personalInfo: false,
    signOut: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    if (user) {
      setUserForm((f) => ({ ...f, name: user.name || "", email: user.email || "" }));

      // If admin, fetch users
      if (user.admin) {
        setLoadingUsers(true);
        backendApi.getAllUsers()
          .then((users) => setUsers(users))
          .catch((error) => console.error('Failed to fetch users:', error))
          .finally(() => setLoadingUsers(false));
      }
    }
  }, [user]);

  // Handlers for user info update
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleNameChange = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!user) return;

    try {
      await backendApi.updateProfile(userForm.name);
      await refreshUser(); // Refresh user data
      setMessage("Name updated successfully");
    } catch (error) {
      if (error instanceof BackendApiError) {
        setMessage(error.message);
      } else {
        setMessage("Error updating name");
      }
    }
  };

  const handleEmailChange = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!user) return;

    try {
      await backendApi.updateUser(user.id, { email: userForm.email });
      await refreshUser(); // Refresh user data
      setMessage("Email updated successfully");
    } catch (error) {
      if (error instanceof BackendApiError) {
        setMessage(error.message);
      } else {
        setMessage("Error updating email");
      }
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!user) return;

    if (userForm.password !== userForm.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await backendApi.resetPassword(user.email, userForm.password);
      setMessage("Password updated successfully");
      setUserForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error) {
      if (error instanceof BackendApiError) {
        setMessage(error.message);
      } else {
        setMessage("Error updating password");
      }
    }
  };

  if (!user) return (
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
      {user.admin && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <button
            onClick={() => toggleSection('users')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg"
          >
            <div className="text-left">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Site users</h2>
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                  admin
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Manage and view all registered users
              </p>
            </div>
            {expandedSections.users ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSections.users && (
            <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
              <div className="pt-4">
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
            </div>
          )}
        </div>
      )}

      {/* User Information Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => toggleSection('personalInfo')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg"
        >
          <div className="text-left">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Update your username and email address
            </p>
          </div>
          {expandedSections.personalInfo ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {expandedSections.personalInfo && (
          <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
            <div className="pt-4">
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign Out Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => toggleSection('signOut')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg"
        >
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account & Security</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Manage your session and account security settings
            </p>
          </div>
          {expandedSections.signOut ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {expandedSections.signOut && (
          <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
            <div className="pt-4 space-y-6">
              {message && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg">
                  {message}
                </div>
              )}

              {/* Change Password */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Change Password</h4>
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
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Session Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Current Session</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user?.name || user?.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Logged in • Active session
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">This device</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign Out Options */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Sign Out</h4>
                <div className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Signing out will end your current session. You&apos;ll need to sign in again to access your account.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => { e.preventDefault(); logout(); }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                    <button
                      onClick={() => toggleSection('signOut')}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
