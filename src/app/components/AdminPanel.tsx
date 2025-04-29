"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loading from "./shared/Loading";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  admin: boolean | null;
  createdAt?: Date;
};

export const AdminPanel = () => {
  // Récupération des données de session de l'utilisateur
  const { data } = useSession();
  const [accounts, setAccounts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    name: "",
    admin: false,
  });

  useEffect(() => {
    async function fetchAccounts() {
      if (!data?.user?.admin) return;

      console.log(data);

      try {
        const response = await fetch("/api/admin/accounts");
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch accounts"
        );
        console.error("Error fetching accounts:", err);
      } finally {
        setLoading(false);
      }
    }

    if (data?.user?.admin) {
      fetchAccounts();
    }
  }, [data]);

  const handleEdit = (account: User) => {
    setEditingId(account.id);
    setEditForm({
      name: account.name,
      email: account.email,
      admin: account.admin,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (id: string) => {
    setSaveLoading(true);
    try {
      const response = await fetch("/api/admin/accounts/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...editForm }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const updatedAccount = await response.json();
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === id ? { ...account, ...updatedAccount } : account
        )
      );
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account");
      console.error("Error updating account:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewUserForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddUser = async () => {
    try {
      const res = await fetch("/api/admin/accounts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      // Refresh the accounts list
      const created = await res.json();
      setAccounts((prev) => [...prev, created.user]);
      setShowAddUserForm(false);
      setNewUserForm({ email: "", password: "", name: "", admin: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action is irreversible."
      )
    ) {
      return;
    }
    try {
      const res = await fetch("/api/admin/accounts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(userId) }),
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      setAccounts((prev) => prev.filter((acc) => acc.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  if (!data?.user?.admin) {
    return null;
  }

  return (
    <div className="mt-8 w-full">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Admin Panel
      </h2>
      <div className="h-px w-full bg-gray-700 mb-4"></div>

      <button
        className="px-4 py-2 mb-4 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
        onClick={() => setShowAddUserForm(!showAddUserForm)}
      >
        Add user
      </button>

      {showAddUserForm && (
        <div className="mb-4 space-y-2">
          <input
            className="p-2 w-full mb-2 bg-[#3a3a3a] text-white border border-gray-600 rounded-sm"
            placeholder="Email"
            name="email"
            value={newUserForm.email}
            onChange={handleAddUserChange}
          />
          <input
            className="p-2 w-full mb-2 bg-[#3a3a3a] text-white border border-gray-600 rounded-sm"
            placeholder="Password"
            name="password"
            type="password"
            value={newUserForm.password}
            onChange={handleAddUserChange}
          />
          <input
            className="p-2 w-full mb-2 bg-[#3a3a3a] text-white border border-gray-600 rounded-sm"
            placeholder="Name (optional)"
            name="name"
            value={newUserForm.name}
            onChange={handleAddUserChange}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="admin-checkbox"
              name="admin"
              checked={newUserForm.admin}
              onChange={handleAddUserChange}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="admin-checkbox" className="text-gray-300 cursor-pointer">Admin</label>
          </div>
          <button
            className="px-4 py-2 mt-2 bg-[#335C67] text-white rounded hover:bg-[#274956] transition-colors"
            onClick={handleAddUser}
          >
            Create User
          </button>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-3 text-white">
        User Accounts
      </h3>

      {error && (
        <div className="p-3 mb-4 bg-red-900/30 border border-red-500 text-red-300 rounded-sm">
          {error}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="w-full overflow-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#2a2a2a] sticky top-0">
              <tr className="border-b border-gray-700">
                <th className="p-2 text-left text-gray-300">ID</th>
                <th className="p-2 text-left text-gray-300">Name</th>
                <th className="p-2 text-left text-gray-300">Email</th>
                <th className="p-2 text-left text-gray-300">Admin</th>
                <th className="p-2 text-left text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <tr key={account.id} className="border-b border-gray-700 hover:bg-[#2a2a2a]">
                    <td className="p-2 text-gray-300">{account.id}</td>
                    <td className="p-2">
                      {editingId === account.id ? (
                        <input
                          className="p-1 w-full bg-[#3a3a3a] text-white border border-gray-600 rounded-sm"
                          name="name"
                          value={editForm.name ?? ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="text-gray-300">{account.name ?? "N/A"}</span>
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === account.id ? (
                        <input
                          className="p-1 w-full bg-[#3a3a3a] text-white border border-gray-600 rounded-sm"
                          name="email"
                          value={editForm.email ?? ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="text-gray-300">{account.email}</span>
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === account.id ? (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="admin"
                            checked={editForm.admin || false}
                            onChange={handleChange}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-300">{account.admin ? "Yes" : "No"}</span>
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === account.id ? (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-[#335C67] text-white rounded hover:bg-[#274956] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            onClick={() => handleSave(account.id)}
                            disabled={saveLoading}
                          >
                            {saveLoading && (
                              <span className="w-4 h-4">
                                <svg className="animate-spin w-full h-full" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="60 30" />
                                </svg>
                              </span>
                            )}
                            Save
                          </button>
                          <button
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={handleCancel}
                            disabled={saveLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            onClick={() => handleEdit(account)}
                          >
                            Edit
                          </button>
                          {account.id !== data?.user?.id && (
                            <button
                              className="px-3 py-1 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors"
                              onClick={() => handleDelete(account.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400">
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
