"use client";
import React, { useState, useEffect } from "react";

interface AddIncomeFormProps {
  userId: number;
}

export const AddIncomeForm: React.FC<AddIncomeFormProps> = ({ userId }) => {
  const [walletId, setWalletId] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [wallets, setWallets] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await fetch(
          `/api/accounting/wallet/personnal?userId=${userId}`
        );
        const data = await res.json();
        setWallets(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWallets();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const response = await fetch("/api/accounting/income/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, amount, description }),
      });
      if (!response.ok) {
        throw new Error("Failed to create income.");
      }
      setSuccess(true);
      setWalletId(0);
      setAmount(0);
      setDescription("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={walletId}
        onChange={(e) => setWalletId(Number(e.target.value))}
      >
        <option value={0} disabled>
          Select a wallet
        </option>
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <textarea
        placeholder="Income Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Income"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Income added successfully!</p>}
    </form>
  );
};
