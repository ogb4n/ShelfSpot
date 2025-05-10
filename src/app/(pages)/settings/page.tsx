"use client";

import { useEffect, useState } from "react";
import { ChangeEvent, FormEvent } from "react";

// Types pour la session et les utilisateurs
interface User {
  id: number;
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
    setMessage(data.message || data.error || "Nom mis à jour.");
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
    setMessage(data.message || data.error || "Email mis à jour.");
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!session) return;
    if (userForm.password !== userForm.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    const res = await fetch("/api/user/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.user.id, password: userForm.password, confirmPassword: userForm.confirmPassword }),
    });
    const data = await res.json();
    setMessage(data.success ? "Mot de passe mis à jour." : data.error || "Erreur lors de la mise à jour du mot de passe.");
  };

  if (!session) return <div className="p-8 theme-bg">Chargement…</div>;

  return (
    <main className="flex min-h-screen items-center justify-center p-8 theme-bg">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl font-bold mb-4">Paramètres</h1>
        {session.user.admin && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Utilisateurs du site</h2>
            {loadingUsers ? (
              <div>Chargement des utilisateurs…</div>
            ) : (
              <ul className="border rounded p-2 theme-card theme-border">
                {users.map((u) => (
                  <li key={u.id} className="py-1 flex justify-between">
                    <span>{u.name || u.email} {u.admin && <span className="text-xs text-blue-600">[admin]</span>}</span>
                    <span className="text-gray-500 text-xs">{u.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Modifier mes informations</h2>
          {message && <div className="mb-2 text-blue-600">{message}</div>}
          <form onSubmit={handleNameChange} className="mb-4 flex gap-2 items-end">
            <div>
              <label className="block text-sm">Pseudo</label>
              <input name="name" value={userForm.name} onChange={handleChange} className="theme-input rounded px-2 py-1" />
            </div>
            <button type="submit" className="theme-primary px-4 py-1 rounded">Modifier</button>
          </form>
          <form onSubmit={handleEmailChange} className="mb-4 flex gap-2 items-end">
            <div>
              <label className="block text-sm">Email</label>
              <input name="email" value={userForm.email} onChange={handleChange} className="theme-input rounded px-2 py-1" />
            </div>
            <button type="submit" className="theme-primary px-4 py-1 rounded">Modifier</button>
          </form>
          <form onSubmit={handlePasswordChange} className="flex gap-2 items-end">
            <div>
              <label className="block text-sm">Nouveau mot de passe</label>
              <input name="password" type="password" value={userForm.password} onChange={handleChange} className="theme-input rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm">Confirmer</label>
              <input name="confirmPassword" type="password" value={userForm.confirmPassword} onChange={handleChange} className="theme-input rounded px-2 py-1" />
            </div>
            <button type="submit" className="theme-primary px-4 py-1 rounded">Modifier</button>
          </form>
        </section>
      </div>
    </main>
  );
}
