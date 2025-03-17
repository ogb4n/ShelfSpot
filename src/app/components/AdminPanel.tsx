"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  Sheet,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Input,
  Checkbox,
} from "@mui/joy";
import { useSession } from "next-auth/react";

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
  }, [data?.user?.admin]);

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
    <Box sx={{ mt: 4, width: "100%" }}>
      <Typography level="h4" sx={{ mb: 2, fontWeight: "bold" }}>
        Admin Panel
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Button
        variant="solid"
        color="primary"
        onClick={() => setShowAddUserForm(!showAddUserForm)}
        sx={{ mb: 2 }}
      >
        Add user
      </Button>

      {showAddUserForm && (
        <Box sx={{ mb: 2 }}>
          <Input
            placeholder="Email"
            name="email"
            value={newUserForm.email}
            onChange={handleAddUserChange}
            sx={{ mb: 1 }}
          />
          <Input
            placeholder="Password"
            name="password"
            type="password"
            value={newUserForm.password}
            onChange={handleAddUserChange}
            sx={{ mb: 1 }}
          />
          <Input
            placeholder="Name (optional)"
            name="name"
            value={newUserForm.name}
            onChange={handleAddUserChange}
            sx={{ mb: 1 }}
          />
          <Checkbox
            name="admin"
            checked={newUserForm.admin}
            onChange={handleAddUserChange}
            label="Admin"
            sx={{ mb: 1 }}
          />
          <Button onClick={handleAddUser}>Create User</Button>
        </Box>
      )}

      <Typography level="title-md" sx={{ mb: 2 }}>
        User Accounts
      </Typography>

      {error && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Sheet sx={{ width: "100%", overflow: "auto" }}>
          <Table stickyHeader>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.id}</td>
                    <td>
                      {editingId === account.id ? (
                        <Input
                          size="sm"
                          name="name"
                          value={editForm.name ?? ""}
                          onChange={handleChange}
                        />
                      ) : (
                        account.name ?? "N/A"
                      )}
                    </td>
                    <td>
                      {editingId === account.id ? (
                        <Input
                          size="sm"
                          name="email"
                          value={editForm.email ?? ""}
                          onChange={handleChange}
                        />
                      ) : (
                        account.email
                      )}
                    </td>
                    <td>
                      {editingId === account.id ? (
                        <Checkbox
                          name="admin"
                          checked={editForm.admin || false}
                          onChange={handleChange}
                        />
                      ) : account.admin ? (
                        "Yes"
                      ) : (
                        "No"
                      )}
                    </td>
                    <td>
                      {editingId === account.id ? (
                        <>
                          <Button
                            size="sm"
                            color="primary"
                            onClick={() => handleSave(account.id)}
                            disabled={saveLoading}
                            startDecorator={
                              saveLoading ? (
                                <CircularProgress size="sm" />
                              ) : null
                            }
                            sx={{ mr: 1 }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            color="neutral"
                            onClick={handleCancel}
                            disabled={saveLoading}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            color="neutral"
                            onClick={() => handleEdit(account)}
                          >
                            Edit
                          </Button>
                          {account.id !== data?.user?.id && (
                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => handleDelete(account.id)}
                              sx={{ ml: 1 }}
                            >
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Sheet>
      )}
    </Box>
  );
};
